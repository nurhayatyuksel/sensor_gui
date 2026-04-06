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
}: {
  flowData: FlowPoint[];
  pressureData: PressurePoint[];
  openingTimeData: OpeningTimePoint[];
  currentTimeData: CurrentTimePoint[];
  timeWindow: TimeWindow;
}) {
  const filteredFlow = filterByWindow(flowData, timeWindow);
  const filteredPressure = filterByWindow(pressureData, timeWindow);
  const filteredOpening = filterByWindow(openingTimeData, timeWindow);
  const filteredCurrent = filterByWindow(currentTimeData, timeWindow);

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
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Basınç [bar]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="p1" stroke="#ff4f7b" dot={false} name="P₁ [bar]" />
              <Line type="monotone" dataKey="p2" stroke="#2b7de9" dot={false} name="P₂ [bar]" />
              <Line type="monotone" dataKey="deltaP" stroke="#f59e0b" dot={false} name="ΔP [bar]" />
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
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Debi [kg/s]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="debi"
                stroke="#ff5b1f"
                dot={false}
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
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Açıklık [%]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="aciklik"
                stroke="#38c7c7"
                dot={false}
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
                label={{ value: "Zaman [s]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Akım [mA]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="akim"
                stroke="#a855f7"
                dot={false}
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
}: {
  openingPressureData: OpeningPressurePoint[];
  openingFlowData: OpeningFlowPoint[];
  cvData: CvPoint[];
}) {
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
                label={{ value: "Açıklık [%]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Basınç [bar]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="p1" stroke="#ff4f7b" dot={false} name="P₁ [bar]" />
              <Line type="monotone" dataKey="p2" stroke="#2b7de9" dot={false} name="P₂ [bar]" />
              <Line type="monotone" dataKey="deltaP" stroke="#f59e0b" dot={false} name="ΔP [bar]" />
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
                label={{ value: "Açıklık [%]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Debi [kg/s]", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="debi" stroke="#16a34a" dot={false} name="Debi [kg/s]" />
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
                label={{ value: "Açıklık [%]", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Cᵥ", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="cv" stroke="#7c3aed" dot={false} name="Cᵥ" />
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
          />
        ) : (
          <TimeBasedCharts
            flowData={flowData}
            pressureData={pressureData}
            openingTimeData={openingTimeData}
            currentTimeData={currentTimeData}
            timeWindow={timeWindow}
          />
        )}
      </div>
    </div>
  );
}
