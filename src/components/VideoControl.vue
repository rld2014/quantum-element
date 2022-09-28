<template>
  <el-container>
    <el-header class="streamSpecs">
      <el-row>
        <p>视频设备: </p>
        <el-select v-model="vidSrcOption" class="options" placeholder="设备" @change="onDeviceChanged">
          <el-option v-for="option in sourceOptionList" :key="option.deviceId" :label="option.label" :value="option" />
        </el-select>
        <p>分辨率: </p>
        <el-select v-model="vidResOption" class="options" placeholder="分辨率" @change="onOpitonsChanged">
          <el-option v-for="option in resoloutionOptionList" :key="option.label" :label="option.label"
            :value="option" />
        </el-select>
      </el-row>
      <el-row>
        <p>如遇软件卡顿或延迟过高, 请尝试降低分辨率</p>
      </el-row>
    </el-header>
    <el-scrollbar style="display:flex;height:80%; width:100%">
      <el-main style="display: inline-block;justify-content:center;height:100% width:100%;position: relative;">
        <video id="capture" autoplay playsineline style="display:inline-block; overflow: hidden;"></video>
        <div class="videoOverlay">
          <img src="@/assets/crossline.png" class="crossline">
        </div>
      </el-main>
    </el-scrollbar>
    <el-scrollbar style="height:20%;">
      <el-row class="optionSlider" id="exposureTime" disabled="true" v-model="exposureTime">
        <el-col :span="3" style="align-items:flex-start">
          <p>曝光时间:</p>
        </el-col>
        <el-col :span="20">
          <el-slider class="exposuretime" show-input></el-slider>
        </el-col>
      </el-row>
      <el-row class="optionSlider" id="iso" disabled="true" v-model="iso">
        <el-col :span="3" style="align-items:flex-start">
          <p>感光度:</p>
        </el-col>
        <el-col :span="20">
          <el-slider class="iso" show-input ></el-slider>
        </el-col>
      </el-row>
    </el-scrollbar>
  </el-container>
</template>
<script lang="ts" setup>
import { nextTick } from 'process';
import { onMounted, ref } from 'vue';
const vidSrcOption = ref<videoSourceOption>({})
const vidResOption = ref<videoResolutionOption>({})
const exposureTime = ref<ConstrainULong>(50)
const iso=ref(50)
const exposureTimeDisabled = ref(true)
const isoDisabled=ref(true)
const exposureTimeSlider = document.querySelector('optionSlider#exposureTime')
const isoSlider = document.querySelector('optionSlider#iso')
let currentStream: MediaStream
interface videoSourceOption {
  label: String,
  deviceId: String
}
interface videoResolutionOption {

  label: String
  value: {
    width: Number,
    height: Number,
  }
}
let onInit = true
var sourceOptionList = ref<videoSourceOption[]>([])
var resoloutionOptionList = ref<videoResolutionOption[]>([])
async function onDeviceChanged() {
  const constraints: MediaStreamConstraints = {
    video: { deviceId: vidSrcOption.value.deviceId }
  };
  navigator.mediaDevices.getUserMedia(constraints).then(initStreamSettings).then(initDeviceList)
}
async function onOpitonsChanged() {
  currentStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
    track.stop()
  });
  const constraints: MediaStreamConstraints = {
    video: {
      deviceId: vidSrcOption.value.deviceId,
      width: { exact: vidResOption.value.value.width },
      height: vidResOption.value.value.height
    }

  };
  console.log(constraints)
  currentStream = await navigator.mediaDevices.getUserMedia(constraints)
  document.querySelector('video').srcObject = currentStream
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
    vidSrcOption.value = sourceOptionList.value[0]
  }
}
async function initStreamSettings(stream: MediaStream) {
  const track = stream.getVideoTracks()[0]
  const trackCapabilities = track.getCapabilities()
  const { width, height } = { width: trackCapabilities.width.max, height: trackCapabilities.height.max, }
  let div = 1.;
  resoloutionOptionList.value = []
  for (let i = 0; i < 4; i++) {
    const _width = Math.floor(width / div)
    const _height = Math.floor(height / div)
    if (i !== 0 && (_width < 320 || _height < 180)) break
    resoloutionOptionList.value.push(
      {
        label: `${_width}x${_height}`,
        value: {
          width: _width,
          height: _height,
        }
      }
    )
    div *= 1.5
  }
  if(trackCapabilities.exposuretime){

  }
  const settings = track.getSettings()
  vidResOption.value = resoloutionOptionList.value[0]
  currentStream = stream
  const video = document.querySelector('video')
  video.srcObject = stream
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

async function handleError(error) {
  console.error('navigator.MediaDevices.getUserMedia error: ', error.name, error.Message);
}
async function start() {
  navigator.mediaDevices.enumerateDevices().then(initDeviceList).then(async () => {
    const constraints: MediaStreamConstraints = {
      video: { deviceId: sourceOptionList.value[0].deviceId }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(initStreamSettings).then(initDeviceList).then(onOpitonsChanged);
  })
}
onMounted(async () => {
  console.log(navigator.mediaDevices.getSupportedConstraints())
  await start();
  console.log('in OnMounted()', vidSrcOption, vidResOption)
})
</script>
<style scoped>
.el-container {
  height: 100%;
}

.streamSpecs {
  width: 100%;
  padding: 0;
  display: flex;
  flex-flow: column;
  justify-content: space-around;
  align-items: center;
  height: min-content;
  user-select: none;
}

.options {
  display: flex;
  align-items: center;
}

p {
  text-align: left;
  display: flex
}

.optionSlider {
  align-items: center;
  justify-content: center;
}

.videoOverlay {
  display: flex;
  align-items: center;

  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
}

.crossline {
  width: 20%;
  margin-left: 40%;
  margin-top: 18.1%;
}
</style>