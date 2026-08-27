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
  // --- Rev 2: PID yöntem seçimi ve parametreleri (23-33) ---
  servo_comm_fail?:  number;  // addr 4 — servo haberleşme hata sayacı (0 = sağlıklı)
  pid_algorithm?:    number;  // addr 23 — 1=Klasik, 2=Fuzzy, 3=Adaptive
  fuzzy_err_scale?:  number;  // addr 24 — bar
  fuzzy_derr_scale?: number;  // addr 25 — bar/s
  fuzzy_kp_span?:    number;  // addr 26 — %
  fuzzy_ki_span?:    number;  // addr 27 — %
  fuzzy_kd_span?:    number;  // addr 28 — %
  adapt_rate?:       number;  // addr 29 — çarpan
  adapt_gain_min?:   number;  // addr 30 — %
  adapt_gain_max?:   number;  // addr 31 — %
  adapt_window_ms?:  number;  // addr 32 — ms
  adapt_osc_limit?:  number;  // addr 33 — adet
  // --- Rev 2: PID izleme, SALT OKUNUR (34-37) ---
  pid_active_kp?:    number;  // addr 34 — o an devrede olan Kp
  pid_active_ki?:    number;  // addr 35
  pid_active_kd?:    number;  // addr 36
  pid_output?:       number;  // addr 37 — valf strok oranı %

  delta_p?: number;
  mass_flow_kg_s?: number;
  opening_pct?: number;
 
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