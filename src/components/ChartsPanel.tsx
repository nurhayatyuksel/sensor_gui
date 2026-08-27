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

function paddedDomain<T extends object>(
  data: readonly T[],
  keys: readonly (keyof T)[]
): [number, number] {
  const values: number[] = [];

  for (const item of data) {
    for (const key of keys) {
      const value = item[key] as unknown;

      if (typeof value === "number" && Number.isFinite(value)) {
        values.push(value);
      }
    }
  }

  if (values.length === 0) return [0, 1];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.1, 0.1);
    return [min - pad, max + pad];
  }

  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
}

function TimeBasedCharts({
  pressureData,
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
  const filteredPressure = filterByWindow(pressureData, timeWindow);
  const fmt = (v: unknown) =>
    typeof v === "number" ? v.toFixed(decimalPlaces) : String(v);
  const p1Domain    = paddedDomain(filteredPressure, ["p1"] as const);
  const p2Domain    = paddedDomain(filteredPressure, ["p2"] as const);
  const deltaPDomain = paddedDomain(filteredPressure, ["deltaP"] as const);

  return (
    <div className="charts-grid charts-grid--3col">
      <div className="chart-block">
        <h2>P₁ – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredPressure} margin={{ top: 5, right: 10, left: 15, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                domain={p1Domain}
                tickFormatter={fmt}
                label={{ value: "P1 [bar]", position: "top", offset: 10 }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="p1" stroke="#ff4f7b" dot={false} isAnimationActive={false} name="P₁ [bar]" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>P₂ – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredPressure} margin={{ top: 5, right: 10, left: 15, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                domain={p2Domain}
                tickFormatter={fmt}
                label={{ value: "P2 [bar]", position: "top", offset: 10 }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="p2" stroke="#2b7de9" dot={false} isAnimationActive={false} name="P₂ [bar]" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <h2>ΔP – Zaman Grafiği</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredPressure} margin={{ top: 5, right: 10, left: 15, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                domain={["dataMin", "dataMax"]}
                type="number"
                tickFormatter={fmt}
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                domain={deltaPDomain}
                tickFormatter={fmt}
                label={{ value: "ΔP [bar]",  position: "top", offset: 10 }}
              />
              <Tooltip formatter={fmt} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="deltaP" stroke="#f59e0b" dot={false} isAnimationActive={false} name="ΔP [bar]" />
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

    const headers = ["time", "p1", "p2", "deltaP", "debi", "açiklik", "akim"];

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
