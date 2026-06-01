import type { SensorCardData } from "../types";

export const sensorCards: SensorCardData[] = [
  { id: "giris", title: "Giriş Basıncı", value: "DEĞER", color: "#12b5ea", unit: "bar", step: 0.1 },
  { id: "cikis", title: "Çıkış Basıncı", value: "DEĞER", color: "#12b5ea", unit: "bar", step: 0.1 },
  { id: "fark", title: "Basınç Farkı", value: "DEĞER", color: "#22c55e", unit: "bar", step: 0.1 },
  { id: "debi", title: "Debi", value: "DEĞER", color: "#22c55e", unit: "kg/s", step: 0.01 },
  { id: "pozisyon", title: "Pozisyon", value: "DEĞER", color: "#22c55e", unit: "mm", step: 0.5 },
];
