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