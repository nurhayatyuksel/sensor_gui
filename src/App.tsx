import { useState, useCallback } from "react";
import "./App.css";

import { SensorCard } from './components/SensorCard';
import { ControlModePanel } from "./components/ControlModePanel";
import { ChartsPanel } from "./components/ChartsPanel";
import { ParameterSection } from "./components/ParameterPanel";
import { FluidSelector } from "./components/FluidSelector";

import {
  flowData,
  fluidOptions,
  geometryParameters,
  limitParameters,
  pidParameters,
  pressureData,
  openingTimeData,
  currentTimeData,
  openingPressureData,
  openingFlowData,
  cvData,
  sensorCards,
} from "./data/mockData";

import type { FluidOption } from "./types";

type Mode = "Basınç" | "Pozisyon" | "Regülatör" | "Debi";

const modeToCardId: Record<Mode, string | null> = {
  "Basınç": "fark",
  "Debi": "debi",
  "Pozisyon": "pozisyon",
  "Regülatör": null,
};

const emptyFormValues: Record<string, string> = {
  kp: "",
  ki: "",
  kd: "",
  sampleTime: "",
  filterFc: "",
  pitch: "",
  orifice: "",
  coneAngle: "",
  cd: "",
  maxP1: "",
  maxDeltaP: "",
  maxOpen: "",
  estop: "",
};

function App() {
  const [activeMode, setActiveMode] = useState<Mode>("Basınç");
  const [selectedFluid, setSelectedFluid] = useState<FluidOption | null>(null);

  const createEmptySensorValues = () =>
  Object.fromEntries(sensorCards.map((c) => [c.id, ""]));

const [modeSensorValues, setModeSensorValues] = useState<Record<Mode, Record<string, string>>>({
  Basınç: createEmptySensorValues(),
  Pozisyon: createEmptySensorValues(),
  Regülatör: createEmptySensorValues(),
  Debi: createEmptySensorValues(),
});

const handleSensorValueChange = useCallback(
  (id: string, value: string) => {
    setModeSensorValues((prev) => ({
      ...prev,
      [activeMode]: {
        ...prev[activeMode],
        [id]: value,
      },
    }));
  },
  [activeMode]
);

const systemSensorValues: Record<string, string> = {
  fark: "12.4",
  debi: "5.8",
  pozisyon: "47",
};

const currentUserSensorValues = modeSensorValues[activeMode];
  
  const [modeValues, setModeValues] = useState<Record<Mode, Record<string, string>>>({
    Basınç: { ...emptyFormValues },
    Pozisyon: { ...emptyFormValues },
    Regülatör: { ...emptyFormValues },
    Debi: { ...emptyFormValues },
  });

const handleInputChange = (key: string, value: string) => {
    console.log("changed:", key, value);
    setModeValues((prev) => ({
      ...prev,
      [activeMode]: {
        ...prev[activeMode],
        [key]: value,
      },
    }));
  };
  const currentFormValues = modeValues[activeMode];

  return (
    <div className="app-shell">
      <aside className="left-sidebar">
        {sensorCards.map((item) => {
  const editableId = modeToCardId[activeMode];
  const editable = editableId === item.id;

  const displayValue = editable
    ? currentUserSensorValues[item.id] ?? ""
    : systemSensorValues[item.id] ?? "";

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

      <main className="main-content">
        <div className="top-row">
          <FluidSelector
            title="Akışkan"
            options={fluidOptions}
            selectedFluid={selectedFluid}
            onSelect={setSelectedFluid}
          />

          <ControlModePanel activeMode={activeMode} onChange={setActiveMode} />
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
          onReset={() => {
            // TODO: replace with real-time data clear when live data is wired up
            console.log("Grafikler sıfırlandı");
          }}
        />
      </main>

      <aside className="right-sidebar">
        <h2 className="active-mode-title">{activeMode} Modu Parametreleri</h2>
        <ParameterSection
          title="PID/Reg Parametreleri"
          items={pidParameters}
          values={currentFormValues}
          onChange={handleInputChange}
        />

        <ParameterSection
          title="Geometri & Kalibrasyon"
          items={geometryParameters}
          values={currentFormValues}
          onChange={handleInputChange}
        />

        <ParameterSection
          title="Limitler"
          items={limitParameters}
          values={currentFormValues}
          onChange={handleInputChange}
        />
      </aside>
    </div>
  );
}

export default App;