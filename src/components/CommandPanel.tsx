/**
 * src/components/CommandPanel.tsx
 *
 * Servo vana kontrol komutlarını backend'e WebSocket üzerinden gönderen panel.
 *
 * Butonlar:
 *   - Kalibrasyon Başlat  → SET_MODE(mod=1) + CALIBRATE
 *   - Tam Aç              → OPEN_FULL
 *   - Tam Kapat           → CLOSE_FULL
 *   - Mod Seçimi (1–6)    → SET_MODE
 *   - ACİL DURDURMA       → EMERGENCY_STOP  (her zaman aktif, kırmızı)
 *
 * Tüm komutlar WsCommand formatında gönderilir:
 *   { type: "KOMUT_ADI", payload: { ... } }
 *
 * ws_server.py → _handle_client_message() bu formatı işler.
 */

import { useState } from "react";
import type { ConnectionStatus } from "../hooks/useWebSocket";

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

type Props = {
  sendMessage:      (msg: object) => void;
  connectionStatus: ConnectionStatus;
};

// Servo modları — modbus_registers.yaml mode_select açıklamasıyla eşleşir
const SERVO_MODES = [
  { id: 1, label: "Mod 1 — Kalibrasyon"     },
  { id: 2, label: "Mod 2 — Oransal"         },
  { id: 3, label: "Mod 3 — Dijital Adım"    },
  { id: 4, label: "Mod 4 — TTL Aç/Kapat"   },
  { id: 5, label: "Mod 5 — Sinyal Kaybı"   },
  { id: 6, label: "Mod 6 — Tork Sınırlama" },
] as const;

type ServoModeId = (typeof SERVO_MODES)[number]["id"];

// ----------------------------------------------------------------
// Bileşen
// ----------------------------------------------------------------

export function CommandPanel({ sendMessage, connectionStatus }: Props) {
  const [activeServoMode, setActiveServoMode] = useState<ServoModeId>(1);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);

  const disabled = connectionStatus !== "connected";

  // ----------------------------------------------------------------
  // Komut Göndericiler
  // ----------------------------------------------------------------

  function handleSetMode(modeId: ServoModeId) {
    setActiveServoMode(modeId);
    sendMessage({
      type:    "SET_MODE",
      payload: { mode: modeId },
    });
  }

  function handleCalibrate() {
    // Önce kalibrasyon modunu seç, ardından komutu gönder
    sendMessage({
      type:    "SET_MODE",
      payload: { mode: 1 },
    });
    sendMessage({
      type:    "CALIBRATE",
      payload: {},
    });
    setActiveServoMode(1);
  }

  function handleOpenFull() {
    sendMessage({
      type:    "OPEN_FULL",
      payload: {},
    });
  }

  function handleCloseFull() {
    sendMessage({
      type:    "CLOSE_FULL",
      payload: {},
    });
  }

  // ACİL DURDURMA — iki adımlı onay
  function handleEmergencyStop() {
    if (!isConfirmingStop) {
      // İlk tıklama: onay iste
      setIsConfirmingStop(true);
      // 3 saniye sonra onay durumunu sıfırla
      setTimeout(() => setIsConfirmingStop(false), 3000);
      return;
    }
    // İkinci tıklama: gerçekten gönder
    setIsConfirmingStop(false);
    sendMessage({
      type:    "EMERGENCY_STOP",
      payload: {},
    });
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div style={styles.container}>

      {/* Başlık */}
      <div style={styles.title}>Komut Paneli</div>

      {/* Bağlantı uyarısı */}
      {disabled && (
        <div style={styles.offlineNote}>
          Backend bağlantısı yok — komutlar devre dışı
        </div>
      )}

      {/* ---- Servo Mod Seçimi ---- */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Servo Modu</div>
        <div style={styles.modeGrid}>
          {SERVO_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              style={{
                ...styles.modeBtn,
                ...(activeServoMode === m.id ? styles.modeBtnActive : {}),
                ...(disabled ? styles.btnDisabled : {}),
              }}
              onClick={() => handleSetMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Hızlı Komutlar ---- */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Hızlı Komutlar</div>

        <div style={styles.quickRow}>
          {/* Kalibrasyon */}
          <button
            type="button"
            disabled
            title="Kalibrasyon artık parametre panelindeki 'Kalibrasyonu Başlat' ile yapılır."
            style={{
              ...styles.quickBtn,
              ...styles.btnCal,
              ...styles.btnDisabled,
            }}
            onClick={handleCalibrate}
          >
            🔧 Kalibrasyon (panelde)
          </button>

          {/* Tam Aç */}
          <button
            type="button"
            disabled={disabled}
            style={{
              ...styles.quickBtn,
              ...styles.btnOpen,
              ...(disabled ? styles.btnDisabled : {}),
            }}
            onClick={handleOpenFull}
          >
            ▲ Tam Aç
          </button>

          {/* Tam Kapat */}
          <button
            type="button"
            disabled={disabled}
            style={{
              ...styles.quickBtn,
              ...styles.btnClose,
              ...(disabled ? styles.btnDisabled : {}),
            }}
            onClick={handleCloseFull}
          >
            ▼ Tam Kapat
          </button>
        </div>
      </div>

      {/* ---- ACİL DURDURMA ---- */}
      <div style={styles.section}>
        <button
          type="button"
          style={{
            ...styles.estopBtn,
            ...(isConfirmingStop ? styles.estopBtnConfirm : {}),
          }}
          onClick={handleEmergencyStop}
        >
          {isConfirmingStop
            ? "⚠️ EMIN MİSİNİZ? Tekrar bas!"
            : "🛑 ACİL DURDURMA"}
        </button>
        {isConfirmingStop && (
          <div style={styles.estopNote}>
            3 saniye içinde tekrar basmazsan iptal edilir.
          </div>
        )}
      </div>

    </div>
  );
}

// ----------------------------------------------------------------
// Inline Stiller
// App.css'e taşınabilir, şimdilik burada tutuluyor.
// ----------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    background:   "#ffffff",
    border:       "1px solid #007f78",
    borderRadius: 12,
    padding:      "12px 10px",
    display:      "flex",
    flexDirection:"column",
    gap:          12,
  },
  title: {
    fontSize:   16,
    fontWeight: 700,
    color:      "#005b77",
    marginBottom: 4,
  },
  offlineNote: {
    fontSize:   12,
    color:      "#991b1b",
    background: "#fef2f2",
    border:     "1px solid #fecaca",
    borderRadius: 6,
    padding:    "4px 8px",
  },
  section: {
    display:      "flex",
    flexDirection:"column",
    gap:          6,
  },
  sectionLabel: {
    fontSize:   12,
    fontWeight: 600,
    color:      "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  modeGrid: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 4,
  },
  modeBtn: {
    padding:      "5px 6px",
    fontSize:     11,
    border:       "1px solid #d1d5db",
    borderRadius: 6,
    background:   "#f9fafb",
    color:        "#374151",
    cursor:       "pointer",
    textAlign:    "left",
    transition:   "all 0.15s",
  },
  modeBtnActive: {
    background:  "#007f78",
    color:       "#ffffff",
    border:      "1px solid #007f78",
    fontWeight:  600,
  },
  quickRow: {
    display:      "flex",
    flexDirection:"column",
    gap:          6,
  },
  quickBtn: {
    padding:      "8px 10px",
    fontSize:     13,
    fontWeight:   600,
    border:       "none",
    borderRadius: 8,
    cursor:       "pointer",
    textAlign:    "left",
    transition:   "opacity 0.15s",
  },
  btnCal: {
    background: "#1d4ed8",
    color:      "#ffffff",
  },
  btnOpen: {
    background: "#15803d",
    color:      "#ffffff",
  },
  btnClose: {
    background: "#92400e",
    color:      "#ffffff",
  },
  btnDisabled: {
    opacity:       0.4,
    cursor:        "not-allowed",
    pointerEvents: "none",
  },
  estopBtn: {
    width:        "100%",
    padding:      "10px",
    fontSize:     14,
    fontWeight:   700,
    background:   "#991b1b",
    color:        "#ffffff",
    border:       "2px solid #7f1d1d",
    borderRadius: 8,
    cursor:       "pointer",
    transition:   "all 0.15s",
    letterSpacing:"0.03em",
  },
  estopBtnConfirm: {
    background:  "#dc2626",
    border:      "2px solid #991b1b",
    animation:   "pulse 0.5s ease-in-out infinite",
  },
  estopNote: {
    fontSize: 11,
    color:    "#991b1b",
    textAlign:"center",
  },
};