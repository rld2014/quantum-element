<template>
  <el-container direction:vertical="true" style="height:100%; flex-flow:column">
    <el-header style="display:flex;flex-flow:row;height: min-content; justify-content: center;">
      <span style="display:flex;align-items: center;">设备</span>
      <el-select v-model="videoDeviceID" class="options" placeholder="设备" @change="onOpitonsChanged">
        <el-option v-for="option in sourceOptionList" :key="option.deviceId" :label="option.label"
          :value="option.deviceId">
        </el-option>
      </el-select>
      <span style="display:flex;align-items: center;">横向起始位置</span>
      <el-input v-model="rowBegin" type="number" min="0" max="1" step="0.001" style="width:200px"
        @change="onCalibLineModified"></el-input>
      <span style="display:flex;align-items: center;">横向结束位置</span>
      <el-input v-model="rowEnd" type="number" min="0" max="1" step="0.001" style="width:200px"
        @change="onCalibLineModified"></el-input>
    </el-header>
    <el-main class="upperContainer" id="upper">
      <div style="display:flex;width:70%;position: relative; margin-right: 5px;">
        <video class="videoInput" style="width: 100%; height: 100%; object-fit: fill" autoplay playsineline> </video>
        <canvas class="videoOverlay" id="overlay" width="1000" height="500"></canvas>
      </div>
      <div style="flex-flow:column; width:30%">
        <el-table style="width:100%" :data="caliblines" :max-height="maxTableHeight">
          <el-table-column prop="wavelength" label="对应波长">
            <template #default="scope">
              <el-input v-model="scope.row.wavelength" type="number" min="0" max="10000" step="0.1"
                v-on:change="onCalibLineModified()"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="纵向相对位置">
            <template #default="scope">
              <el-input v-model="scope.row.position" type="number" min="0" max="1" step="0.001"
                v-on:change="onCalibLineModified()">
              </el-input>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作">
            <template #default="scope">
              <el-button type="primary" size="small" plain @click.prevent="onInsertLine($event,scope.row)">
                插入
              </el-button>
              <el-button type="danger" size="small" plain :disabled="scope.row.locked"
                @click.prevent="onDeleteRow($event, scope.row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
    <el-main class="lowerContainer">
      <div class="chart" id="resultChart" style="display:flex"></div>
    </el-main>
    <canvas class="vidProcCanvas" id="vidProcCanvas"></canvas>
  </el-container>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts';
import { nextTick } from 'process';
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import pinia from '@/storages';
import { useSpectrumMeterConfig } from '@/storages/spectrumMeterCfg'
import { storeToRefs } from 'pinia';
import { unFocus } from '@/scripts/utils';
const config = useSpectrumMeterConfig(pinia)
const { calibLines: calibLineStore, rowBegin: rowBeginStore, rowEnd: rowEndStore } = storeToRefs(config)
let caliblines = ref([])
var myChart;
let chartContainer;
const sourceOptionList = ref([])
const videoDeviceID = ref()
let onInit = true
let currentStream;
let overlayCanvas: HTMLCanvasElement;
let videoInput: HTMLVideoElement, videoProcCanvas: HTMLCanvasElement;
let vidProcContext: CanvasRenderingContext2D;
let vidProcTimer;
let rowBegin = ref(0.35)
let rowEnd = ref(0.65)

async function onDeleteRow(event, row) {
  unFocus(event)
  caliblines.value.splice(caliblines.value.indexOf(row), 1)
  onCalibLineModified()
}

async function onCalibLineModified() {
  validRange()
  let context = overlayCanvas.getContext('2d')
  const { width, height } = overlayCanvas
  context.lineWidth = 1
  context.strokeStyle = "rgba(0,0,0,1)"
  context.clearRect(0, 0, width, height)
  context.fillStyle = "rgba(0, 0, 200, 0.5)"
  context.strokeStyle = 'rgb(0,0,0)'
  context.fillRect(0, height * rowBegin.value, width, height * (rowEnd.value - rowBegin.value))
  context.strokeRect(0, height * rowBegin.value, width, height * (rowEnd.value - rowBegin.value))
  context.beginPath()
  caliblines.value.forEach(line => {
    context.moveTo(line.position * width, 0)
    context.lineTo(line.position * width, height)
  })
  context.stroke()
}
function validRange() {
  if (rowBegin.value >= rowEnd.value) {
    rowBegin.value = rowEnd.value - 0.01
  }
  caliblines.value.forEach(line => {
    line.wavelength = Number(line.wavelength),
      line.position = Number(line.position)
  })
}
async function onInsertLine(event, row) {
  unFocus(event)
  const index = caliblines.value.indexOf(row)
  const length = caliblines.value.length
  const lastIndex = index - 1 > 0 ? index - 1 : 0
  const nextIndex = index > length - 1 ? index : length - 1
  const item = {
    wavelength: (caliblines.value[lastIndex].wavelength + caliblines.value[nextIndex].wavelength) / 2,
    position: (caliblines.value[lastIndex].position + caliblines.value[nextIndex].position) / 2,
    locked: false
  }
  caliblines.value.splice(index == 0 ? 1 : index, 0, item)
  onCalibLineModified()
}
onMounted(() => {
  myChart = echarts.init(document.getElementById('resultChart'), 'dark');
  myChart.setOption({
    title: {
      text: '相对强度'
    },
    backgroundColor: '#1C1D1F',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        snap: true
      }
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'slider',
        xAxisIndex: [0],
        filterMode: 'none'
      },
      {
        id: 'dataZoomY',
        type: 'slider',
        yAxisIndex: [0],
        filterMode: 'none'
      },
      {
        type: 'inside',
        xAxisIndex: [0],
      },
      {
        type: 'inside',
        yAxisIndex: [0],
      }
    ],
    xAxis: {
      axisPointer: {
        snap: true
      }
    },
    yAxis: {
      min: 0,
      max: 255,
      axisPointer: {
        snap: true
      }
    },
    series: [
      {
        name: '相对强度',
        type: 'line',
        data: []
      }
    ]
  });
  chartContainer = document.getElementById('resultChart')

  start()
  window.addEventListener('resize', resizeChart)
  window.addEventListener('resize', resizeTable)
  resizeChart()
  resizeTable()
  overlayCanvas = document.querySelector('videoOverlay')
  caliblines.value = calibLineStore.value
  rowBegin.value = rowBeginStore.value
  rowEnd.value = rowEndStore.value
  if (caliblines.value.length == 0) {
    caliblines.value = [{
      wavelength: 0,
      position: 0.,
      locked: true
    },
    {
      wavelength: 2000,
      position: 1.,
      locked: true
    }
    ]
  }
  videoProcCanvas = document.getElementById('vidProcCanvas')
  overlayCanvas = document.getElementById('overlay')
  videoInput = document.getElementsByClassName('videoInput')[0]
  vidProcContext = videoProcCanvas.getContext('2d')
  videoInput.onplay = initVideoProcessing()
  onCalibLineModified()
})

let maxTableHeight = ref(0);

async function resizeTable() {
  nextTick(() => {
    maxTableHeight.value = videoInput.clientHeight - 41 - 15 - 39.2 - 35;
  })
}
async function resizeChart() {
  nextTick(() => {
    myChart.resize({
      width: chartContainer.clientWidth,
      height: chartContainer.clientHeight - 35
    })
  })
}
async function initVideoProcessing() {
  nextTick(() => {
    vidProcContext.drawImage(videoInput, 0, 0)
    vidProcTimer = setInterval(doVideoProcessing, 200)
  })
}
async function doVideoProcessing() {
  videoProcCanvas.width = videoInput.videoWidth
  videoProcCanvas.height = videoInput.videoHeight
  vidProcContext.drawImage(videoInput, 0, 0)
  const data = vidProcContext.getImageData(0, 0, videoInput.videoWidth, videoInput.videoHeight)
  let res = await window.cv.findSpectrum(data, videoInput.videoWidth, videoInput.videoHeight,
    JSON.stringify(caliblines.value),
    JSON.stringify({ begin: rowBegin.value, end: rowEnd.value }))
  myChart.setOption({
    series: {
      data: res
    },
    xAxis: {
      min: caliblines.value.at(0).wavelength,
      max: caliblines.value.at(-1).wavelength
    }
  })
}

async function onOpitonsChanged() {
  currentStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
    track.stop()
  });
  const constraints: MediaStreamConstraints = {
    video: { deviceId: videoDeviceID.value, }
  };
  currentStream = await navigator.mediaDevices.getUserMedia(constraints)
  document.querySelector('video').srcObject = currentStream

}
async function gotStream(stream: MediaStream) {
  currentStream = stream
  document.querySelector('video').srcObject = currentStream
  return navigator.mediaDevices.enumerateDevices()
}
async function initDeviceList(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  sourceOptionList.value = []
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
      sourceOptionList.value.push({
        label: deviceInfo.label,
        deviceId: deviceInfo.deviceId,
      })
    }
  }
  if (onInit) {
    videoDeviceID.value = sourceOptionList.value[0].deviceId
    onInit = false
  }
}
async function start() {
  navigator.mediaDevices.enumerateDevices().then(initDeviceList).then(async () => {
    const constraints: MediaStreamConstraints = {
      video: { deviceId: sourceOptionList.value[0].deviceId }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(initDeviceList)
  })
}
onUnmounted(() => window.removeEventListener('resize', myChart.resize()))
onBeforeUnmount(() => {
  config.calibLines = caliblines.value
  config.rowBegin = rowBegin.value
  config.rowEnd = rowEnd.value
  clearInterval(vidProcTimer)
  window.removeEventListener('resize', resizeChart)
  myChart.dispose()
})
</script>
<style scoped>
.upperContainer {
  display: flex;
  width: 100%;
  height: 50%;
}

.lowerContainer {
  display: flex;
  width: 100%;
  height: 50%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lowerContainer,
.upperContainer {
  min-width: 25%;
  padding: 5px;
}

.chart {
  display: flex;
  width: 100%;
  height: 100%;
}

.videoOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.vidProcCanvas {
  display: none
}
</style>