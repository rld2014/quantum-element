<template>
  <el-container direction:vertical="true" style="height:100%; flex-flow:column">
    <el-header style="display:flex;flex-flow:row;height: min-content; justify-content: center; padding: 5px;">
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
        <el-table :data="caliblines" :row-style="{height: 35+'px'}" :max-height="maxTableHeight">

          <el-table-column prop="wavelength" label="对应波长" width="120px">
            <template #default="scope">
              <el-input v-model="scope.row.wavelength" type="number" min="0" max="10000" step="0.1"
                v-on:change="onCalibLineModified()"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="纵向相对位置" width="120px">
            <template #default="scope">
              <el-input v-model="scope.row.position" type="number" min="0" max="1" step="0.001"
                v-on:change="onCalibLineModified()">
              </el-input>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150px">
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
const playBtnIcon = require('@/assets/playBtn.svg')
const pauseBtnIcon = require('@/assets/pauseBtn.svg')
const config = useSpectrumMeterConfig(pinia)
const { calibLines: calibLineStore, rowBegin: rowBeginStore, rowEnd: rowEndStore } = storeToRefs(config)
let caliblines = ref([])
var spectrumChart;
let chartContainer;
const sourceOptionList = ref([])
const videoDeviceID = ref()
let onInit = true
let currentStream;
let overlayCanvas: HTMLCanvasElement;
let videoInput: HTMLVideoElement, videoProcCanvas: HTMLCanvasElement;
let vidProcContext: CanvasRenderingContext2D;
var vidProcTimer;
let rowBegin = ref(0.35)
let rowEnd = ref(0.65)
const currentData = ref([])
const markPointData = ref([])
async function onDeleteRow(event, row) {
  unFocus(event)
  caliblines.value.splice(caliblines.value.indexOf(row), 1)
  onCalibLineModified()
}

async function onCalibLineModified() {
  if (!isRangesValidated()) return;
  let context = overlayCanvas.getContext('2d')
  const { width, height } = overlayCanvas
  context.lineWidth = 1
  context.strokeStyle = "rgba(0,0,0,1)"
  context.clearRect(0, 0, width, height)
  context.fillStyle = "rgba(64, 158, 255, 0.5)"
  context.strokeStyle = '#FFFFFF'
  context.fillRect(
    0,  //x
    height * rowBegin.value,                  //y
    width, //width
    height * (rowEnd.value - rowBegin.value)  //height
  )
  context.strokeRect(
    0,  //x
    height * rowBegin.value,                  //y
    width, //width
    height * (rowEnd.value - rowBegin.value)  //height
  )
  context.beginPath()
  caliblines.value.forEach(line => {
    context.moveTo(line.position * width, 0)
    context.lineTo(line.position * width, height)
    context.fillStyle = "#409eff"
    context.font = '20px Noto Sans Mono'
    context.fillText(`pos: ${line.position}`, line.position > 0.5 ? (line.position * width - 100) : (line.position * width), 0.2 * height)
    context.fillText(`wl: ${line.wavelength}`, line.position > 0.5 ? (line.position * width - 100) : (line.position * width), 0.2 * height + 22)
  })
  context.stroke()
}
function isRangesValidated() {
  if (rowBegin.value >= rowEnd.value) {
    rowBegin.value = rowEnd.value - 0.01
  }
  caliblines.value.forEach(line => {
    line.wavelength = Number(line.wavelength),
      line.position = Number(line.position)
  })
  for (let i = 0; i < caliblines.value.length - 1; i++) {
    if (caliblines.value[i].wavelength >= caliblines.value[i + 1].wavelength
      || caliblines.value[i].position >= caliblines.value[i + 1].position
    ) {
      return false
    }
  }
  return true
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
  spectrumChart = echarts.init(document.getElementById('resultChart'), 'dark');
  spectrumChart.setOption({
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
        myPlay: {
          show: true,
          title: '开始采集',
          icon: `image://${playBtnIcon}`,
          onclick: async function () {
            if (!vidProcTimer) {
              vidProcTimer = setInterval(doVideoProcessing, 200)
            }
          }
        },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
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
  spectrumChart.showLoading(
    {
      color: '#2a598a',
      maskColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#A3A6AD'
    }
  )
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
  spectrumChart.on('dblclick', function (params) {
    console.log(params.componentType)
    if (params.componentType == 'markPoint') {
      console.log(markPointData.value.splice(markPointData.value.findIndex(_data => _data.coord[0] == params.data[0]), 1))
      return
    }
    markPointData.value.push({
      coord: params.data,
      value: `${params.data[0]}nm\n ${params.data[1]}`,
      symbol: 'pin',
      animation: true,
      label: {
        show: true,
        color: '#e5eaf3'
      }
    })
    spectrumChart.setOption({
      series: {
        data: currentData.value,
        markPoint: markPointData.value
      }
    })
  })
})

let maxTableHeight = ref(0);



async function resizeTable() {
  nextTick(() => {
    maxTableHeight.value = videoInput.clientHeight - 41 - 15 - 39.2 - 35;
  })
}
async function resizeChart() {
  nextTick(() => {
    spectrumChart.resize({
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
  if (!isRangesValidated()) return;
  videoProcCanvas.width = videoInput.videoWidth
  videoProcCanvas.height = videoInput.videoHeight
  vidProcContext.drawImage(videoInput, 0, 0)
  let data: ImageData
  try {
    data = vidProcContext.getImageData(0, 0, videoInput.videoWidth, videoInput.videoHeight)
  } catch (e: any) {
    return
  }
  let res = await window.cv.findSpectrum(data, videoInput.videoWidth, videoInput.videoHeight,
    JSON.stringify(caliblines.value),
    JSON.stringify({ begin: rowBegin.value, end: rowEnd.value }))
  currentData.value = res
  spectrumChart.setOption({
    series: {
      data: res,
      markPoint: {
        data: markPointData.value
      }
    },
  })
  spectrumChart.hideLoading()
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
onUnmounted(() => window.removeEventListener('resize', spectrumChart.resize()))
onBeforeUnmount(() => {
  config.calibLines = caliblines.value
  config.rowBegin = rowBegin.value
  config.rowEnd = rowEnd.value
  clearInterval(vidProcTimer)
  window.removeEventListener('resize', resizeChart)
  spectrumChart.dispose()
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