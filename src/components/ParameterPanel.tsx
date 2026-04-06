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