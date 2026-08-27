// src/App.tsx
//
// Değişiklikler:
//   - mockData'dan gelen sabit sensör değerleri kaldırıldı.
//   - useWebSocket hook'u bağlandı — gerçek SensorPayload akışı.
//   - sensorHistory grafiklere besleniyor (FlowPoint, PressurePoint vb.)
//   - Bağlantı durum göstergesi (ConnectionStatus) eklendi.
//   - Grafik sıfırlama artık gerçekten sensorHistory'yi temizliyor.

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import "./App.css";

import { SensorCard }        from "./components/SensorCard";
import { ControlModePanel }  from "./components/ControlModePanel";
import { ChartsPanel }       from "./components/ChartsPanel";
import { ParameterSection }  from "./components/ParameterPanel";
import { FluidSelector }     from "./components/FluidSelector";
import { SettingsModal }     from "./components/SettingsModal";
import { MotorControlModal } from "./components/MotorControlModal";
import { sensorCards } from "./data/sensorConfig";
import { useWebSocket }      from "./hooks/useWebSocket.ts";

import type { FluidOption, SensorPayload } from "./types";
import type { ValveSettings, AppSettings } from "./components/SettingsModal";

import {
  fluidOptions,
  limitParameters,
  pidParameters,
  fuzzyParameters,
  adaptParameters,
} from "./data/mockData";

// ----------------------------------------------------------------
// Sabitler
// ----------------------------------------------------------------

type Mode = "Basınç" | "Pozisyon" | "Regülatör" | "Debi";

const modeToCardId: Record<Mode, string | null> = {
  "Basınç":    "fark",
  "Debi":      "debi",
  "Pozisyon":  "pozisyon",
  "Regülatör": null,
};

const emptyFormValues: Record<string, string> = {
  kp: "", ki: "", kd: "", sampleTime: "", filterFc: "",
  setpoint: "", deadband: "",
  maxP1: "", maxDeltaP: "", maxOpen: "", estop: "",
};

// Form string → sayı. Boş/geçersizse null döner (o komut GÖNDERİLMEZ).
function parseNum(s: string | undefined): number | null {
  if (s === undefined || s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function safeNum(n: number | undefined | null, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function getOpeningPct(payload: SensorPayload, stepResolution: number): number {
  if (typeof payload.opening_pct === "number" && Number.isFinite(payload.opening_pct)) {
    return clamp(payload.opening_pct, 0, 100);
  }

  const maxTicks = (payload.total_turns ?? 0) * stepResolution;
  if (maxTicks <= 0) return 0;

  return clamp((payload.motor_pos_ticks / maxTicks) * 100, 0, 100);
}

// Geçici frontend debi hesabı.
// Backend mass_flow_kg_s göndermeye başlarsa otomatik onu kullanır.
function estimateAirMassFlowKgS(
  payload: SensorPayload,
  stepResolution: number,
  valveSettings: ValveSettings
): number {
  if (
    typeof payload.mass_flow_kg_s === "number" &&
    Number.isFinite(payload.mass_flow_kg_s)
  ) {
    return Math.max(0, payload.mass_flow_kg_s);
  }

  const p1 = safeNum(payload.p1_raw);
  const p2 = safeNum(payload.p2_raw);
  const deltaPBar = Math.max(0, p1 - p2);
  const openingPct = getOpeningPct(payload, stepResolution);

  if (deltaPBar <= 0 || openingPct <= 0) return 0;

  const cd = valveSettings.cd ?? 0.65;
  const dM = (valveSettings.orifice_diameter_mm ?? 10) / 1000.0;
  const fullArea = Math.PI * dM * dM / 4.0;
  const effectiveArea = fullArea * (openingPct / 100.0);

  // Yaklaşık hava yoğunluğu. Görsel trend için yeterli; nihai hassas hesabı backend'e almak daha doğru.
  const tempK = 293.15;
  const rAir = 287.05;
  const pAvgBar = Math.max((p1 + p2) / 2.0, 1.01325);
  const rho = (pAvgBar * 1e5) / (rAir * tempK);

  return cd * effectiveArea * Math.sqrt(2.0 * deltaPBar * 1e5 * rho);
}

// step_resolution: hardware.yaml ile eşleşmeli (varsayılan 1000)
//const [stepResolution, setStepResolution] = useState<number>(1000);
// ----------------------------------------------------------------
// SensorPayload → Sensör kartı değerlerine dönüştürme
// ----------------------------------------------------------------

function payloadToCardValues(
  payload: SensorPayload | null,
  stepResolution: number,
  valveSettings: ValveSettings
): Record<string, string> {
  if (!payload) return {};

  //const posRev  = Math.floor(payload.motor_pos_ticks / stepResolution);
  //const posStep = payload.motor_pos_ticks % stepResolution;
  // Açıklık % = (tur * adım_çözünürlüğü + adım) / max_tick × 100
  // max_tick bilgisi backend'den gelmeli; şimdilik pozisyon tick olarak gösteriyoruz.
  //const openingPct = posRev + posStep / stepResolution; // tur cinsinden

  // Açıklık % = motor_pos_ticks / (total_turns × step_resolution) × 100
  // total_turns (addr 1): firmware kalibrasyonda bu değeri set eder.
  // Kalibrasyon yapılmamışsa (total_turns = 0 / undefined) → 0 göster.
  //const maxTicks   = (payload.total_turns ?? 0) * stepResolution;
  //const openingPct = maxTicks > 0
  //  ? (payload.motor_pos_ticks / maxTicks) * 100
  //  : 0;

  const openingPct = getOpeningPct(payload, stepResolution);
  const flowKgS = estimateAirMassFlowKgS(payload, stepResolution, valveSettings);

  
  const p1 = safeNum(payload.p1_raw);
  const p2 = safeNum(payload.p2_raw);

  return {
    giris:    p1.toFixed(2),
    cikis:    p2.toFixed(2),
    fark:     Math.max(0, p1 - p2).toFixed(2),
    debi:     flowKgS.toFixed(4),
    pozisyon: openingPct.toFixed(2),
  };
  
}

// ----------------------------------------------------------------
// App
// ----------------------------------------------------------------

function App() {
  // ---------- WebSocket ----------
  const {
    sensorData,
    sensorHistory,
    alarmList,
    connectionStatus,
    sendMessage,
    clearAlarms,
    connect,
    disconnect,
    clearHistory,
    deviceConnected,
    
  } = useWebSocket(true);

  // ---------- UI State ----------
  const [activeMode,     setActiveMode]     = useState<Mode>("Basınç");
  const [selectedFluid,  setSelectedFluid]  = useState<FluidOption | null>(null);
 
  const [settingsOpen,   setSettingsOpen]   = useState(false);
  const [showMotorControl, setShowMotorControl] = useState(false);
    // ---- Ortak hedef pozisyon ----
  // targetTicks === null  → kullanıcı bir şey yazmıyor, kutular CANLI pozisyonu izler.
  // targetTicks !== null  → kullanıcı hedef giriyor; yüzde ve tick kutuları
  //                          bu tek değerin iki gösterimi.
  const [targetTicks, setTargetTicks] = useState<number | null>(null);
  const [pctText,     setPctText]     = useState<string>("");
  const [pidAlgorithm, setPidAlgorithm] = useState<1 | 2 | 3>(1);
  const [decimalPlaces, setDecimalPlaces] = useState(3);
  const t0Ref = useRef<number>(0);
  const [stepResolution, setStepResolution] = useState<number>(4096);
  const [valveSettings, setValveSettings] = useState<ValveSettings>({
  orifice_diameter_mm: 10.0,
  thread_pitch_mm:     1.5,
  max_stroke_mm:       15.0,
  cd:                  0.65,
});

useEffect(() => {
  fetch("/settings")
    .then(r => r.json())
    .then(data => {
      if (data.ok && data.hardware) {
        setValveSettings(prev => ({
          orifice_diameter_mm: data.hardware.orifice_diameter_mm ?? prev.orifice_diameter_mm,
          thread_pitch_mm:     data.hardware.thread_pitch_mm     ?? prev.thread_pitch_mm,
          max_stroke_mm:       data.hardware.max_stroke_mm       ?? prev.max_stroke_mm,
          cd:                  data.hardware.cd                  ?? prev.cd,
        }));
setStepResolution(data.hardware.step_resolution ?? 4096);
setDecimalPlaces(data.hardware.decimal_places ?? 3);
      }
    })
    .catch(() => {});
}, []);
  const [modeValues, setModeValues] = useState<Record<Mode, Record<string, string>>>({
    "Basınç":    { ...emptyFormValues },
    "Pozisyon":  { ...emptyFormValues },
    "Regülatör": { ...emptyFormValues },
    "Debi":      { ...emptyFormValues },
  });

  // Kullanıcının düzenleyebildiği sensör kartı değerleri (setpoint girişi)
  const createEmptySensorValues = () =>
    Object.fromEntries(sensorCards.map((c) => [c.id, ""]));

  const [modeSensorValues, setModeSensorValues] = useState<Record<Mode, Record<string, string>>>({
    "Basınç":    createEmptySensorValues(),
    "Pozisyon":  createEmptySensorValues(),
    "Regülatör": createEmptySensorValues(),
    "Debi":      createEmptySensorValues(),
  });

  // ---------- Türetilmiş veriler ----------

  // Backend'den gelen anlık sensör değerleri (salt okunur kartlar için)
  const liveSensorValues = useMemo(
    () => payloadToCardValues(sensorData, stepResolution, valveSettings),
    [sensorData, stepResolution, valveSettings]
  );

  // Grafik için SensorPayload geçmişini mevcut tiplere dönüştür.
  // Backend timestamp'ı (monotonic saniye) kullanılır; t0'dan itibaren geçen süre [s].
  const flowData = useMemo(() => {
    if (sensorHistory.length === 0) return [];
    if (t0Ref.current === 0 || sensorHistory[0].timestamp < t0Ref.current) {
    t0Ref.current = sensorHistory[0].timestamp;
}

    return sensorHistory.map((p) => ({
      time:    p.timestamp - t0Ref.current,
      debi:    estimateAirMassFlowKgS(p, stepResolution, valveSettings),
      aciklik: getOpeningPct(p, stepResolution),
  }));
  }, [sensorHistory, stepResolution, valveSettings]);

  const pressureData = useMemo(() => {
    if (sensorHistory.length === 0) return [];
    if (t0Ref.current === 0 || sensorHistory[0].timestamp < t0Ref.current) {
    t0Ref.current = sensorHistory[0].timestamp;
}

    return sensorHistory.map((p) => {
    const p1 = safeNum(p.p1_raw);
    const p2 = safeNum(p.p2_raw);

    return {
      time:   p.timestamp - t0Ref.current,
      p1,
      p2,
      deltaP: Math.max(0, p1 - p2),
    };
  });
  }, [sensorHistory]);

  const openingTimeData = useMemo(() => {
    if (sensorHistory.length === 0) return [];
    if (t0Ref.current === 0 || sensorHistory[0].timestamp < t0Ref.current) {
    t0Ref.current = sensorHistory[0].timestamp;
}

    return sensorHistory.map((p) => ({
      time:    p.timestamp - t0Ref.current,
      aciklik: (p.total_turns ?? 0) > 0
        ? (p.motor_pos_ticks / ((p.total_turns ?? 0) * stepResolution)) * 100
        : 0,
  }));
  }, [sensorHistory, stepResolution]);

  const currentTimeData = useMemo(() => {
    if (sensorHistory.length === 0) return [];
    if (t0Ref.current === 0 || sensorHistory[0].timestamp < t0Ref.current) {
    t0Ref.current = sensorHistory[0].timestamp;
}

    return sensorHistory.map((p) => ({
      time: p.timestamp - t0Ref.current,
      akim: p.motor_current_ma,
      }));
  }, [sensorHistory]);

  // Açıklık-basınç ve açıklık-debi grafikleri için (şimdilik boş — basınç yok)
  const openingPressureData = useMemo(
    () =>
      pressureData.map((p, i) => ({
        opening: flowData[i]?.aciklik ?? 0,
        p1: p.p1,
        p2: p.p2,
        deltaP: p.deltaP,
      })),
    [pressureData, flowData]
  );

  const openingFlowData = useMemo(
    () =>
      flowData.map((p) => ({
        opening: p.aciklik,
        debi: p.debi,
      })),
    [flowData]
  );

  const cvData = useMemo(() => [], []);
    // ---------- Ortak hedef: türetilmiş değerler ----------

  const currentTicks = sensorData?.motor_pos_ticks ?? 0;

  // %100 referansı: cihazın bildirdiği tur sayısı × adım çözünürlüğü
  const maxTicks = (sensorData?.total_turns ?? 0) * stepResolution;

  const ticksToPct = useCallback(
    (t: number) => (maxTicks > 0 ? (t * 100) / maxTicks : 0),
    [maxTicks]
  );

  // Kutularda gösterilecek değerler
  const displayTicks = targetTicks ?? currentTicks;
  const displayPct   = targetTicks === null
    ? (maxTicks > 0 ? ticksToPct(currentTicks).toFixed(1) : "")
    : pctText;
  // ---------- Handlers ----------

  const handleInputChange = useCallback((key: string, value: string) => {
    setModeValues((prev) => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], [key]: value },
    }));
  }, [activeMode]);

  const handleSensorValueChange = useCallback((id: string, value: string) => {
    setModeSensorValues((prev) => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], [id]: value },
    }));
    const editableId = modeToCardId[activeMode];
  if (id === editableId) {
    setModeValues((prev) => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], setpoint: value },
    }));
  }
  }, [activeMode]);

  const handleSettingsSaved = useCallback((s: AppSettings) => {
    setValveSettings(s.valve);
    setDecimalPlaces(s.decimal_places ?? 3);
    setStepResolution(s.hardware.step_resolution ?? 4096);

    if (connectionStatus !== "connected") {
      t0Ref.current = 0;
      connect();
    }
  }, [connect, connectionStatus]);

  const handleToggleConnection = useCallback(() => {
    if (connectionStatus === "disconnected") {
      t0Ref.current = 0;   // yeni zaman ekseni
      connect();
    } else {
      disconnect();        // otomatik yeniden bağlanmayı da durdurur
    }
  }, [connectionStatus, connect, disconnect]);

  const handleReset = useCallback(() => {
      t0Ref.current = 0;
      clearHistory();
      console.info("Grafikler sıfırlandı.");
    }, [clearHistory]);

  // Yüzde kutusuna yazıldı → ortak hedefi güncelle (tick kutusu anında karşılığını gösterir)
  const setTargetFromPct = useCallback((text: string) => {
    setPctText(text);
    const n = parseNum(text);
    if (n === null || maxTicks <= 0) {
      setTargetTicks(null);          // kutu boşaltıldı → canlı pozisyona dön
      return;
    }
    setTargetTicks(Math.round((clamp(n, 0, 100) * maxTicks) / 100));
  }, [maxTicks]);

  // Tick kutusuna yazıldı (Motor Kontrol) → ortak hedefi güncelle, yüzdeyi tazele
  const setTargetFromTicks = useCallback((ticks: number) => {
    const t = maxTicks > 0
      ? Math.round(clamp(ticks, 0, maxTicks))
      : Math.max(0, Math.round(ticks));
    setTargetTicks(t);
    setPctText(maxTicks > 0 ? ((t * 100) / maxTicks).toFixed(1) : "");
  }, [maxTicks]);

  // Tek gönderim noktası — hem "Git" hem "Pozisyona Git" bunu çağırır
  const handleGoto = useCallback(() => {
    if (!sensorData || sensorData.calibration_status !== 1) {
      alert("Önce kalibrasyon tamamlanmalı.");
      return;
    }
    if (maxTicks <= 0) {
      alert("Cihazdan geçerli tur bilgisi gelmiyor (total_turns = 0). Kalibrasyonu tekrarlayın.");
      return;
    }
    const target = targetTicks ?? currentTicks;
    if (target < 0 || target > maxTicks) {
      alert(`Hedef 0 – ${maxTicks} tick aralığında olmalı.`);
      return;
    }

    sendMessage({ type: "SET_MODE",     payload: { mode: 3 } });
    sendMessage({ type: "DIGITAL_STEP", payload: { step: target } });

    // Komut gitti → kutular tekrar canlı pozisyonu izlesin
    setTargetTicks(null);
    setPctText("");
  }, [sensorData, maxTicks, targetTicks, currentTicks, sendMessage]);

  const handleQuickStop = useCallback(() => {
    sendMessage({ type: "STOP", payload: {} });
  }, [sendMessage]);

  // PID parametrelerini cihaza gönder. Boş alanlar atlanır (kazara 0 yazılmaz).
  // Kazançlar atomik (FC16) olduğu için Kp/Ki/Kd ÜÇÜ birden dolu olmalı.
  const handleApplyPid = useCallback(() => {
    const f = modeValues[activeMode];
    const sp = parseNum(f.setpoint);
    const db = parseNum(f.deadband);
    const kp = parseNum(f.kp), ki = parseNum(f.ki), kd = parseNum(f.kd);

    if (sp !== null) sendMessage({ type: "SET_PID_SETPOINT", payload: { setpoint: sp } });
    if (db !== null) sendMessage({ type: "SET_PID_DEADBAND", payload: { deadband: db } });
    if (kp !== null && ki !== null && kd !== null) {
      sendMessage({ type: "SET_PID_GAINS", payload: { kp, ki, kd } });
    } else if (kp !== null || ki !== null || kd !== null) {
      console.warn("Kp, Ki, Kd üçü birden dolu olmalı — kazançlar gönderilmedi.");
    }
    console.info("PID parametreleri gönderildi.");
  }, [modeValues, activeMode, sendMessage]);

  const handleSelectAlgorithm = useCallback((algo: 1 | 2 | 3) => {
    setPidAlgorithm(algo);
    sendMessage({ type: "SET_PID_ALGORITHM", payload: { algorithm: algo } });
  }, [sendMessage]);

  const handleApplyFuzzy = useCallback(() => {
    const f = modeValues[activeMode];
    const kiSpan = parseNum(f.fuzzyKiSpan);
    if (kiSpan !== null && kiSpan > 30) {
      const ok = window.confirm(
        `Ki derinliği %${kiSpan} — %30 üzeri kalıcı salınım (hunting) riski taşır. Yine de gönderilsin mi?`
      );
      if (!ok) return;
    }
    sendMessage({
      type: "SET_FUZZY_PARAMS",
      payload: {
        err_scale:  parseNum(f.fuzzyErrScale)  ?? 2.0,
        derr_scale: parseNum(f.fuzzyDerrScale) ?? 1.0,
        kp_span:    parseNum(f.fuzzyKpSpan)    ?? 50,
        ki_span:    kiSpan ?? 25,
        kd_span:    parseNum(f.fuzzyKdSpan)    ?? 50,
      },
    });
  }, [modeValues, activeMode, sendMessage]);

  const handleApplyAdapt = useCallback(() => {
    const f = modeValues[activeMode];
    sendMessage({
      type: "SET_ADAPT_PARAMS",
      payload: {
        rate:      parseNum(f.adaptRate)     ?? 0.020,
        gain_min:  parseNum(f.adaptGainMin)  ?? 50,
        gain_max:  parseNum(f.adaptGainMax)  ?? 300,
        window_ms: parseNum(f.adaptWindowMs) ?? 2000,
        osc_limit: parseNum(f.adaptOscLimit) ?? 3,
      },
    });
  }, [modeValues, activeMode, sendMessage]);

// Cihaz tek doğru kaynak: yöntem yazma reddedilirse (Rev 2 §4.3 — echo
  // gelse bile uygulanmayabilir) seçici otomatik gerçek değere geri döner.
  useEffect(() => {
    const devAlgo = sensorData?.pid_algorithm;
    if (devAlgo === 1 || devAlgo === 2 || devAlgo === 3) {
      setPidAlgorithm(devAlgo);
    }
  }, [sensorData?.pid_algorithm]);

  // Sensör (ADC) kalibrasyonunu cihaza gönder.

  const currentFormValues     = modeValues[activeMode];
  const currentUserSensorValues = modeSensorValues[activeMode];

  



  // ---------- Render ----------
  const bannerCount =
    (connectionStatus === "connecting" ? 1 : 0) +
    (alarmList.length > 0 ? 1 : 0);
  const bannerOffset = bannerCount * 34; // her banner ~34px

  return (

    <>
        {showMotorControl && (
        <MotorControlModal
          onClose={() => setShowMotorControl(false)}
          sendMessage={sendMessage}
          connectionStatus={connectionStatus}
          latestPacket={sensorData}
          valveSettings={valveSettings}
          targetTicks={displayTicks}
          maxTicks={maxTicks}
          onTargetTicksChange={setTargetFromTicks}
          onGoto={handleGoto}
        />
    )}
    
    <div className="app-shell" style={{ paddingTop: 8 + bannerOffset }}>
      
      {/* Bağlantı Durum Bandı — sadece aktif bağlanma sırasında */}
      {connectionStatus === "connecting" && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            background: "#b45309",
            color: "white",
            textAlign: "center",
            padding: "6px",
            fontSize: "13px",
            zIndex: 9999,
          }}
        >
          ⏳ Backend'e bağlanılıyor...
        </div>
      )}

      {/* Alarm Bandı */}
      {alarmList.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: connectionStatus === "connecting" ? 34 : 0,
            left: 0, right: 0,
            background: "#7f1d1d",
            color: "white",
            textAlign: "center",
            padding: "6px",
            fontSize: "13px",
            zIndex: 9998,
            cursor: "pointer",
          }}
          onClick={clearAlarms}
        >
          🚨 {alarmList[0].reason} &nbsp;
          <span style={{ opacity: 0.7 }}>(kapatmak için tıkla)</span>
        </div>
      )}

      {/* Sol: Sensör Kartları */}
      <aside className="left-sidebar">
        {sensorCards.map((item) => {
          const editableId = modeToCardId[activeMode];
          const editable   = editableId === item.id;

          // Düzenlenebilir kart: kullanıcı setpoint giriyor
          // Kilitli kart: backend'den gelen anlık değer gösteriliyor
          const displayValue = editable
            ? (currentUserSensorValues[item.id] ?? "")
            : (liveSensorValues[item.id] ?? "—");

          return (
            <SensorCard
              key={item.id}
              item={item}
              value={displayValue}
              editable={editable}
              onValueChange={(val) => handleSensorValueChange(item.id, val)}
            />
          );
        })}
      </aside>

      {/* Orta: Grafikler */}
      <main className="main-content">
        <div className="top-row">
          <FluidSelector
            title="Akışkan"
            options={fluidOptions}
            selectedFluid={selectedFluid}
            onSelect={setSelectedFluid}
          />
          <ControlModePanel activeMode={activeMode} onChange={setActiveMode} />
          <button onClick={() => setSettingsOpen(true)}>⚙️ Ayarlar</button>
            {/* YENİ */}
            <button
              onClick={() => setShowMotorControl(true)}
              disabled={connectionStatus !== "connected"}
              style={{
                background: connectionStatus === "connected" ? "#007f78" : "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontWeight: 600,
                cursor: connectionStatus === "connected" ? "pointer" : "not-allowed",
                fontSize: 13,
              }}
            >
              ⚙ Motor Kontrol
            </button>
        </div>

        <div className="quick-control-bar">
          <span className="quick-control-label">Hızlı Kontrol(%)</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={displayPct}
            onChange={(e) => setTargetFromPct(e.target.value)}
            placeholder="Açıklık %"
            className="quick-control-input"
            disabled={connectionStatus !== "connected"}
          />
          <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
            = {displayTicks} tick{maxTicks > 0 ? ` / ${maxTicks}` : ""}
            {targetTicks === null && " (canlı)"}
          </span>
          <button
            className="quick-control-btn quick-control-goto"
            onClick={handleGoto}
            disabled={connectionStatus !== "connected"}
          >
            Git
          </button>
          <button
            className="quick-control-btn quick-control-stop"
            onClick={handleQuickStop}
            disabled={connectionStatus !== "connected"}
          >
            ■ Durdur
          </button>
        </div>

        <ChartsPanel
          activeMode={activeMode}
          flowData={flowData}
          pressureData={pressureData}
          openingTimeData={openingTimeData}
          currentTimeData={currentTimeData}
          openingPressureData={openingPressureData}
          openingFlowData={openingFlowData}
          cvData={cvData}
          decimalPlaces={decimalPlaces}
          onReset={handleReset}
        />
      </main>

       <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={handleSettingsSaved}
      />

      {/* Sağ: Parametre Paneli */}
      <aside className="right-sidebar">
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {/* Tarayıcı ↔ Backend */}
          <span
            style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background:
                connectionStatus === "connected"  ? "#22c55e" :
                connectionStatus === "connecting" ? "#f59e0b" : "#ef4444",
            }}
          />
          <small style={{ color: "#374151" }}>
            {connectionStatus === "connected"  ? "Backend bağlı" :
             connectionStatus === "connecting" ? "Bağlanılıyor..." : "Backend yok"}
          </small>

          {/* Backend ↔ Cihaz (Modbus) */}
          <span
            style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginLeft: 6,
              background: deviceConnected === true ? "#22c55e"
                        : deviceConnected === false ? "#ef4444" : "#9ca3af",
            }}
          />
          <small style={{ color: "#374151" }}>
            {deviceConnected === true  ? "Cihaz yanıt veriyor" :
             deviceConnected === false ? "Cihaz yanıt vermiyor" : "Cihaz durumu bilinmiyor"}
          </small>
          <span
            style={{
              marginLeft: 6,
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              background: sensorData?.calibration_status === 1 ? "#166534" : "#7f1d1d",
            }}
          >
            {sensorData?.calibration_status === 1 ? "✔ Kalibre" : sensorData?.calibration_status === 2 ? "⚠ KALİBRASYON HATASI"
         : "✘ Kalibre Değil"}
          </span>       


          <button
            type="button"
            onClick={handleToggleConnection}
            style={{
              marginLeft: "auto", height: 26, padding: "0 12px",
              border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600,
              cursor: "pointer", color: "#fff",
              background: connectionStatus === "disconnected" ? "#007f78" : "#e53e3e",
            }}
          >
            {connectionStatus === "disconnected" ? "▶ Bağlan" : "■ Kes"}
          </button>
        </div>

        <h2 className="active-mode-title">{activeMode} Modu Parametreleri</h2>

        <ParameterSection
          title="PID/Reg Parametreleri"
          items={pidParameters}
          values={currentFormValues}
          onChange={handleInputChange}
        />
        {sensorData && (
          <div className="param-readback">
            <small>
              Cihazda → SP: {sensorData.pid_setpoint?.toFixed(2) ?? "—"} bar &nbsp;|&nbsp;
              Kp: {sensorData.pid_kp?.toFixed(2) ?? "—"} &nbsp;
              Ki: {sensorData.pid_ki?.toFixed(2) ?? "—"} &nbsp;
              Kd: {sensorData.pid_kd?.toFixed(2) ?? "—"} &nbsp;|&nbsp;
              ÖB: {sensorData.pid_deadband?.toFixed(2) ?? "—"} bar
            </small>
          </div>
        )}
        <button
          type="button"
          className="apply-btn"
          onClick={handleApplyPid}
          disabled={connectionStatus !== "connected"}
        >
          PID Uygula
        </button>
        {/* ---- PID Yöntemi (Rev 2) ---- */}
        <div className="param-section">
          <h3>PID Yöntemi</h3>
          <div className="algo-btn-group">
            {([[1, "Klasik"], [2, "Fuzzy"], [3, "Adaptive"]] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`algo-btn${pidAlgorithm === id ? " active" : ""}`}
                onClick={() => handleSelectAlgorithm(id)}
                disabled={connectionStatus !== "connected"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {pidAlgorithm === 2 && (
          <>
            <ParameterSection
              title="Fuzzy Parametreleri"
              items={fuzzyParameters}
              values={currentFormValues}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="apply-btn"
              onClick={handleApplyFuzzy}
              disabled={connectionStatus !== "connected"}
            >
              Fuzzy Uygula
            </button>
            <div className="param-readback">
              <small>
                Cihazda → Hata öl.: {sensorData?.fuzzy_err_scale?.toFixed(2) ?? "—"} bar &nbsp;|&nbsp;
                dHata öl.: {sensorData?.fuzzy_derr_scale?.toFixed(2) ?? "—"} bar/s<br />
                Derinlik → Kp: %{sensorData?.fuzzy_kp_span ?? "—"} &nbsp;
                Ki: %{sensorData?.fuzzy_ki_span ?? "—"} &nbsp;
                Kd: %{sensorData?.fuzzy_kd_span ?? "—"}
              </small>
            </div>
          </>
        )}

        {pidAlgorithm === 3 && (
          <>
            <ParameterSection
              title="Adaptive Parametreleri"
              items={adaptParameters}
              values={currentFormValues}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="apply-btn"
              onClick={handleApplyAdapt}
              disabled={connectionStatus !== "connected"}
            >
              Adaptive Uygula
            </button>
            <div className="param-readback">
              <small>
                Cihazda → Hız: {sensorData?.adapt_rate?.toFixed(3) ?? "—"} &nbsp;|&nbsp;
                Ölçek: %{sensorData?.adapt_gain_min ?? "—"}–%{sensorData?.adapt_gain_max ?? "—"}<br />
                Pencere: {sensorData?.adapt_window_ms ?? "—"} ms &nbsp;|&nbsp;
                Salınım eşiği: {sensorData?.adapt_osc_limit ?? "—"}
              </small>
            </div>
          </>
        )}

        {/* ---- Aktif PID izleme (34-37) — Fuzzy/Adaptive'in çalıştığını
             kanıtlayan tek alan (Rev 2 §3.7) ---- */}
        <div className="param-readback">
          <small style={{ fontWeight: 600 }}>Aktif PID (cihazda gerçekten devrede)</small><br />
          <small>
            Yöntem:{" "}
            {sensorData?.pid_algorithm === 1 ? "Klasik"
              : sensorData?.pid_algorithm === 2 ? "Fuzzy"
              : sensorData?.pid_algorithm === 3 ? "Adaptive"
              : "—"}<br />
            Kp: {sensorData?.pid_active_kp?.toFixed(2) ?? "—"} &nbsp;
            Ki: {sensorData?.pid_active_ki?.toFixed(2) ?? "—"} &nbsp;
            Kd: {sensorData?.pid_active_kd?.toFixed(2) ?? "—"}<br />
            Çıkış: {sensorData?.pid_output?.toFixed(2) ?? "—"} % strok &nbsp;|&nbsp;
            Servo hata sayacı: {sensorData?.servo_comm_fail ?? "—"}
          </small>
        </div>

          <div className="param-readback">
            <small style={{ fontWeight: 600 }}>Sensör Kalibrasyon (Motor Kontrol'den ayarla)</small><br />
            <small>
              Cihazda → Ofset: {sensorData?.adc_offset?.toFixed(3) ?? "—"} bar &nbsp;|&nbsp;
              Gain: {sensorData?.adc_gain?.toFixed(3) ?? "—"}
            </small>
          </div>

          <div className="param-readback">
            <small style={{ fontWeight: 600 }}>Geometri (Ayarlar → Vana Profili'nden düzenle)</small><br />
            <small>
              Pitch: {valveSettings.thread_pitch_mm} mm &nbsp;|&nbsp;
              Strok: {valveSettings.max_stroke_mm} mm &nbsp;|&nbsp;
              Orifis: {valveSettings.orifice_diameter_mm} mm &nbsp;|&nbsp;
              Cd: {valveSettings.cd}
            </small>
          </div>
          <div className="param-readback">
            <small style={{ fontWeight: 600 }}>Kalibrasyon Durumu (Motor Kontrol'den başlat)</small><br />
            <small>
              {sensorData
                ? `${sensorData.calibration_status === 1 ? "KALİBRE ✓" : "Kalibre değil"} · Pozisyon: ${sensorData.motor_pos_ticks ?? "—"} · Yük: ${sensorData.motor_current_ma?.toFixed(0) ?? "—"} mA · total_turns: ${sensorData.total_turns ?? "—"}`
                : "Veri bekleniyor..."}
            </small>
          </div>


        <ParameterSection
          title="Limitler"
          items={limitParameters}
          values={currentFormValues}
          onChange={handleInputChange}
        />
      </aside>
    </div>
    </>
  );
}

export default App;
