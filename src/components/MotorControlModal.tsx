/**
 * src/components/MotorControlModal.tsx
 *
 * Motor Kontrol Penceresi — Vana Modbus Adres Haritasına göre tam kontrol.
 *
 * Özellikler:
 *   - Gerçek zamanlı pozisyon grafiği (Tur + Adım ayrı gösterim)
 *   - Tork göstergesi
 *   - Mod bazlı kontrol paneli:
 *       Mod 1 (Kalibrasyon) : Yön + Seating + Backoff + Kalibrasyonu Başlat
 *       Mod 3 (Dijital Adım): Hedef tur + adım giriş + gönder
 *       Mod 4 (TTL)         : Tam Aç / Tam Kapat
 *       Diğer modlar        : Bilgi ekranı
 *   - Sensör Kalibrasyon bölümü (ADC offset / gain)
 *   - Yumuşak durdurma butonu (STOP)
 *   - ACİL DURDURMA (iki adımlı onay) — her zaman aktif
 *
 * Props:
 *   onClose          : Pencereyi kapat
 *   sendMessage      : WebSocket komut gönderici (App.tsx'ten)
 *   connectionStatus : "connected" | "connecting" | "disconnected"
 *   latestPacket     : SensorPayload | null
 *   valveSettings    : ValveSettings — pitch/strok kalibrasyon hesabı için
 *
 * Gönderilen WS Komutları:
 *   SET_MODE          → { type: "SET_MODE", payload: { mode: number } }
 *   START_CALIBRATION → { type: "START_CALIBRATION", payload: { ... } }
 *   OPEN_FULL         → { type: "OPEN_FULL", payload: {} }
 *   CLOSE_FULL        → { type: "CLOSE_FULL", payload: {} }
 *   GOTO_POSITION     → { type: "GOTO_POSITION", payload: { turns, step } }
 *   SET_ADC_OFFSET    → { type: "SET_ADC_OFFSET", payload: { offset } }
 *   SET_ADC_GAIN      → { type: "SET_ADC_GAIN", payload: { gain } }
 *   STOP              → { type: "STOP", payload: {} }
 *   EMERGENCY_STOP    → { type: "EMERGENCY_STOP", payload: {} }
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ConnectionStatus } from "../hooks/useWebSocket";
import type { SensorPayload } from "../types";
import type { ValveSettings } from "./SettingsModal";

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

type Props = {
  onClose:          () => void;
  sendMessage:      (msg: object) => void;
  connectionStatus: ConnectionStatus;
  latestPacket:     SensorPayload | null;
  valveSettings:    ValveSettings;
};

type PositionPoint = {
  t:      number;
  turns:  number;
  steps:  number;
  torque: number;
};

type ServoModeId = 1 | 2 | 3 | 4 | 5 | 6;

const SERVO_MODES: { id: ServoModeId; label: string; short: string }[] = [
  { id: 1, label: "Mod 1 — Kalibrasyon / Sıfır Arama", short: "Kalibrasyon" },
  { id: 2, label: "Mod 2 — Oransal Modülasyon",         short: "Oransal"     },
  { id: 3, label: "Mod 3 — Dijital Adım",               short: "Dijital Adım"},
  { id: 4, label: "Mod 4 — TTL Aç/Kapat",              short: "TTL"         },
  { id: 5, label: "Mod 5 — PID Kontrol",                short: "PID"         },
  { id: 6, label: "Mod 6 — Akıllı Tork Sınırlama",      short: "Tork Sınır" },
];

const MAX_HISTORY = 120;

// ----------------------------------------------------------------
// Bileşen
// ----------------------------------------------------------------

export function MotorControlModal({
  onClose,
  sendMessage,
  connectionStatus,
  latestPacket,
  valveSettings,
}: Props) {
  const connected = connectionStatus === "connected";
  const disabled  = !connected;

  // -- State --
  const [activeMode,       setActiveMode]      = useState<ServoModeId>(3);
  const [targetTurns,      setTargetTurns]     = useState<number>(0);
  const [targetStep,       setTargetStep]      = useState<number>(0);
  const [calDirection,     setCalDirection]    = useState<0 | 1>(0);
  const [isConfirmingStop, setIsConfirmingStop]= useState(false);
  const [posHistory,       setPosHistory]      = useState<PositionPoint[]>([]);
  const [startTime] = useState(() => Date.now());
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kalibrasyon form state'leri
  const [seatingLoad,   setSeatingLoad]   = useState<string>("");
  const [backoffOffset, setBackoffOffset] = useState<string>("");

  // Sensör kalibrasyon form state'leri
  const [adcOffset, setAdcOffset] = useState<string>("");
  const [adcGain,   setAdcGain]   = useState<string>("");

  // -- Pozisyon geçmişini güncelle --
  useEffect(() => {
    if (!latestPacket) return;
    const t = (Date.now() - startTime) / 1000;
    setPosHistory(prev => {
      const next = [...prev, {
        t:      parseFloat(t.toFixed(2)),
        turns:  latestPacket.motor_turns      ?? 0,
        steps:  latestPacket.motor_steps      ?? 0,
        torque: latestPacket.motor_torque_pct ?? 0,
      }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
  }, [latestPacket, startTime]);

  // -- Temizlik --
  useEffect(() => {
    return () => { if (stopTimerRef.current) clearTimeout(stopTimerRef.current); };
  }, []);

  // ----------------------------------------------------------------
  // Komut gönderici yardımcıları
  // ----------------------------------------------------------------

  const handleSetMode = useCallback((modeId: ServoModeId) => {
    setActiveMode(modeId);
    // Mod 1/3/4: motora hareket veren modlar. Mod seçimi YALNIZCA arayüzü değiştirir;
    // SET_MODE ilgili aksiyon butonuyla gönderilir (Kalibrasyon / Hedefe Git / TAM AÇ-KAPAT).
    // Aksi halde mod seçer seçmez cihaz, register'daki eski hedefe göre hareket eder.
    // Mod 2/5/6: pasif modlar (oransal sinyal / PID / tork sınırı) — seçimle etkinleşir.
    if (modeId === 2 || modeId === 5 || modeId === 6) {
      sendMessage({ type: "SET_MODE", payload: { mode: modeId } });
    }
    }, [sendMessage]);

  const handleOpenFull = useCallback(() => {
    sendMessage({ type: "OPEN_FULL", payload: {} });
  }, [sendMessage]);

  const handleCloseFull = useCallback(() => {
    sendMessage({ type: "CLOSE_FULL", payload: {} });
  }, [sendMessage]);

  const handleSendTarget = useCallback(() => {
    sendMessage({
      type:    "GOTO_POSITION",
      payload: { turns: targetTurns, step: targetStep },
    });
  }, [sendMessage, targetTurns, targetStep]);

  const handleStop = useCallback(() => {
    sendMessage({ type: "STOP", payload: {} });
  }, [sendMessage]);

  const handleEmergencyStop = useCallback(() => {
    if (!isConfirmingStop) {
      setIsConfirmingStop(true);
      stopTimerRef.current = setTimeout(() => setIsConfirmingStop(false), 3000);
    } else {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      setIsConfirmingStop(false);
      sendMessage({ type: "EMERGENCY_STOP", payload: {} });
    }
  }, [isConfirmingStop, sendMessage]);

  const handleClearHistory = useCallback(() => setPosHistory([]), []);

  const handleStartCalibration = useCallback(() => {
    const seating    = parseFloat(seatingLoad);
    const backoff    = parseFloat(backoffOffset) || 0;
    const pitch      = valveSettings.thread_pitch_mm;
    const stroke     = valveSettings.max_stroke_mm;

    if (!seatingLoad || isNaN(seating) || seating <= 0) {
      alert("Seating eşiği (mA) girilmeli ve > 0 olmalı."); return;
    }
    if (pitch <= 0 || stroke <= 0) {
      alert("Vana profili eksik. Ayarlar → Vana Profili'nden pitch ve strok girin."); return;
    }
    const totalTurns = Math.round(stroke / pitch);
    if (totalTurns <= 0) {
      alert("Hesaplanan total_turns <= 0. Pitch/strok değerlerini kontrol et."); return;
    }
    const confirmed = window.confirm(
      `Kalibrasyon vanayı kapanış yönünde seating noktasına (≈${seating} mA) sürecek.\n` +
      `Yön: ${calDirection === 0 ? "CW (Saat)" : "CCW (Ters)"}\n` +
      `Toplam tur (strok ${stroke} mm / pitch ${pitch} mm) = ${totalTurns}\n\nBaşlatılsın mı?`
    );
    if (!confirmed) return;

    sendMessage({
      type: "START_CALIBRATION",
      payload: {
        calib_dir:      calDirection,
        seating_load:   seating,
        backoff_offset: backoff,
        total_turns:    totalTurns,
      },
    });
  }, [seatingLoad, backoffOffset, calDirection, valveSettings, sendMessage]);

  const handleApplyAdcCalib = useCallback(() => {
    const offset = parseFloat(adcOffset);
    const gain   = parseFloat(adcGain);
    if (adcOffset.trim() !== "" && !isNaN(offset)) {
      sendMessage({ type: "SET_ADC_OFFSET", payload: { offset } });
    }
    if (adcGain.trim() !== "" && !isNaN(gain)) {
      if (gain > 0) sendMessage({ type: "SET_ADC_GAIN", payload: { gain } });
      else alert("Gain > 0 olmalı.");
    }
  }, [adcOffset, adcGain, sendMessage]);

  // ----------------------------------------------------------------
  // Güncel değerler (gösterim)
  // ----------------------------------------------------------------

  const currTurns  = latestPacket?.motor_turns      ?? "—";
  const currSteps  = latestPacket?.motor_steps      ?? "—";
  const currTorque = latestPacket?.motor_torque_pct ?? 0;
  const currSignal = latestPacket?.motor_current_ma ?? "—";

  const torquePct   = typeof currTorque === "number" ? currTorque : 0;
  const torqueColor = torquePct > 80 ? "#ef4444" : torquePct > 60 ? "#f59e0b" : "#22c55e";

  const computedTotalTurns =
    valveSettings.thread_pitch_mm > 0
      ? Math.round(valveSettings.max_stroke_mm / valveSettings.thread_pitch_mm)
      : 0;

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* ── BAŞLIK ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.headerIcon}>⚙</div>
            <div>
              <div style={s.headerTitle}>Motor Kontrol</div>
              <div style={s.headerSub}>
                Servo Vana — Modbus RTU
                <span style={{ ...s.connDot, background: connected ? "#22c55e" : "#ef4444" }} />
                {connected ? "Bağlı" : "Bağlı Değil"}
              </div>
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── ANA GÖVDE ── */}
        <div style={s.body}>

          {/* ── SOL KOLON ── */}
          <div style={s.leftCol}>

            {/* Anlık Durum Kartları */}
            <div style={s.statusGrid}>
              <StatusCard label="Mevcut Tur"  value={String(currTurns)}  unit="tur"  accent="#007f78" />
              <StatusCard label="Mevcut Adım" value={String(currSteps)}  unit="adım" accent="#005b77" />
              <StatusCard label="Dış Sinyal"  value={String(currSignal)} unit="mA"   accent="#6366f1" />
              <div style={{ ...s.statusCard, borderColor: torqueColor }}>
                <div style={s.statusLabel}>Anlık Tork</div>
                <div style={{ ...s.statusValue, color: torqueColor }}>{torquePct.toFixed(1)}</div>
                <div style={s.statusUnit}>%</div>
                <div style={s.torqueBarBg}>
                  <div style={{ ...s.torqueBarFill, width: `${torquePct}%`, background: torqueColor }} />
                </div>
              </div>
            </div>

            {/* MOD SEÇİMİ */}
            <div style={s.section}>
              <div style={s.sectionLabel}>Çalışma Modu</div>
              <div style={s.modeGrid}>
                {SERVO_MODES.map(m => (
                  <button
                    key={m.id}
                    style={{
                      ...s.modeBtn,
                      ...(activeMode === m.id ? s.modeBtnActive : {}),
                      ...(disabled ? s.btnDisabled : {}),
                    }}
                    onClick={() => handleSetMode(m.id)}
                    title={m.label}
                  >
                    <span style={s.modeBadge}>{m.id}</span>
                    {m.short}
                  </button>
                ))}
              </div>
            </div>

            {/* MOD'A ÖZEL KONTROL PANELİ */}
            <div style={s.section}>
              <div style={s.sectionLabel}>
                {SERVO_MODES.find(m => m.id === activeMode)?.label ?? ""}
              </div>

              {/* MOD 1 — KALİBRASYON */}
              {activeMode === 1 && (
                <div style={s.modePanel}>
                  <div style={s.infoRow}>
                    <span style={s.infoText}>
                      Vana seating noktasına kadar döner, sıfır referansını kaydeder.
                      Pitch: <b>{valveSettings.thread_pitch_mm} mm</b> /
                      Strok: <b>{valveSettings.max_stroke_mm} mm</b> →
                      total_turns: <b>{computedTotalTurns}</b>
                    </span>
                  </div>
                  <div style={s.fieldRow}>
                    <span style={s.fieldLabel}>Dönüş Yönü</span>
                    <div style={s.segmentCtrl}>
                      <button
                        style={{ ...s.segBtn, ...(calDirection === 0 ? s.segBtnActive : {}) }}
                        onClick={() => setCalDirection(0)}
                      >↻ CW (Saat)</button>
                      <button
                        style={{ ...s.segBtn, ...(calDirection === 1 ? s.segBtnActive : {}) }}
                        onClick={() => setCalDirection(1)}
                      >↺ CCW (Ters)</button>
                    </div>
                  </div>
                  <div style={s.fieldRow}>
                    <span style={s.fieldLabel}>Seating (mA)</span>
                    <input
                      style={s.numInput}
                      type="number" min={1} placeholder="örn: 800"
                      value={seatingLoad}
                      onChange={e => setSeatingLoad(e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <div style={s.fieldRow}>
                    <span style={s.fieldLabel}>Backoff (tick)</span>
                    <input
                      style={s.numInput}
                      type="number" min={0} placeholder="örn: 50"
                      value={backoffOffset}
                      onChange={e => setBackoffOffset(e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  {latestPacket && (
                    <div style={{ fontSize: 11, color: "#6b7280", padding: "4px 0" }}>
                      Durum: {latestPacket.calibration_status === 1 ? "✓ Kalibre" : "Kalibre değil"} ·
                      Pozisyon: {latestPacket.motor_pos_ticks} ·
                      Yük: {latestPacket.motor_current_ma?.toFixed(0)} mA
                    </div>
                  )}
                  <button
                    style={{ ...s.actionBtn, ...s.btnBlue, ...(disabled ? s.btnDisabled : {}) }}
                    onClick={handleStartCalibration}
                  >
                    ◎ Kalibrasyonu Başlat
                  </button>
                </div>
              )}

              {/* MOD 3 — DİJİTAL ADIM */}
              {activeMode === 3 && (
                <div style={s.modePanel}>
                  <div style={s.infoRow}>
                    <span style={s.infoText}>
                      Hedef tur ve adım girerek motorun tam pozisyonunu belirle.
                    </span>
                  </div>
                  <div style={s.fieldRow}>
                    <span style={s.fieldLabel}>Hedef Tur</span>
                    <input
                      style={s.numInput}
                      type="number" min={0}
                      value={targetTurns}
                      onChange={e => setTargetTurns(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={disabled}
                    />
                    <span style={s.fieldUnit}>tur</span>
                  </div>
                  <div style={s.fieldRow}>
                    <span style={s.fieldLabel}>Hedef Adım</span>
                    <input
                      style={s.numInput}
                      type="number" min={0}
                      value={targetStep}
                      onChange={e => setTargetStep(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={disabled}
                    />
                    <span style={s.fieldUnit}>adım</span>
                  </div>
                  <div style={s.targetPreview}>
                    <span style={{ color: "#6b7280" }}>Mevcut:</span>
                    <span style={{ color: "#007f78", fontWeight: 600 }}>
                      {currTurns} tur, {currSteps} adım
                    </span>
                    <span style={{ color: "#6b7280" }}>→ Hedef:</span>
                    <span style={{ color: "#1d4ed8", fontWeight: 600 }}>
                      {targetTurns} tur, {targetStep} adım
                    </span>
                  </div>
                  <button
                    style={{ ...s.actionBtn, ...s.btnTeal, ...(disabled ? s.btnDisabled : {}) }}
                    onClick={handleSendTarget}
                  >
                    ▶ Hedefe Git
                  </button>
                </div>
              )}

              {/* MOD 4 — TTL AÇ/KAPAT */}
              {activeMode === 4 && (
                <div style={s.modePanel}>
                  <div style={s.infoRow}>
                    <span style={s.infoText}>
                      Vanayı hızlıca tam açık veya tam kapalı konuma getir.
                      Önce kalibrasyon gereklidir (total_turns referansı).
                    </span>
                  </div>
                  <div style={s.ttlRow}>
                    <button
                      style={{ ...s.ttlBtn, ...s.btnGreen, ...(disabled ? s.btnDisabled : {}) }}
                      onClick={handleOpenFull}
                    >▲ TAM AÇ</button>
                    <button
                      style={{ ...s.ttlBtn, ...s.btnAmber, ...(disabled ? s.btnDisabled : {}) }}
                      onClick={handleCloseFull}
                    >▼ TAM KAPAT</button>
                  </div>
                </div>
              )}

              {/* Diğer modlar — bilgi ekranı */}
              {(activeMode === 2 || activeMode === 5 || activeMode === 6) && (
                <div style={s.modePanel}>
                  <div style={s.infoRow}>
                    <span style={s.infoText}>
                      {activeMode === 2 && "Mod 2 (Oransal): Dış 4–20 mA sinyale göre vana pozisyonu otomatik ayarlanır. Harici sinyal kaynağı gerektirir."}
                      {activeMode === 5 && "Mod 5 (PID): Cihazın dahili PID kontrolcüsü aktif olur. Setpoint (maks. 500 bar), Kp/Ki/Kd ve ölü bant sağ panelden ayarlanır. Cihaz bu moda geçtiğinde PID hemen devreye girer."}
                      {activeMode === 6 && "Mod 6 (Tork Sınırlama): Kapanışta iğneye zarar vermemek için tork sınırlanır. Açılışta sticking etkisini yenmek için kalkış torku uygulanır."}
                    </span>
                  </div>
                  <div style={{ ...s.infoRow, background: "#fef9c3", borderColor: "#fde68a" }}>
                    <span style={{ fontSize: 12, color: "#92400e" }}>
                      ℹ Bu modun parametrelerini ⚙️ Ayarlar bölümünden yapılandırın.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SENSÖR KALİBRASYON */}
            <div style={s.section}>
              <div style={s.sectionLabel}>Sensör Kalibrasyon</div>
              <div style={s.modePanel}>
                {latestPacket && (
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Cihazda → Ofset: {latestPacket.adc_offset?.toFixed(3) ?? "—"} bar &nbsp;|&nbsp;
                    Gain: {latestPacket.adc_gain?.toFixed(3) ?? "—"}
                  </div>
                )}
                <div style={s.fieldRow}>
                  <span style={s.fieldLabel}>Ofset (bar)</span>
                  <input
                    style={s.numInput}
                    type="number" step={0.001} placeholder="0.000"
                    value={adcOffset}
                    onChange={e => setAdcOffset(e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div style={s.fieldRow}>
                  <span style={s.fieldLabel}>Gain (×)</span>
                  <input
                    style={s.numInput}
                    type="number" step={0.001} min={0.001} placeholder="1.000"
                    value={adcGain}
                    onChange={e => setAdcGain(e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <button
                  style={{ ...s.actionBtn, ...s.btnTeal, ...(disabled ? s.btnDisabled : {}) }}
                  onClick={handleApplyAdcCalib}
                >
                  Sensör Kalib. Uygula
                </button>
              </div>
            </div>

            {/* YUMUŞAK DURDURMA */}
            <button
              style={{ ...s.stopBtn, ...(disabled ? s.btnDisabled : {}) }}
              onClick={handleStop}
            >
              ■ Durdur
            </button>

            {/* ACİL DURDURMA */}
            <button
              style={{ ...s.estopBtn, ...(isConfirmingStop ? s.estopBtnConfirm : {}) }}
              onClick={handleEmergencyStop}
            >
              {isConfirmingStop ? "⚠️ EMİN MİSİNİZ? Tekrar bas!" : "🛑 ACİL DURDURMA"}
            </button>
            {isConfirmingStop && (
              <div style={s.estopNote}>3 saniye içinde tekrar basmazsan iptal edilir.</div>
            )}

          </div>{/* /leftCol */}

          {/* ── SAĞ KOLON: Pozisyon Grafiği ── */}
          <div style={s.rightCol}>
            <div style={s.chartHeader}>
              <span style={s.sectionLabel}>Gerçek Zamanlı Pozisyon</span>
              <button style={s.clearBtn} onClick={handleClearHistory}>Temizle</button>
            </div>

            {posHistory.length < 2 ? (
              <div style={s.chartEmpty}>
                {connected ? "⏳ Veri bekleniyor..." : "Backend bağlantısı yok — veri gelmiyor."}
              </div>
            ) : (
              <>
                <div style={s.chartWrap}>
                  <div style={s.chartTitle}>Tur Pozisyonu</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={posHistory} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={v => `${Number(v).toFixed(1)}s`} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                        formatter={(v) => [`${Number(v)} tur`, "Tur"]} labelFormatter={l => `t=${l}s`} />
                      <Line type="monotone" dataKey="turns" stroke="#007f78"
                        strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={s.chartWrap}>
                  <div style={s.chartTitle}>Adım Pozisyonu (Tur İçi)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={posHistory} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={v => `${Number(v).toFixed(1)}s`} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                        formatter={(v) => [`${Number(v)} adım`, "Adım"]} labelFormatter={l => `t=${l}s`} />
                      <Line type="monotone" dataKey="steps" stroke="#1d4ed8"
                        strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={s.chartWrap}>
                  <div style={s.chartTitle}>Anlık Tork (%)</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={posHistory} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={v => `${Number(v).toFixed(1)}s`} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                        formatter={(v) => [`${Number(v).toFixed(1)}%`, "Tork"]} labelFormatter={l => `t=${l}s`} />
                      <Line type="monotone" dataKey="torque" stroke="#f59e0b"
                        strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>{/* /rightCol */}

        </div>{/* /body */}
      </div>{/* /modal */}
    </div>
  );
}

// ----------------------------------------------------------------
// Alt Bileşen — Durum Kartı
// ----------------------------------------------------------------

function StatusCard({
  label, value, unit, accent,
}: { label: string; value: string; unit: string; accent: string }) {
  return (
    <div style={{ ...s.statusCard, borderColor: accent }}>
      <div style={s.statusLabel}>{label}</div>
      <div style={{ ...s.statusValue, color: accent }}>{value}</div>
      <div style={s.statusUnit}>{unit}</div>
    </div>
  );
}

// ----------------------------------------------------------------
// Stiller
// ----------------------------------------------------------------

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    zIndex: 1000, display: "flex", alignItems: "center",
    justifyContent: "center", backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#ffffff", border: "1px solid #d1d5db", borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)", width: "min(95vw, 980px)",
    maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc", flexShrink: 0,
  },
  headerLeft:  { display: "flex", alignItems: "center", gap: 12 },
  headerIcon:  {
    width: 40, height: 40, background: "#007f78", borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, color: "#fff",
  },
  headerTitle: { fontSize: 17, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" },
  headerSub:   { fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginTop: 2 },
  connDot:     { display: "inline-block", width: 8, height: 8, borderRadius: "50%" },
  closeBtn:    {
    background: "none", border: "1px solid #d1d5db", borderRadius: 8,
    width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#6b7280",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  body:    { display: "flex", gap: 0, flex: 1, overflow: "hidden" },
  leftCol: {
    width: 320, minWidth: 290, flexShrink: 0, padding: "16px",
    display: "flex", flexDirection: "column", gap: 12,
    overflowY: "auto", borderRight: "1px solid #e5e7eb",
  },
  rightCol: {
    flex: 1, padding: "16px 20px", overflowY: "auto",
    display: "flex", flexDirection: "column", gap: 8,
  },
  statusGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  statusCard:   { background: "#f8fafc", border: "1.5px solid #007f78", borderRadius: 10, padding: "8px 10px" },
  statusLabel:  { fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" },
  statusValue:  { fontSize: 22, fontWeight: 700, lineHeight: 1.1, marginTop: 2, color: "#007f78" },
  statusUnit:   { fontSize: 11, color: "#9ca3af" },
  torqueBarBg:  { marginTop: 4, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" },
  torqueBarFill:{ height: "100%", borderRadius: 2, transition: "width 0.3s ease" },
  section:      { display: "flex", flexDirection: "column", gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em" },
  modeGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 },
  modeBtn: {
    display: "flex", alignItems: "center", gap: 6, padding: "6px 8px",
    fontSize: 11, border: "1px solid #d1d5db", borderRadius: 7,
    background: "#f9fafb", color: "#374151", cursor: "pointer",
    textAlign: "left" as const, transition: "all 0.12s",
  },
  modeBtnActive:{ background: "#007f78", color: "#ffffff", border: "1px solid #007f78", fontWeight: 600 },
  modeBadge:    { background: "rgba(0,0,0,0.12)", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700, flexShrink: 0 },
  modePanel:    {
    background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "12px", display: "flex", flexDirection: "column", gap: 10,
  },
  infoRow:      { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "7px 10px" },
  infoText:     { fontSize: 12, color: "#1e40af", lineHeight: 1.5 },
  fieldRow:     { display: "flex", alignItems: "center", gap: 8 },
  fieldLabel:   { fontSize: 12, color: "#374151", width: 90, flexShrink: 0 },
  fieldUnit:    { fontSize: 12, color: "#9ca3af" },
  numInput: {
    width: 80, padding: "5px 8px", fontSize: 14, fontWeight: 600,
    border: "1.5px solid #d1d5db", borderRadius: 6,
    color: "#111827", background: "#fff", textAlign: "right" as const,
  },
  targetPreview:{
    display: "flex", flexWrap: "wrap" as const, gap: 6, fontSize: 11,
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px",
  },
  segmentCtrl:  { display: "flex", gap: 4 },
  segBtn:       { padding: "5px 10px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, background: "#f9fafb", color: "#374151", cursor: "pointer" },
  segBtnActive: { background: "#005b77", color: "#fff", border: "1px solid #005b77", fontWeight: 600 },
  ttlRow:       { display: "flex", gap: 8 },
  ttlBtn:       { flex: 1, padding: "10px", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", letterSpacing: "0.03em" },
  actionBtn:    { padding: "9px 12px", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", letterSpacing: "0.02em" },
  btnTeal:      { background: "#007f78", color: "#ffffff" },
  btnBlue:      { background: "#1d4ed8", color: "#ffffff" },
  btnGreen:     { background: "#15803d", color: "#ffffff" },
  btnAmber:     { background: "#92400e", color: "#ffffff" },
  btnDisabled:  { opacity: 0.38, cursor: "not-allowed" as const, pointerEvents: "none" as const },
  stopBtn: {
    padding: "8px", fontSize: 13, fontWeight: 700,
    border: "1.5px solid #374151", borderRadius: 8,
    background: "#f9fafb", color: "#374151", cursor: "pointer", width: "100%",
  },
  estopBtn: {
    width: "100%", padding: "11px", fontSize: 14, fontWeight: 700,
    background: "#991b1b", color: "#ffffff", border: "2px solid #7f1d1d",
    borderRadius: 8, cursor: "pointer", letterSpacing: "0.03em",
  },
  estopBtnConfirm: { background: "#dc2626", border: "2px solid #991b1b" },
  estopNote:    { fontSize: 11, color: "#991b1b", textAlign: "center" as const },
  chartHeader:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexShrink: 0 },
  chartEmpty: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    color: "#9ca3af", fontSize: 14, background: "#f8fafc",
    borderRadius: 10, border: "1px dashed #d1d5db", minHeight: 200,
  },
  chartWrap: {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 10, padding: "10px 8px 6px", flexShrink: 0,
  },
  chartTitle: {
    fontSize: 11, fontWeight: 600, color: "#6b7280",
    marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em",
  },
  clearBtn: {
    padding: "3px 10px", fontSize: 11, border: "1px solid #d1d5db",
    borderRadius: 5, background: "#f9fafb", color: "#6b7280", cursor: "pointer",
  },
};