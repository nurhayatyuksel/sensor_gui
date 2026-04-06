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

