import { defineStore } from "pinia";

interface calibrationLine {
    wavelength: number,
    position: number,
    locked: boolean
}

export const useSpectrumMeterConfig = defineStore({
    id: 'spectrumMeterConfig',
    state: () => {
        return {
            calibLines: [] as calibrationLine[],
            rowBegin: 0.35 as number,
            rowEnd: 0.65 as number
        }
    }
})