This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: dist, node_modules, public, src/assets, packet-lock.json
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
.gitignore
eslint.config.js
index.html
package.json
README.md
src/App.css
src/App.tsx
src/components/ChartsPanel.tsx
src/components/CommandPanel.tsx
src/components/ControlModePanel.tsx
src/components/FluidSelector.tsx
src/components/MotorControlModal.tsx
src/components/ParameterPanel.tsx
src/components/SensorCard.tsx
src/components/SettingsModal.tsx
src/data/mockData.ts
src/data/sensorConfig.ts
src/hooks/useWebSocket.ts
src/index.css
src/main.tsx
src/types.ts
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path=".gitignore">
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
</file>

<file path="eslint.config.js">
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
</file>

<file path="index.html">
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>sensorsim</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
</file>

<file path="package.json">
{
  "name": "sensorsim",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.7.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/node": "^24.12.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.57.0",
    "vite": "^8.0.1"
  }
}
</file>

<file path="README.md">
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
</file>

<file path="src/components/ControlModePanel.tsx">
type Mode = "Basınç" | "Pozisyon" | "Regülatör" | "Debi";

type Props = {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
};

const modes: Mode[] = ["Basınç", "Pozisyon", "Regülatör", "Debi"];

export function ControlModePanel({ activeMode, onChange }: Props) {
  return (
    <div className="control-panel">
      <div className="control-title">Kontrol Modu</div>

      <div className="mode-list">
        {modes.map((mode) => {
          const active = activeMode === mode;

          return (
            <button
              key={mode}
              className={`mode-button ${active ? "active" : ""}`}
              onClick={() => onChange(mode)}
              type="button"
            >
              <div className="mode-circle">{active ? mode[0] : ""}</div>
              <span className="mode-label">{mode}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
</file>

<file path="src/components/FluidSelector.tsx">
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import type { FluidOption } from "../types";

type Props = {
  title: string;
  options: FluidOption[];
  selectedFluid: FluidOption | null;
  onSelect: (item: FluidOption) => void;
};

export function FluidSelector({
  title,
  options,
  selectedFluid,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) return options;

    return options.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }, [options, searchText]);

  return (
    <div className="fluid-selector" ref={wrapperRef}>
      <div className="fluid-card">
        <div className="fluid-title">{title}</div>

        <div className="fluid-bottom-row">
          <span className="fluid-selected-text">
            {selectedFluid ? selectedFluid.label : ""}
          </span>

          <button
            type="button"
            className="fluid-arrow-btn"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fluid-dropdown">
          <div className="fluid-search-row">
            <input
              className="fluid-search-input"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder=""
            />
            <Search size={22} className="fluid-search-icon" />
          </div>

          <div className="fluid-options">
            {filteredOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="fluid-option"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                  setSearchText("");
                }}
              >
                <span className="fluid-option-box" />
                <span>{item.label}</span>
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <div className="fluid-empty">Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
</file>

<file path="src/components/ParameterPanel.tsx">
import type { ParameterItem } from "../types";

type Props = {
  title: string;
  items: ParameterItem[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

function ParameterRow({
  item,
  value,
  onChange,
}: {
  item: ParameterItem;
  value: string;
  onChange: (value: string) => void;
}) {
  const showStepper =
    item.key.toLowerCase() === "debi" ||
    item.key.toLowerCase() === "pozisyon" ||
    item.key.toLowerCase() === "position";

  const handleDecrease = () => {
    const current = Number(value || 0);
    onChange(String(current - 1));
  };

  const handleIncrease = () => {
    const current = Number(value || 0);
    onChange(String(current + 1));
  };

  return (
    <div className="param-row">
      <div className="param-label-wrap">
        <span className="param-red-dot" />
        <label className="param-label">{item.label}:</label>
      </div>

      <div className="param-input-wrap">
        <span>[</span>

        {showStepper ? (
          <div className="param-stepper-wrap">
            <button
              type="button"
              className="step-btn"
              onClick={handleDecrease}
            >
              ↓
            </button>

            <input
              type="number"
              className="param-input"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />

            <button
              type="button"
              className="step-btn"
              onClick={handleIncrease}
            >
              ↑
            </button>
          </div>
        ) : (
          <input
            type="text"
            className="param-input"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        <span>]</span>
      </div>
    </div>
  );
}

export function ParameterSection({ title, items, values, onChange }: Props) {
  return (
    <section className="param-section">
      <h3>{title}</h3>

      <div className="param-list">
        {items.map((item) => (
          <ParameterRow
            key={item.key}
            item={item}
            value={values[item.key] ?? ""}
            onChange={(value) => onChange(item.key, value)}
          />
        ))}
      </div>
    </section>
  );
}
</file>

<file path="src/components/SensorCard.tsx">
import React from "react";
import { MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import type { SensorCardData } from "../types";

type Props = {
  item: SensorCardData;
  value: string;
  editable: boolean;
  onValueChange: (value: string) => void;
};

export function SensorCard({ item, value, editable, onValueChange }: Props) {
  const step = item.step ?? 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
      onValueChange(raw);
    }
  };

  const decimalPlaces = (step: number): number => {
    const str = step.toString();
    const dot = str.indexOf(".");
    return dot === -1 ? 0 : str.length - dot - 1;
  };

  const handleStep = (direction: 1 | -1) => {
    const current = parseFloat(value || "0");
    const next = current + direction * step;
    onValueChange(next.toFixed(decimalPlaces(step)));
  };

  return (
    <div className={`sensor-card${editable ? " sensor-card--active" : " sensor-card--locked"}`}>
      <div className="sensor-card-header">
        <div className="sensor-title-wrap">
          <span className="sensor-dot" style={{ backgroundColor: item.color }} />
          <span className="sensor-title">{item.title}</span>
        </div>

        <button className="icon-btn" type="button">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="sensor-card-body">
        {editable ? (
          <div className="sensor-value-row">
            <div className="sensor-value-box">
              <input
                className="sensor-value-input"
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="0"
              />
              {item.unit && <span className="sensor-unit">{item.unit}</span>}
            </div>
            <div className="sensor-steppers">
              <button
                className="sensor-step-btn"
                type="button"
                onClick={() => handleStep(1)}
              >
                <ChevronUp size={10} />
              </button>
              <button
                className="sensor-step-btn"
                type="button"
                onClick={() => handleStep(-1)}
              >
                <ChevronDown size={10} />
              </button>
            </div>
          </div>
        ) : (
          <div className="sensor-value-row">
            <div className="sensor-value-box">
              <span className="sensor-value-text">{value !== "" ? value : "—"}</span>
              {item.unit && <span className="sensor-unit">{item.unit}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
</file>

<file path="src/hooks/useWebSocket.ts">
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
</file>

<file path="src/index.css">
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

#root {
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  min-height: 100svh;
  box-sizing: border-box;
}

body {
  margin: 0;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}
</file>

<file path="src/main.tsx">
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
</file>

<file path="tsconfig.app.json">
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
</file>

<file path="tsconfig.json">
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
</file>

<file path="tsconfig.node.json">
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
</file>

<file path="src/components/ChartsPanel.tsx">
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  FlowPoint,
  PressurePoint,
  OpeningTimePoint,
  CurrentTimePoint,
  OpeningPressurePoint,
  OpeningFlowPoint,
  CvPoint,
} from "../types";


type Mode = "Basınç" | "Pozisyon" | "Regülatör" | "Debi";

type Props = {
  activeMode: Mode;
  flowData: FlowPoint[];
  pressureData: PressurePoint[];
  openingTimeData: OpeningTimePoint[];
  currentTimeData: CurrentTimePoint[];
  openingPressureData: OpeningPressurePoint[];
  openingFlowData: OpeningFlowPoint[];
  cvData: CvPoint[];
  decimalPlaces: number;
  onReset: () => void;
};

const TIME_WINDOWS = [30, 60, 120, 180, 300] as const;
type TimeWindow = (typeof TIME_WINDOWS)[number];

function filterByWindow<T extends { time: number }>(data: T[], windowSec: TimeWindow): T[] {
  if (data.length === 0) return data;
  const maxTime = data[data.length - 1].time;
  return data.filter((d) => d.time >= maxTime - windowSec);
}

function buildCsvContent(
  headers: string[],
  rows: Record<string, number>[]
): string {
  const header = headers.join(",");
  const body = rows.map((r) => headers.map((h) => r[h] ?? "").join(",")).join("\n");
  return `${header}\n${body}`;
}

function buildTxtContent(
  headers: string[],
  rows: Record<string, number>[]
): string {
  const header = headers.join("\t");
  const body = rows.map((r) => headers.map((h) => r[h] ?? "").join("\t")).join("\n");
  return `${header}\n${body}`;
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function TimeBasedCharts({
  flowData,
  pressureData,
  openingTimeData,
  currentTimeData,
  timeWindow,
  decimalPlaces
}: {
  flowData: FlowPoint[];
  pressureData: PressurePoint[];
  openingTimeData: OpeningTimePoint[];
  currentTimeData: CurrentTimePoint[];
  timeWindow: TimeWindow;
  decimalPlaces: number;
}) {
  const filteredFlow = filterByWindow(flowData, timeWindow);
  const filteredPressure = filterByWindow(pressureData, timeWindow);
  const filteredOpening = filterByWindow(openingTimeData, timeWindow);
  const filteredCurrent = filterByWindow(currentTimeData, timeWindow);
  const fmt = (v: unknown) =>
    typeof v === "number" ? v.toFixed(decimalPlaces) : String(v);

  return (
    <div className="charts-grid">
      <div className="chart-block">
        <h2>Basınç – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredPressure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                  domain={["dataMin", "dataMax"]}
                  type="number"
                  tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Basınç [bar]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="p1" stroke="#ff4f7b" dot={false} isAnimationActive={false} name="P₁ [bar]" />
              <Line type="monotone" dataKey="p2" stroke="#2b7de9" dot={false} isAnimationActive={false} name="P₂ [bar]" />
              <Line type="monotone" dataKey="deltaP" stroke="#f59e0b" dot={false} isAnimationActive={false} name="ΔP [bar]" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>Debi – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                  domain={["dataMin", "dataMax"]}
                  type="number"
                  tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Debi [kg/s]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="debi"
                stroke="#ff5b1f"
                dot={false}
                isAnimationActive={false}
                name="Debi [kg/s]"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>Açıklık – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredOpening}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Açıklık [%]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="aciklik"
                stroke="#38c7c7"
                dot={false}
                isAnimationActive={false}
                name="Açıklık [%]"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>Akım – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredCurrent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Akım [mA]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="akim"
                stroke="#a855f7"
                dot={false}
                isAnimationActive={false}
                name="Akım [mA]"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PositionBasedCharts({
  openingPressureData,
  openingFlowData,
  cvData,
  decimalPlaces,  
}: {
  openingPressureData: OpeningPressurePoint[];
  openingFlowData: OpeningFlowPoint[];
  cvData: CvPoint[];
  decimalPlaces: number;
}) {
    const fmt = (v: unknown) =>
      typeof v === "number" ? v.toFixed(decimalPlaces) : String(v);
  return (
    <div className="charts-grid charts-grid--3col">
      <div className="chart-block">
        <h2>Basınç – Açıklık Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={openingPressureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="opening"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Açıklık [%]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Basınç [bar]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="p1" stroke="#ff4f7b" dot={false} isAnimationActive={false} name="P₁ [bar]" />
              <Line type="monotone" dataKey="p2" stroke="#2b7de9" dot={false} isAnimationActive={false} name="P₂ [bar]" />
              <Line type="monotone" dataKey="deltaP" stroke="#f59e0b" dot={false} isAnimationActive={false} name="ΔP [bar]" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>Debi – Açıklık Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={openingFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="opening"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Açıklık [%]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Debi [kg/s]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="debi" stroke="#16a34a" dot={false} isAnimationActive={false} name="Debi [kg/s]" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>C<sub>V</sub> – Açıklık Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cvData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="opening"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Açıklık [%]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={fmt}
                label={{ value: "Cᵥ", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="cv" stroke="#7c3aed" dot={false} isAnimationActive={false} name="Cᵥ" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function ChartsPanel({
  activeMode,
  flowData,
  pressureData,
  openingTimeData,
  currentTimeData,
  openingPressureData,
  openingFlowData,
  decimalPlaces,
  cvData,
  onReset,
}: Props) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(60);
  const [exportFormat, setExportFormat] = useState<"csv" | "txt">("csv");

  const isPositionMode = activeMode === "Pozisyon";

  function handleExport() {
    const filename = window.prompt(
      "Dosya adını girin:",
      `kayit_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`
    );
    if (!filename) return;

    const headers = ["time", "p1", "p2", "deltaP", "debi", "aciklik", "akim"];

    const rows = flowData.map((fp, i) => ({
      time: fp.time,
      p1: pressureData[i]?.p1 ?? 0,
      p2: pressureData[i]?.p2 ?? 0,
      deltaP: pressureData[i]?.deltaP ?? 0,
      debi: fp.debi,
      aciklik: fp.aciklik,
      akim: currentTimeData[i]?.akim ?? 0,
    }));

    const content =
      exportFormat === "csv"
        ? buildCsvContent(headers, rows)
        : buildTxtContent(headers, rows);

    const mimeType = exportFormat === "csv" ? "text/csv" : "text/plain";
    triggerDownload(content, `${filename}.${exportFormat}`, mimeType);

    onReset();
  }

  return (
    <div className="charts-section">
      <div className="charts-controls">
        <h1 className="charts-main-title">
          {isPositionMode ? "KARAKTERİSTİK GRAFİKLER" : "GRAFİKLER"}
        </h1>

        {!isPositionMode && (
          <div className="charts-toolbar">
            <div className="time-window-group">
              <span className="time-window-label">Son</span>
              {TIME_WINDOWS.map((w) => (
                <button
                  key={w}
                  className={`time-window-btn${timeWindow === w ? " active" : ""}`}
                  onClick={() => setTimeWindow(w)}
                >
                  {w}s
                </button>
              ))}
            </div>

            <div className="export-group">
              <select
                className="export-format-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "csv" | "txt")}
              >
                <option value="csv">.csv</option>
                <option value="txt">.txt</option>
              </select>
              <button className="charts-action-btn kayit-btn" onClick={handleExport}>
                Kayıt
              </button>
              <button className="charts-action-btn sifirla-btn" onClick={onReset}>
                Sıfırla
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="charts-content">
        {isPositionMode ? (
          <PositionBasedCharts
            openingPressureData={openingPressureData}
            openingFlowData={openingFlowData}
            cvData={cvData}
            decimalPlaces={decimalPlaces}
          />
        ) : (
          <TimeBasedCharts
            flowData={flowData}
            pressureData={pressureData}
            openingTimeData={openingTimeData}
            currentTimeData={currentTimeData}
            timeWindow={timeWindow}
            decimalPlaces={decimalPlaces}
          />
        )}
      </div>
    </div>
  );
}
</file>

<file path="src/components/CommandPanel.tsx">
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
</file>

<file path="src/components/MotorControlModal.tsx">
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


  // Drag state — modal'ın ekrandaki konumu
  const [pos, setPos] = useState({ x: window.innerWidth - 520, y: 60 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.origX + ev.clientX - dragRef.current.startX,
        y: dragRef.current.origY + ev.clientY - dragRef.current.startY,
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos]);

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


  const lastGotoRef = useRef<number>(0);
  const handleSendTarget = useCallback(() => {
  const now = Date.now();
  if (now - lastGotoRef.current < 1000) return;  // 300ms debounce
  lastGotoRef.current = now;
  sendMessage({ 
    type: "GOTO_POSITION", 
    payload: { turns: targetTurns, step: targetStep } 
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
    <div style={{ ...s.modal, position: "fixed", left: pos.x, top: pos.y, zIndex: 1000 }}>
      

        {/* ── BAŞLIK ── */}
        <div style={{ ...s.header, cursor: "grab", userSelect: "none" }} onMouseDown={onMouseDown}>
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
          <button style={s.closeBtn}  
          onMouseDown={e => e.stopPropagation()} 
          onClick={onClose}
          >
            ✕
            </button>
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
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",

    width: "min(95vw, 980px)",
    height: "min(90vh, 720px)",

    minWidth: 500,
    minHeight: 400,
    maxWidth: "98vw",
    maxHeight: "95vh",

    display: "flex",
    flexDirection: "column",

    overflow: "hidden",
    resize: "both",
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
</file>

<file path="src/components/SettingsModal.tsx">
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
</file>

<file path="src/data/sensorConfig.ts">
import type { SensorCardData } from "../types";

export const sensorCards: SensorCardData[] = [
  { id: "giris", title: "Giriş Basıncı", value: "DEĞER", color: "#12b5ea", unit: "bar", step: 0.1 },
  { id: "cikis", title: "Çıkış Basıncı", value: "DEĞER", color: "#12b5ea", unit: "bar", step: 0.1 },
  { id: "fark", title: "Basınç Farkı", value: "DEĞER", color: "#22c55e", unit: "bar", step: 0.1 },
  { id: "debi", title: "Debi", value: "DEĞER", color: "#22c55e", unit: "kg/s", step: 0.01 },
  { id: "pozisyon", title: "Açıklık",  value: "DEĞER", color: "#22c55e", unit: "%",  step: 0.1 },
];
</file>

<file path="vite.config.ts">
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,          // WebSocket proxy'si olduğunu belirt
        changeOrigin: true,
      },
    },
  },
})
</file>

<file path="src/App.css">
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #efefef;
  color: #222;
}

button,
input {
  font: inherit;
}

.app-shell {
  display: grid;
  grid-template-columns: 185px minmax(0, 1fr) 340px;
  height: 100vh;
  max-height: 150vh;
  gap: 5px;
  padding: 5px;
  align-items: start;
  overflow: hidden;
  box-sizing: border-box;
}


/* LEFT */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 100%;
}

.sensor-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.sensor-card-header {
  background: #007f78;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 14px;
}

.sensor-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sensor-dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-block;
}

.sensor-title {
  font-weight: 700;
  font-size: 15px;
}

.sensor-card-body {
  padding: 20px 12px;
  min-height: 0;
  display: flex;
  align-items: center;
  font-size: 15px;
}

/* Sensor card states */
.sensor-card--locked {
  opacity: 0.82;
}

.sensor-card--locked .sensor-card-body {
  pointer-events: none;
}

.sensor-card--active {
  opacity: 1;
}

/* Sensor value layout */
.sensor-value-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.sensor-value-box {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  min-width: 0;
  background: #f5f5f5;
  border: 1px solid #bbb;
  padding: 2px 6px;
  height: 38px;
}

.sensor-value-input {
  flex: 1;
  min-width: 0;
  width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  color: #111;
  color-scheme: light;
}

.sensor-value-text {
  flex: 1;
  font-size: 12px;
  color: #888;
}

.sensor-unit {
  font-size: 10px;
  color: #666;
  flex-shrink: 0;
}

.sensor-steppers {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.sensor-step-btn {
  width: 18px;
  height: 13px;
  padding: 0;
  border: 1px solid #999;
  background: #ececec;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  color: #333;
}

.sensor-step-btn:hover {
  background: #d0d0d0;
}

.icon-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}

/* CENTER */
.main-content {
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
  position: relative;
}

.top-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  position: relative;
  z-index: 2;
  padding-left: 10px;
}


.top-card {
  width: 260px;
  min-height: 72px;
  background: #007f78;
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-card-title {
  text-align: center;
  font-weight: 700;
  font-size: 18px;
}

.top-card-icon {
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  align-self: flex-start;
}

.control-panel {
  width: 390px;
  background: #007f78;
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  padding: 4px 14px;
  margin-left: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.control-title {
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  margin: 0;
}

.mode-list {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.mode-button {
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.mode-circle {
  width: 26px;
  height: 26px;
  border: 2px solid white;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 12px;
}

.mode-button.active .mode-circle {
  background: white;
  color: #007f78;
}

.mode-label {
  font-size: 10px;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #007f78;
  border-radius: 12px;
  padding: 10px 12px;
  max-height: 695px;
  overflow: hidden;
  margin-top: 8px;
}

.charts-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.charts-main-title {
  text-align: center;
  margin: 0;
  font-size: 22px;
}

.charts-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.time-window-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-window-label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}

.time-window-btn {
  padding: 4px 10px;
  border: 1px solid #999;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 12px;
  color: #333;
}

.time-window-btn:hover {
  background: #e0e0e0;
}

.time-window-btn.active {
  background: #007f78;
  color: #fff;
  border-color: #007f78;
}

.export-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-format-select {
  height: 30px;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 0 6px;
  font-size: 13px;
  background: #fff;
  color: #000;
  cursor: pointer;
}

.charts-action-btn {
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.kayit-btn {
  background: #007f78;
  color: #fff;
}

.kayit-btn:hover {
  background: #006560;
}

.sifirla-btn {
  background: #e53e3e;
  color: #fff;
}

.sifirla-btn:hover {
  background: #c53030;
}

/* Chart content area — charts themselves are non-interactive */
.charts-content {
  pointer-events: none;
  min-width: 0;     /* ← EKLE */
  min-height: 0;    /* ← EKLE */
  overflow: hidden; /* ← EKLE */
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.charts-grid--3col {
  grid-template-columns: 1fr 1fr 1fr;
}

.chart-block {
  min-width: 0;
}

.chart-block h2 {
  text-align: center;
  margin: 0 0 8px 0;
  font-size: 15px;
}

.chart-box {
  width: 100%;
  height: 240px;
}

@media (max-width: 1100px) {
  .charts-grid--3col {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 800px) {
  .charts-grid,
  .charts-grid--3col {
    grid-template-columns: 1fr;
  }
}

/* RIGHT */
.right-sidebar {
  background: #ffffff;
  border: 1px solid #007f78;
  border-radius: 20px;
  padding: 12px 10px;
  overflow-y: auto;
  max-height: 100%;  
  position: relative;
  z-index: 10;
  isolation: isolate;
}
.param-section {
  margin-bottom: 26px;
}

.param-section h3 {
  color: #005b77;
  margin: 0 0 14px 0;
  font-size: 16px;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.param-label-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.param-red-dot {
  width: 16px;
  height: 16px;
  background: red;
  border: 1px solid #000;
  border-radius: 0;
  flex-shrink: 0;
}

.param-label {
  font-size: 14px;
}

.param-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-input {
  width: 82px;
  height: 24px;
  border: 1px solid #999;
  outline: none;
  padding: 2px 6px;
  background: #ffffff;
  color: #222222;
  color-scheme: light;
  position: relative;
  z-index: 300;
  pointer-events: auto;
}

/* RESPONSIVE */
@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 140px 1fr;
  }

  .right-sidebar {
    grid-column: 1 / -1;
  }
}

@media (max-width: 800px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .top-row {
    flex-direction: column;
  }

  .left-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .top-card,
  .control-panel {
    width: 100%;
  }
}

/* FLUID SELECTOR */
.fluid-selector {
  position: relative;
  width: 260px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.fluid-card {
  width: 260px;
  flex: 1;
  background: #0b6b8f;
  color: white;
  border: 2px solid #1c2f39;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.18);
  padding: 4px 14px 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fluid-title {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.fluid-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 2px solid rgba(255, 255, 255, 0.45);
  padding-top: 8px;
}

.fluid-selected-text {
  flex: 1;
  min-height: 20px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fluid-arrow-btn {
  border: none;
  background: transparent;
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.fluid-dropdown {
  position: absolute;
  top: 78px;
  left: 18px;
  width: 174px;
  min-height: 430px;
  background: #ffffff;
  border: 2px solid #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  z-index: 30;
}

.fluid-search-row {
  position: relative;
  height: 34px;
  border-bottom: 1px solid #1e1e1e;
}

.fluid-search-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 4px 34px 4px 8px;
  font-size: 16px;
}

.fluid-search-icon {
  position: absolute;
  right: 6px;
  top: 5px;
  color: #222;
}

.fluid-options {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.fluid-option {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  text-align: left;
  padding: 4px 10px;
  color: #000;
  cursor: pointer;
  font-size: 16px;
}


.fluid-option:hover {
  background: #f2f2f2;
}

.fluid-option-box {
  width: 18px;
  height: 18px;
  background: red;
  border: 1px solid #000;
  flex-shrink: 0;
}

.fluid-empty {
  padding: 10px;
  font-size: 14px;
  color: #666;
}

.active-mode-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #005b77;
  font-weight: 700;
}

.param-stepper-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background-color: #1f2937;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.step-btn:hover {
  opacity: 0.9;
}
</file>

<file path="src/App.tsx">
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
</file>

<file path="src/data/mockData.ts">
import type {
  ParameterItem,
  FluidOption,
  OpeningTimePoint,
  CurrentTimePoint,
} from "../types";

export const pidParameters: ParameterItem[] = [
  { label: "Setpoint (bar)", key: "setpoint" },   // ← YENİ
  { label: "Kp", key: "kp" },
  { label: "Ki", key: "ki" },
  { label: "Kd", key: "kd" },
  { label: "Ölü Bant (bar)", key: "deadband" },   // ← YENİ
  { label: "Sample Time (ms)", key: "sampleTime" },
  { label: "Filtre fc (Hz)", key: "filterFc" },
];


export const geometryParameters: ParameterItem[] = [
  { label: "Pitch (mm)", key: "pitch" },
  { label: "Orifis Çapı (mm)", key: "orifice" },
  { label: "Koni Açısı (°)", key: "coneAngle" },
  { label: "Cd", key: "cd" },
];

export const limitParameters: ParameterItem[] = [
  { label: "Max P1 (bar)", key: "maxP1" },
  { label: "Max ΔP (bar)", key: "maxDeltaP" },
  { label: "Max Açıklık (%)", key: "maxOpen" },
  { label: "E-stop", key: "estop" },
];



export const fluidOptions: FluidOption[] = [
  { id: "hava_ideal", label: "Hava (İdeal Gaz)" },
  { id: "hava_z1", label: "Hava ( Z ~1 )" },
  { id: "azot_ideal", label: "Azot (İdeal Gaz)" },
  { id: "azot_gercek", label: "Azot (Gerçek Gaz)" },
];

export const flowData = [
  { time: 0, debi: 0, aciklik: 0 },
  { time: 1, debi: 2, aciklik: 12 },
  { time: 2, debi: 5, aciklik: 28 },
  { time: 3, debi: 7.5, aciklik: 40 },
  { time: 4, debi: 9, aciklik: 50 },
  { time: 5, debi: 8, aciklik: 44 },
  { time: 6, debi: 8.1, aciklik: 45 },
  { time: 7, debi: 8, aciklik: 44.5 },
  { time: 8, debi: 8, aciklik: 44.5 },
  { time: 9, debi: 8, aciklik: 44.5 },
  { time: 10, debi: 8, aciklik: 44.5 },
];

export const pressureData = [
  { time: 0, p1: 10, p2: 0, deltaP: 10 },
  { time: 1, p1: 10, p2: 2, deltaP: 8 },
  { time: 2, p1: 10, p2: 6, deltaP: 4 },
  { time: 3, p1: 10, p2: 8, deltaP: 2 },
  { time: 4, p1: 10, p2: 9, deltaP: 1 },
  { time: 5, p1: 9.9, p2: 8, deltaP: 1.9 },
  { time: 6, p1: 9.9, p2: 8, deltaP: 1.9 },
  { time: 7, p1: 10, p2: 8, deltaP: 2 },
  { time: 8, p1: 10, p2: 8, deltaP: 2 },
  { time: 9, p1: 10, p2: 8, deltaP: 2 },
  { time: 10, p1: 9.9, p2: 8, deltaP: 1.9 },
];

export const openingPressureData = [
  { opening: 0, p1: 10, p2: 0, deltaP: 10 },
  { opening: 20, p1: 10, p2: 2.5, deltaP: 7.5 },
  { opening: 40, p1: 10, p2: 5, deltaP: 5 },
  { opening: 60, p1: 10, p2: 7.2, deltaP: 2.8 },
  { opening: 80, p1: 10, p2: 8.6, deltaP: 1.4 },
  { opening: 100, p1: 10, p2: 9.4, deltaP: 0.6 },
];

export const openingFlowData = [
  { opening: 0, debi: 0 },
  { opening: 20, debi: 1.8 },
  { opening: 40, debi: 3.9 },
  { opening: 60, debi: 6.1 },
  { opening: 80, debi: 7.5 },
  { opening: 100, debi: 8.4 },
];

export const cvData = [
  { opening: 0, cv: 0 },
  { opening: 20, cv: 8 },
  { opening: 40, cv: 18 },
  { opening: 60, cv: 31 },
  { opening: 80, cv: 43 },
  { opening: 100, cv: 52 },
];

export const openingTimeData: OpeningTimePoint[] = [
  { time: 0, aciklik: 0 },
  { time: 1, aciklik: 12 },
  { time: 2, aciklik: 28 },
  { time: 3, aciklik: 40 },
  { time: 4, aciklik: 50 },
  { time: 5, aciklik: 44 },
  { time: 6, aciklik: 45 },
  { time: 7, aciklik: 44.5 },
  { time: 8, aciklik: 44.5 },
  { time: 9, aciklik: 44.5 },
  { time: 10, aciklik: 44.5 },
];

export const currentTimeData: CurrentTimePoint[] = [
  { time: 0, akim: 0 },
  { time: 1, akim: 150 },
  { time: 2, akim: 320 },
  { time: 3, akim: 480 },
  { time: 4, akim: 520 },
  { time: 5, akim: 490 },
  { time: 6, akim: 480 },
  { time: 7, akim: 475 },
  { time: 8, akim: 475 },
  { time: 9, akim: 475 },
  { time: 10, akim: 475 },
];


export const sensorCalibParameters: ParameterItem[] = [
  { label: "Sensör Ofset (bar)", key: "adcOffset" },
  { label: "Sensör Gain (×)",    key: "adcGain" },
];

export const calibrationParameters: ParameterItem[] = [
  { label: "Maks. Strok (mm)",     key: "maxStroke" },
  { label: "Yön (0=CW, 1=CCW)",    key: "calibDir" },
  { label: "Seating Eşiği (mA)",   key: "seatingLoad" },
  { label: "Backoff",              key: "backoffOffset" },
];
</file>

<file path="src/types.ts">
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
</file>

</files>
