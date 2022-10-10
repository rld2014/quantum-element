import { defineStore } from "pinia";
import fs from 'fs';
export const useSettings = defineStore({
  id: 'settings',
  state: () => {
    return {
      desiredVideoSettings: [
        {
          label: 'exposure mode',
          propName: 'exposureMode',
        },
        {
          label: 'exposure time',
          propName: 'exposureTime',
        },
        {
          label: 'exposure compensation',
          propName: 'exposureCompensation',
        },
      ]
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'appsettings',
        storage: localStorage
      }
    ]
  }
})