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
