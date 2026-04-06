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