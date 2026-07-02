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
import type { ValveSettings } from "./components/SettingsModal";
import type { FluidOption, SensorPayload } from "./types";

import {
  fluidOptions,
  limitParameters,
  pidParameters,
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

// step_resolution: hardware.yaml ile eşleşmeli (varsayılan 1000)
//const [stepResolution, setStepResolution] = useState<number>(1000);
// ----------------------------------------------------------------
// SensorPayload → Sensör kartı değerlerine dönüştürme
// ----------------------------------------------------------------

function payloadToCardValues(
  payload: SensorPayload | null,
  stepResolution: number
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
  const maxTicks   = (payload.total_turns ?? 0) * stepResolution;
  const openingPct = maxTicks > 0
    ? (payload.motor_pos_ticks / maxTicks) * 100
    : 0;
  
  return {
    // Basınç sensörü şu an register haritasında yok → 0.0
    giris:    payload.p1_raw.toFixed(2),
    cikis:    payload.p2_raw.toFixed(2),
    fark:     (payload.p1_raw - payload.p2_raw).toFixed(2),
    // Debi hesaplama: şimdilik akım mA değerini ham göster
    debi:     payload.motor_current_ma.toFixed(2),
    // Pozisyon: tur.adım formatında
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
  } = useWebSocket();

  // ---------- UI State ----------
  const [activeMode,     setActiveMode]     = useState<Mode>("Basınç");
  const [selectedFluid,  setSelectedFluid]  = useState<FluidOption | null>(null);
 
  const [settingsOpen,   setSettingsOpen]   = useState(false);
  const [showMotorControl, setShowMotorControl] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(3);
  const t0Ref = useRef<number>(0);
  const [stepResolution, setStepResolution] = useState<number>(1000);
  const [valveSettings, setValveSettings] = useState<ValveSettings>({
  orifice_diameter_mm: 10.0,
  thread_pitch_mm:     1.5,
  max_stroke_mm:       15.0,
  cd:                  0.65,
});

useEffect(() => {
  fetch("http://localhost:8000/settings")
    .then(r => r.json())
    .then(data => {
      if (data.ok && data.hardware) {
        setValveSettings(prev => ({
          orifice_diameter_mm: data.hardware.orifice_diameter_mm ?? prev.orifice_diameter_mm,
          thread_pitch_mm:     data.hardware.thread_pitch_mm     ?? prev.thread_pitch_mm,
          max_stroke_mm:       data.hardware.max_stroke_mm       ?? prev.max_stroke_mm,
          cd:                  data.hardware.cd                  ?? prev.cd,
        }));
setStepResolution(data.hardware.step_resolution ?? 1000);
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
    () => payloadToCardValues(sensorData, stepResolution),
    [sensorData, stepResolution]
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
      debi:    p.motor_current_ma,
      aciklik: Math.floor(p.motor_pos_ticks / stepResolution),
  }));
  }, [sensorHistory, stepResolution]);

  const pressureData = useMemo(() => {
    if (sensorHistory.length === 0) return [];
    if (t0Ref.current === 0 || sensorHistory[0].timestamp < t0Ref.current) {
    t0Ref.current = sensorHistory[0].timestamp;
}

    return sensorHistory.map((p) => ({
      time:   p.timestamp - t0Ref.current,
      p1:     p.p1_raw,
      p2:     p.p2_raw,
      deltaP: p.p1_raw - p.p2_raw,
  }));
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
  const openingPressureData = useMemo(() => [], []);
  const openingFlowData     = useMemo(() => [], []);
  const cvData              = useMemo(() => [], []);

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

  const handleConnect = useCallback(() => {
      t0Ref.current = 0;
      clearHistory();
      connect();
      console.info("Grafikler sıfırlandı.");
    }, [connect, clearHistory]);

  const handleReset = useCallback(() => {
      t0Ref.current = 0;
      clearHistory();
      console.info("Grafikler sıfırlandı.");
    }, [clearHistory]);

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
        />
    )}
    
    <div className="app-shell" style={{ paddingTop: 8 + bannerOffset }}>
      {/* Kalibrasyon Durumu Badge */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 16,
          background: sensorData?.calibration_status === 1 ? "#166534" : "#7f1d1d",
          color: "white",
          borderRadius: 8,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 600,
          zIndex: 9997,
          letterSpacing: "0.5px",
        }}
      >
        {sensorData?.calibration_status === 1 ? "✔ Kalibre" : "✘ Kalibre Değil"}
      </div>

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
       onSaved={(s) => {
          setValveSettings(s.valve);
          setDecimalPlaces(s.decimal_places ?? 3);
          setStepResolution(s.hardware.step_resolution ?? 1000);
          console.log("Ayarlar güncellendi", s);
        }}
      />

      {/* Sağ: Parametre Paneli */}
      <aside className="right-sidebar">
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            onClick={handleConnect}
            disabled={connectionStatus === "connecting" || connectionStatus === "connected"}
            style={{ flex: 1 }}
          >
            {connectionStatus === "connecting" ? "⏳ Bağlanıyor..." : "▶ Bağlan"}
          </button>
          <button
            onClick={disconnect}
            disabled={connectionStatus === "disconnected"}
            style={{ flex: 1 }}
          >
            ■ Bağlantıyı Kes
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
