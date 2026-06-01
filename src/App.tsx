// src/App.tsx
//
// Değişiklikler:
//   - mockData'dan gelen sabit sensör değerleri kaldırıldı.
//   - useWebSocket hook'u bağlandı — gerçek SensorPayload akışı.
//   - sensorHistory grafiklere besleniyor (FlowPoint, PressurePoint vb.)
//   - Bağlantı durum göstergesi (ConnectionStatus) eklendi.
//   - Grafik sıfırlama artık gerçekten sensorHistory'yi temizliyor.

import { useState, useCallback, useMemo } from "react";
import "./App.css";

import { SensorCard }        from "./components/SensorCard";
import { ControlModePanel }  from "./components/ControlModePanel";
import { ChartsPanel }       from "./components/ChartsPanel";
import { ParameterSection }  from "./components/ParameterPanel";
import { FluidSelector }     from "./components/FluidSelector";
import { SettingsModal }     from "./components/SettingsModal";
import { MotorControlModal } from "./components/MotorControlModal";

import {
  fluidOptions,
  geometryParameters,
  limitParameters,
  pidParameters,
} from "./data/mockData";
import { sensorCards } from "./data/sensorConfig";

import { useWebSocket }      from "./hooks/useWebSocket.ts";
import type { FluidOption, SensorPayload } from "./types";

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
  pitch: "", orifice: "", coneAngle: "", cd: "",
  maxP1: "", maxDeltaP: "", maxOpen: "", estop: "",
};

// step_resolution: hardware.yaml ile eşleşmeli (varsayılan 1000)
const STEP_RESOLUTION = 1000;

// ----------------------------------------------------------------
// SensorPayload → Sensör kartı değerlerine dönüştürme
// ----------------------------------------------------------------

function payloadToCardValues(
  payload: SensorPayload | null,
  stepResolution: number
): Record<string, string> {
  if (!payload) return {};

  const posRev  = Math.floor(payload.motor_pos_ticks / stepResolution);
  const posStep = payload.motor_pos_ticks % stepResolution;
  // Açıklık % = (tur * adım_çözünürlüğü + adım) / max_tick × 100
  // max_tick bilgisi backend'den gelmeli; şimdilik pozisyon tick olarak gösteriyoruz.
  const openingPct = posRev + posStep / stepResolution; // tur cinsinden

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
    () => payloadToCardValues(sensorData, STEP_RESOLUTION),
    [sensorData]
  );

  // Grafik için SensorPayload geçmişini mevcut tiplere dönüştür.
  // Backend timestamp'ı (monotonic saniye) kullanılır; t0'dan itibaren geçen süre [s].
  const flowData = useMemo(() => {
    const t0 = sensorHistory[0]?.timestamp ?? 0;
    return sensorHistory.map((p) => ({
      time:    p.timestamp - t0,
      debi:    p.motor_current_ma,
      aciklik: Math.floor(p.motor_pos_ticks / STEP_RESOLUTION),
    }));
  }, [sensorHistory]);

  const pressureData = useMemo(() => {
    const t0 = sensorHistory[0]?.timestamp ?? 0;
    return sensorHistory.map((p) => ({
      time:   p.timestamp - t0,
      p1:     p.p1_raw,
      p2:     p.p2_raw,
      deltaP: p.p1_raw - p.p2_raw,
    }));
  }, [sensorHistory]);

  const openingTimeData = useMemo(() => {
    const t0 = sensorHistory[0]?.timestamp ?? 0;
    return sensorHistory.map((p) => ({
      time:    p.timestamp - t0,
      aciklik: Math.floor(p.motor_pos_ticks / STEP_RESOLUTION),
    }));
  }, [sensorHistory]);

  const currentTimeData = useMemo(() => {
    const t0 = sensorHistory[0]?.timestamp ?? 0;
    return sensorHistory.map((p) => ({
      time: p.timestamp - t0,
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
  }, [activeMode]);

  const handleReset = useCallback(() => {
      clearHistory();
      console.info("Grafikler sıfırlandı.");
    }, [clearHistory]);

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
          onReset={handleReset}
        />
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={(s) => console.log("Ayarlar güncellendi", s)}
      />

      {/* Sağ: Parametre Paneli */}
      <aside className="right-sidebar">
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            onClick={connect}
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
        <ParameterSection
          title="Geometri & Kalibrasyon"
          items={geometryParameters}
          values={currentFormValues}
          onChange={handleInputChange}
        />
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
