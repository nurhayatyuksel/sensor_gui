/**
 * src/hooks/useWebSocket.ts
 *
 * Backend ile WebSocket bağlantısını kuran, mesajları dinleyen
 * ve bağlantı koptuğunda otomatik yeniden bağlanan React hook'u.
 *
 * Kullanım (App.tsx içinde):
 *   const { sensorData, alarmList, connectionStatus, sendMessage } = useWebSocket();
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { WsMessage, SensorPayload, AlarmPayload } from "../types";

// ----------------------------------------------------------------
// Sabitler
// ----------------------------------------------------------------

// Backend adresi. Vite proxy ayarına göre değiştirilebilir.
const WS_URL = `ws://${window.location.host}/ws`;

// Bağlantı kopunca kaç ms bekleyip yeniden bağlanılacağı.
// Her denemede 2 katına çıkar: 1s → 2s → 4s → 8s → max 30s
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS  = 30_000;

// Grafiklerde tutulacak maksimum nokta sayısı.
// 50 Hz × 120 s = 6000 — tüm zaman pencerelerini karşılar.
export const MAX_CHART_POINTS = 6000;

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface UseWebSocketReturn {
  /** En son gelen sensör paketi. Henüz veri gelmemişse null. */
  sensorData: SensorPayload | null;

  /** Zaman içinde biriken sensör paketleri — grafikler için. */
  sensorHistory: SensorPayload[];

  /** Aktif alarm listesi. */
  alarmList: AlarmPayload[];

  /** Bağlantı durumu: "connecting" | "connected" | "disconnected" */
  connectionStatus: ConnectionStatus;

  /** Backend'e JSON mesaj gönderir. */
  sendMessage: (msg: object) => void;

  /** Alarm listesini temizler. */
  clearAlarms: () => void;

  /** Manuel bağlantı başlatır. */
  connect: () => void;

  /** Bağlantıyı keser ve otomatik yeniden bağlanmayı durdurur. */
  disconnect: () => void;

  /** Tarihçeyi temizler. */
  clearHistory: () => void;
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------

export function useWebSocket(autoConnect = false): UseWebSocketReturn {
  const wsRef               = useRef<WebSocket | null>(null);
  const reconnectTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay      = useRef<number>(RECONNECT_BASE_MS);
  const isMounted           = useRef<boolean>(true);
  const isManualDisconnect  = useRef<boolean>(false);

  const [sensorData,       setSensorData]       = useState<SensorPayload | null>(null);
  const [sensorHistory,    setSensorHistory]    = useState<SensorPayload[]>([]);
  const [alarmList,        setAlarmList]        = useState<AlarmPayload[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // ----------------------------------------------------------------
  // Bağlantı Kurma
  // ----------------------------------------------------------------

  const connect = useCallback(() => {
    isManualDisconnect.current = false;

    // Önceki bağlantı hâlâ açıksa kapat
    if (wsRef.current) {
      wsRef.current.onclose = null; // Kendi kapatmamızda reconnect tetiklenmesin
      wsRef.current.close();
    }

    if (!isMounted.current) return;

    setConnectionStatus("connecting");
    setSensorHistory([]);
    setSensorData(null);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    // ------ Bağlantı açıldı ------
    ws.onopen = () => {
      if (!isMounted.current) return;
      console.info("[WS] Bağlantı kuruldu.");
      setConnectionStatus("connected");
      reconnectDelay.current = RECONNECT_BASE_MS; // Gecikmeyi sıfırla
    };

    // ------ Mesaj geldi ------
    ws.onmessage = (event: MessageEvent) => {
      if (!isMounted.current) return;

      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data as string) as WsMessage;
      } catch {
        console.warn("[WS] Parse edilemeyen mesaj:", event.data);
        return;
      }

      handleMessage(msg);
    };

    // ------ Hata ------
    ws.onerror = (err) => {
      console.error("[WS] Hata:", err);
      // onclose zaten tetiklenecek, oradan reconnect başlar
    };

    // ------ Bağlantı kapandı ------
    ws.onclose = () => {
      if (!isMounted.current) return;
      console.warn(`[WS] Bağlantı koptu. ${reconnectDelay.current}ms sonra yeniden deneniyor...`);
      setConnectionStatus("disconnected");
      scheduleReconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------------------------------------------------------
  // Otomatik Yeniden Bağlanma (Exponential Backoff)
  // ----------------------------------------------------------------

  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnect.current) return; // Kullanıcı kesti — yeniden bağlanma
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    reconnectTimer.current = setTimeout(() => {
      if (!isMounted.current) return;
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, RECONNECT_MAX_MS);
      connect();
    }, reconnectDelay.current);
  }, [connect]);


  

  // ----------------------------------------------------------------
  // Mesaj İşleyici
  // ----------------------------------------------------------------

  const handleMessage = useCallback((msg: WsMessage) => {
    switch (msg.type) {

      case "SENSOR_DATA": {
        const payload = msg.payload as SensorPayload;
        setSensorData(payload);

        // Grafik geçmişine ekle, MAX_CHART_POINTS'i aşınca en eskiyi at
        setSensorHistory((prev) => 
          prev.length >= MAX_CHART_POINTS
            ? [...prev.slice(1), payload]   // en eskiyi at, yeniyi sona ekle
            : [...prev, payload]);

        break;
      }

      case "ALARM_TRIGGERED": {
        const alarm = msg.payload as AlarmPayload;
        console.error(`[WS] ALARM [${alarm.code}]: ${alarm.reason}`);
        setAlarmList((prev) => [alarm, ...prev].slice(0, 50)); // Max 50 alarm tut
        break;
      }

      case "STATE_CHANGED": {
        console.info("[WS] Sistem durumu değişti:", msg.payload);
        break;
      }

      case "COMPUTED_DATA": {
        // İleride ComputedPacket geldiğinde burası doldurulacak
        break;
      }

      default:
        console.warn("[WS] Bilinmeyen mesaj tipi:", msg.type);
    }
  }, []);

  // ----------------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------------

  useEffect(() => {
    isMounted.current = true;
    if (autoConnect) connect();

    return () => {
      // Component unmount olduğunda temizle
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Unmount'ta reconnect tetiklenmesin
        wsRef.current.close();
      }
    };
  }, [connect]);

  // ----------------------------------------------------------------
  // Dışa Açık Fonksiyonlar
  // ----------------------------------------------------------------

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("[WS] Mesaj gönderilemedi — bağlantı kapalı.");
    }
  }, []);

  const clearAlarms = useCallback(() => setAlarmList([]), []);
  const clearHistory = useCallback(() => setSensorHistory([]), []);

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    setConnectionStatus("disconnected");
    console.info("[WS] Manuel olarak bağlantı kesildi.");
  }, []);

  return {
    sensorData,
    sensorHistory,
    alarmList,
    connectionStatus,
    clearHistory,
    sendMessage,
    clearAlarms,
    connect,
    disconnect,
    
  };
}