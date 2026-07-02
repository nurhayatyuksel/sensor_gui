/**
 * src/components/SettingsModal.tsx
 *
 * Donanım ve vana konfigürasyonunu düzenleyen ayarlar modalı.
 * Ana ekrandaki "Ayarlar" butonuyla açılır.
 *
 * Kayıt akışı:
 *   Kullanıcı "Kaydet ve Uygula" → window.electronAPI.saveSettings(settings)
 *   → Electron main process → hardware.yaml + valve_type_A.yaml güncellenir
 *   → Backend restart → yeni ayarlarla bağlanır
 *
 * Electron olmayan ortamda (tarayıcı geliştirme):
 *   window.electronAPI tanımsız → localStorage'a kaydedilir (geliştirme modu)
 */

import { useState, useEffect } from "react";

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

export type HardwareSettings = {
  // Seri Port
  port:        string;   // örn: "COM3"
  baud_rate:   number;   // örn: 115200
  slave_id:    number;   // 1–247
  modbus_timeout: number; // saniye, örn: 0.1

  // Polling
  sample_rate_hz: number; // 20–100

  // Motor / Enkoder
  step_resolution: number; // PPR, örn: 1000
  max_revolutions: number; // örn: 10
};

export type ValveSettings = {
  // Vana Geometrisi
  orifice_diameter_mm: number;  // Orifis çapı (mm)
  thread_pitch_mm:     number;  // Vida hatvesi (mm)
  max_stroke_mm:       number;  // Maksimum strok (mm)
  cd:                  number;  // Deşarj katsayısı
};

export type AppSettings = {
  hardware: HardwareSettings;
  valve:    ValveSettings;
  sim_mode: boolean;  // Simülatör modu aktif mi?
  decimal_places: number;

};

type Props = {
  isOpen:   boolean;
  onClose:  () => void;
  onSaved:  (settings: AppSettings) => void;
};

// ----------------------------------------------------------------
// Varsayılan Değerler
// hardware.yaml ve valve_type_A.yaml ile eşleşmeli
// ----------------------------------------------------------------

const DEFAULT_SETTINGS: AppSettings = {
  hardware: {
    port:            "COM8",
    baud_rate:       230400,
    slave_id:        1,
    modbus_timeout:  0.1,
    sample_rate_hz:  50,
    step_resolution: 1000,
    max_revolutions: 10,
  },
  valve: {
    orifice_diameter_mm: 10.0,
    thread_pitch_mm:     1.5,
    max_stroke_mm:       15.0,
    cd:                  0.65,
  },
  sim_mode: false,
  decimal_places: 3,
};

// ----------------------------------------------------------------
// Electron API Köprüsü
// ----------------------------------------------------------------

declare global {
  interface Window {
    electronAPI?: {
      saveSettings:    (s: AppSettings) => Promise<{ ok: boolean; error?: string }>;
      loadSettings:    () => Promise<AppSettings | null>;
      restartBackend:  () => Promise<void>;
      getComPorts:     () => Promise<string[]>;
    };
  }
}

//async function loadSettingsFromDisk(): Promise<AppSettings> {
//  if (window.electronAPI) {
//    const saved = await window.electronAPI.loadSettings();
//    if (saved) return saved;
//  } else {
//    // Geliştirme modu: localStorage
//    const raw = localStorage.getItem("appSettings");
//    if (raw) return JSON.parse(raw) as AppSettings;
// }
//  return DEFAULT_SETTINGS;
//}


async function saveSettingsToDisk(settings: AppSettings): Promise<{ ok: boolean; error?: string }> {
  if (window.electronAPI) {
    const result = await window.electronAPI.saveSettings(settings);
    return { ok: result.ok, error: result.error };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("http://localhost:8000/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hardware: { ...settings.hardware, ...settings.valve } }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return { ok: data.ok === true, error: data.error ?? data.detail };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ----------------------------------------------------------------
// Bileşen
// ----------------------------------------------------------------

export function SettingsModal({ isOpen, onClose, onSaved }: Props) {
  const [settings,    setSettings]    = useState<AppSettings>(DEFAULT_SETTINGS);
  const [comPorts]    = useState<string[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"connection" | "motor" | "valve">("connection");


  useEffect(() => {
    if (!isOpen) return;
    if (window.electronAPI) {
      // Electron: loadSettings() tam AppSettings döndürür
      window.electronAPI.loadSettings().then(saved => {
        if (saved) setSettings(saved);
      });
    } else {
      // Browser/dev: backend'den hardware oku, valve default'ta kalır
      fetch("http://localhost:8000/settings")
        .then(r => r.json())
        .then(data => {
          if (data.ok && data.hardware) {
            // spread ile birleştir — yaml'da eksik alan varsa default'a düşer
            setSettings(prev => ({
              ...prev,
              hardware: { ...prev.hardware, ...data.hardware },
              valve: {
                orifice_diameter_mm: data.hardware.orifice_diameter_mm ?? prev.valve.orifice_diameter_mm,
                thread_pitch_mm:     data.hardware.thread_pitch_mm     ?? prev.valve.thread_pitch_mm,
                max_stroke_mm:       data.hardware.max_stroke_mm       ?? prev.valve.max_stroke_mm,
                cd:                  data.hardware.cd                  ?? prev.valve.cd,
              },
            }));
          }
        })
        .catch(() => {}); // sessiz fail — default'lar kalır
    }
  }, [isOpen]);


  if (!isOpen) return null;

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------

  function setHw<K extends keyof HardwareSettings>(key: K, value: HardwareSettings[K]) {
    setSettings(prev => ({
      ...prev,
      hardware: { ...prev.hardware, [key]: value },
    }));
  }

  function setValve<K extends keyof ValveSettings>(key: K, value: ValveSettings[K]) {
    setSettings(prev => ({
      ...prev,
      valve: { ...prev.valve, [key]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveSettingsToDisk(settings);


    if (result.ok) {
      setSaveSuccess(true);
      onSaved(settings);

      // Backend'i yeni ayarlarla yeniden başlat
      if (window.electronAPI) {
        await window.electronAPI.restartBackend();
      }

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } else {
      setSaveError(result.error
        ? `Ayarlar kaydedilemedi: ${result.error}`
        : "Ayarlar kaydedilemedi. Dosya izinlerini kontrol edin.");}

    setSaving(false);
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Başlık */}
        <div style={s.header}>
          <span style={s.headerTitle}>⚙️ Ayarlar</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Sekmeler */}

        <div style={s.tabs}>
          {(["connection", "motor", "valve"] as const).map(tab => (
            <button
              key={tab}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "connection" ? "🔌 Bağlantı" : tab === "motor" ? "⚙️ Motor" : "🔧 Vana Profili"}
            </button>
          ))}

        </div>

        {/* İçerik */}
        <div style={s.body}>

          {/* ---- DONANIM SEKMESİ ---- */}

          {activeTab === "connection" && (
            <div style={s.section}>

              {/* Simülatör Modu */}
              <div style={s.simRow}>
                <label style={s.simLabel}>
                  <input
                    type="checkbox"
                    checked={settings.sim_mode}
                    onChange={e => setSettings(p => ({ ...p, sim_mode: e.target.checked }))}
                    style={{ marginRight: 8 }}
                  />
                  Simülatör Modu
                  <span style={s.simNote}>
                    (Gerçek donanım olmadan test — COM port gerekmez)
                  </span>
                </label>
              </div>

              <div style={s.divider} />

              <SettingRow label="COM Port" note="Cihaz Yöneticisi'nden kontrol et">
                {comPorts.length > 0 ? (
                  <select
                    style={s.input}
                    value={settings.hardware.port}
                    onChange={e => setHw("port", e.target.value)}
                    disabled={settings.sim_mode}
                  >
                    {comPorts.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : (
                  <input
                    style={s.input}
                    type="text"
                    value={settings.hardware.port}
                    onChange={e => setHw("port", e.target.value)}
                    placeholder="COM8"
                    disabled={settings.sim_mode}
                  />
                )}
              </SettingRow>

              <SettingRow label="Baud Rate" note="Cihaz dokümanına göre">
                <select
                  style={s.input}
                  value={settings.hardware.baud_rate}
                  onChange={e => setHw("baud_rate", Number(e.target.value))}
                  disabled={settings.sim_mode}
                >
                  {[9600, 19200, 38400, 57600, 115200, 230400].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </SettingRow>

              <SettingRow label="Slave ID" note="Cihaz DIP switch ayarı (1–247)">
                <input
                  style={{ ...s.input, width: 80 }}
                  type="number" min={1} max={247}
                  value={settings.hardware.slave_id}
                  onChange={e => setHw("slave_id", Number(e.target.value))}
                  disabled={settings.sim_mode}
                />
              </SettingRow>

              <SettingRow label="Modbus Timeout (s)" note="Yanıt bekleme süresi">
                <input
                  style={{ ...s.input, width: 80 }}
                  type="number" step={0.05} min={0.05} max={2.0}
                  value={settings.hardware.modbus_timeout}
                  onChange={e => setHw("modbus_timeout", Number(e.target.value))}
                  disabled={settings.sim_mode}
                />
              </SettingRow>

              <div style={s.divider} />

              <SettingRow label="Polling Hızı (Hz)" note="Saniyede kaç kez okunacak (20–100)">
                <input
                  style={{ ...s.input, width: 80 }}
                  type="number" min={20} max={100}
                  value={settings.hardware.sample_rate_hz}
                  onChange={e => setHw("sample_rate_hz", Number(e.target.value))}
                />
              </SettingRow>

            </div>
          )}

          {activeTab === "motor" && (
            <div style={s.section}>

              <SettingRow label="Adım Çözünürlüğü (PPR)" note="1 tur = kaç adım (enkoder ayarı)">
                <input
                  style={{ ...s.input, width: 100 }}
                  type="number" min={1}
                  value={settings.hardware.step_resolution}
                  onChange={e => setHw("step_resolution", Number(e.target.value))}
                />
              </SettingRow>

              <SettingRow label="Maks. Tur Sayısı" note="Vananın tam açılması için gereken tur (1–40)">
                <input
                  style={{ ...s.input, width: 80 }}
                  type="number" min={1} max={40}
                  value={settings.hardware.max_revolutions}
                  onChange={e => setHw("max_revolutions", Number(e.target.value))}
                />
              </SettingRow>

              <SettingRow label="Ondalık Basamak" note="Grafik eksenlerinde gösterilecek basamak sayısı (1–5)">
                <input
                  type="number" min={1} max={5}
                  value={settings.decimal_places ?? 3}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      decimal_places: Math.min(5, Math.max(1, Number(e.target.value) || 3)),
                    }))
                  }
                  style={{ ...s.input, width: 80 }}
                />
              </SettingRow>

            </div>
          )}

          {/* ---- VANA PROFİLİ SEKMESİ ---- */}
          {activeTab === "valve" && (
            <div style={s.section}>

              <SettingRow label="Orifis Çapı (mm)" note="Vana iğne orifis çapı">
                <input
                  style={{ ...s.input, width: 100 }}
                  type="number" step={0.1} min={0.1}
                  value={settings.valve.orifice_diameter_mm}
                  onChange={e => setValve("orifice_diameter_mm", Number(e.target.value))}
                />
              </SettingRow>

              <SettingRow label="Vida Hatvesi (mm)" note="Vana vidasının hatvesi">
                <input
                  style={{ ...s.input, width: 100 }}
                  type="number" step={0.1} min={0.1}
                  value={settings.valve.thread_pitch_mm}
                  onChange={e => setValve("thread_pitch_mm", Number(e.target.value))}
                />
              </SettingRow>

              <SettingRow label="Maks. Strok (mm)" note="0% → 100% açıklık mesafesi">
                <input
                  style={{ ...s.input, width: 100 }}
                  type="number" step={0.1} min={0.1}
                  value={settings.valve.max_stroke_mm}
                  onChange={e => setValve("max_stroke_mm", Number(e.target.value))}
                />
              </SettingRow>

              <SettingRow label="Deşarj Katsayısı (Cd)" note="Akış hesabı için (0.1 – 1.0)">
                <input
                  style={{ ...s.input, width: 100 }}
                  type="number" step={0.01} min={0.1} max={1.0}
                  value={settings.valve.cd}
                  onChange={e => setValve("cd", Number(e.target.value))}
                />
              </SettingRow>

            </div>
          )}
        </div>

        {/* Alt Bar */}
        <div style={s.footer}>
          {saveError && <span style={s.errorText}>{saveError}</span>}
          {saveSuccess && <span style={s.successText}>✓ Kaydedildi, backend yeniden başlatılıyor...</span>}

          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button style={s.cancelBtn} onClick={onClose} disabled={saving}>
              İptal
            </button>
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet ve Uygula"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Yardımcı: Ayar Satırı
// ----------------------------------------------------------------

function SettingRow({
  label,
  note,
  children,
}: {
  label:    string;
  note?:    string;
  children: React.ReactNode;
}) {
  return (
    <div style={sr.row}>
      <div style={sr.labelCol}>
        <span style={sr.label}>{label}</span>
        {note && <span style={sr.note}>{note}</span>}
      </div>
      <div style={sr.inputCol}>{children}</div>
    </div>
  );
}

// ----------------------------------------------------------------
// Stiller
// ----------------------------------------------------------------

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position:       "fixed",
    inset:          0,
    background:     "rgba(0,0,0,0.55)",
    zIndex:         1000,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
  },
  modal: {
    background:   "#fff",
    borderRadius: 14,
    width:        520,
    maxHeight:    "88vh",
    display:      "flex",
    flexDirection:"column",
    boxShadow:    "0 8px 32px rgba(0,0,0,0.25)",
    overflow:     "hidden",
  },
  header: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "14px 18px",
    background:     "#007f78",
    color:          "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: 700 },
  closeBtn: {
    background: "transparent",
    border:     "none",
    color:      "#fff",
    fontSize:   18,
    cursor:     "pointer",
    padding:    "0 4px",
  },
  tabs: {
    display:    "flex",
    borderBottom: "1px solid #e5e7eb",
  },
  tab: {
    flex:       1,
    padding:    "10px 0",
    border:     "none",
    background: "#f9fafb",
    fontSize:   13,
    fontWeight: 500,
    cursor:     "pointer",
    color:      "#6b7280",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    background:   "#fff",
    color:        "#007f78",
    borderBottom: "2px solid #007f78",
  },
  body: {
    flex:       1,
    overflowY:  "auto",
    padding:    "16px 18px",
  },
  section: {
    display:      "flex",
    flexDirection:"column",
    gap:          12,
  },
  simRow: {
    background:   "#eff6ff",
    border:       "1px solid #bfdbfe",
    borderRadius: 8,
    padding:      "10px 14px",
  },
  simLabel: {
    display:    "flex",
    alignItems: "center",
    fontSize:   14,
    fontWeight: 600,
    color:      "#1e40af",
    cursor:     "pointer",
  },
  simNote: {
    fontSize:   12,
    fontWeight: 400,
    color:      "#3b82f6",
    marginLeft: 8,
  },
  divider: {
    borderTop: "1px solid #f3f4f6",
    margin:    "4px 0",
  },
  input: {
    padding:      "5px 8px",
    border:       "1px solid #d1d5db",
    borderRadius: 6,
    fontSize:     14,
    width:        "100%",
    outline:      "none",
  },
  footer: {
    display:     "flex",
    alignItems:  "center",
    padding:     "12px 18px",
    borderTop:   "1px solid #e5e7eb",
    background:  "#f9fafb",
    gap:         10,
  },
  errorText:   { fontSize: 12, color: "#dc2626" },
  successText: { fontSize: 12, color: "#15803d" },
  cancelBtn: {
    padding:      "7px 16px",
    border:       "1px solid #d1d5db",
    borderRadius: 7,
    background:   "#fff",
    fontSize:     13,
    cursor:       "pointer",
    color:        "#374151",
  },
  saveBtn: {
    padding:      "7px 18px",
    border:       "none",
    borderRadius: 7,
    background:   "#007f78",
    color:        "#fff",
    fontSize:     13,
    fontWeight:   600,
    cursor:       "pointer",
  },
};

const sr: Record<string, React.CSSProperties> = {
  row: {
    display:     "flex",
    alignItems:  "center",
    gap:         12,
    padding:     "6px 0",
  },
  labelCol: {
    flex:        1,
    display:     "flex",
    flexDirection:"column",
    gap:         2,
  },
  label: { fontSize: 13, fontWeight: 600, color: "#111827" },
  note:  { fontSize: 11, color: "#6b7280" },
  inputCol: {
    flexShrink: 0,
    minWidth:   120,
    display:    "flex",
    justifyContent: "flex-end",
  },
};