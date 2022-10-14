import { defineStore } from "pinia";
import { stringifyQuery } from "vue-router";
class resultRow {
  key: string;
  result: ResultHolder
}
class ResultHolder {
  wavelength: number;
  variance: Map<number, number>
  constructor() {
    this.wavelength = 0
    this.variance = new Map<number, number>()
  }
}

class highPrecAngle {
  degree: number;
  minute: number;
  second: number;
  isValid() {
    return !(!this.degree && !this.minute && !this.second)
  }
  getValueInDegs() {
    return Number(this.degree ?? 0) + Number(this.minute ?? 0) / 60. + Number(this.second ?? 0) / 3600.
  }
  constructor(deg: number, minute: number, second: number) {
    this.degree = deg
    this.minute = minute
    this.second = second
  }
}
interface measurement {
  __alpha1: highPrecAngle;
  __alpha2: highPrecAngle
  level: number;
  theta: number;
}
export const useMeasurements = defineStore({
  id: 'measurements',
  state: () => {
    return {
      gratingLineDensities: new Map<string, number>(),
      measurements: new Map<string, measurement[]>(),
      results: new Map<string, ResultHolder>()
    }
  }
})