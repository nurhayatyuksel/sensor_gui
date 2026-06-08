export type SensorCardData = {
  id: string;
  title: string;
  value: string;
  color: string;
  unit?: string;
  step?: number;
};

export type ParameterItem = {
  label: string;
  key: string;
};

export type FlowPoint = {
  time: number;
  debi: number;
  aciklik: number;
};

export type PressurePoint = {
  time: number;
  p1: number;
  p2: number;
  deltaP: number;
};

export type OpeningPressurePoint = {
  opening: number;
  p1: number;
  p2: number;
  deltaP: number;
};

export type OpeningFlowPoint = {
  opening: number;
  debi: number;
};

export type CvPoint = {
  opening: number;
  cv: number;
};

export type FluidOption = {
  id: string;
  label: string;
};

export type OpeningTimePoint = {
  time: number;
  aciklik: number;
};

export type CurrentTimePoint = {
  time: number;
  akim: number;
};

export type ModeChartData = {
  flowData: FlowPoint[];
  pressureData: PressurePoint[];
};

// ----------------------------------------------------------------
// WebSocket Mesaj Tipleri (YENİ)
// Backend: ws_broadcaster.py → publish(msg_type, payload)
// Format : { type: string, payload: object, timestamp: number }
// ----------------------------------------------------------------
 
/**
 * Backend'den gelen her WebSocket mesajının genel zarfı.
 * ws_broadcaster.py içindeki message dict'iyle birebir eşleşir:
 *   { "type": "SENSOR_DATA", "payload": {...}, "timestamp": 1234.56 }
 */
export type WsMessage = {
  type: "SENSOR_DATA" | "COMPUTED_DATA" | "STATE_CHANGED" | "ALARM_TRIGGERED";
  payload: SensorPayload | AlarmPayload | StatePayload | Record<string, unknown>;
  timestamp: number;
};
 
/**
 * SENSOR_DATA mesajının payload'u.
 * Backend: core/data_types.py → SensorPacket dataclass'ı (asdict ile JSON'a çevrilir)
 *
 * Not: p1_raw ve p2_raw şu an 0.0 geliyor (register haritasında basınç yok).
 *      İleride basınç sensörü eklenince bu alanlar dolacak.
 */
export type SensorPayload = {
  p1_raw:           number;  // Giriş basıncı (bar) — şu an 0.0
  p2_raw:           number;  // Çıkış basıncı (bar) — şu an 0.0
  temp_k:           number;  // Sıcaklık (Kelvin)   — şu an 0.0
  motor_pos_ticks:  number;  // Enkoder tick pozisyonu
  motor_turns:      number;   // ← YENİ (30002)
  motor_steps:      number;   // ← YENİ (30003)
  motor_torque_pct: number;   // ← YENİ (30005)
  motor_current_ma: number;  // Dış sinyal / motor akımı (mA)
  calibration_status: number; // addr=11 — 0: kalibre değil, 1: kalibre
  timestamp:        number;  // Backend sistem zamanı (monotonic)
  // --- Cihaz register geri-okuması (FC03 0-20 bloğu — A adımı) ---
  mode_select?:        number;  // addr 0
  total_turns?:        number;  // addr 1
  signal_lost_flag?:   number;  // addr 6
  signal_loss_action?: number;  // addr 7
  seating_load?:       number;  // addr 12
  backoff_offset?:     number;  // addr 13
  pid_setpoint?:       number;  // addr 14 — bar
  pid_kp?:             number;  // addr 15
  pid_ki?:             number;  // addr 16
  pid_kd?:             number;  // addr 17
  pid_deadband?:       number;  // addr 18 — bar
  adc_offset?:         number;  // addr 19 — bar
  adc_gain?:           number;  // addr 20 — çarpan
 
};
 
/**
 * ALARM_TRIGGERED mesajının payload'u.
 * Backend: AlarmCode (IntEnum) değeri + açıklama metni
 */
export type AlarmPayload = {
  code:   number;  // AlarmCode enum int değeri
  reason: string;  // İnsan tarafından okunabilir açıklama
};
 
/**
 * STATE_CHANGED mesajının payload'u.
 * Backend: SystemState enum string değeri
 */
export type StatePayload = {
  state: "IDLE" | "CALIBRATING" | "RUNNING" | "FAULT_SAFE" | "LIMIT_EXCEEDED" | "TORQUE_LIMITED";
};
 
/**
 * Frontend'den backend'e gönderilecek komut mesajı zarfı.
 * ws_server.py → _handle_client_message() tarafından işlenir.
 *
 * Kullanım:
 *   sendMessage({ type: "SET_MODE", payload: { mode: 2 } })
 *   sendMessage({ type: "EMERGENCY_STOP", payload: {} })
 */
export type WsCommand = {
  type:    string;
  payload: Record<string, unknown>;
};