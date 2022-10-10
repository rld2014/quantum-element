<template>
  <el-container>
    <el-header class="streamSpecs">
      <el-row>
        <p>视频设备: </p>
        <el-select v-model="videoDeviceID" class="options" placeholder="设备" @change="onDeviceChanged">
          <el-option v-for="option in sourceOptionList" :key="option.deviceId" :label="option.label"
            :value="option.deviceId" />
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
      <div class="block" v-for="setting in enabledSettings">
        <span>{{setting.name}}</span>
        <el-select v-if="setting.modes" v-model="setting.value">
          <el-option v-for="item in setting.modes" :value="item" :label="item"
            :v-on:change="onParametersChanged(setting)">
          </el-option>
        </el-select>
        <el-slider v-if="setting.max" v-model="setting.value" :max="setting.max" :min="setting.min" :step="setting.step"
          :v-on:change="onParametersChanged(setting)"></el-slider>
      </div>
      <div v-if="enabledSettings.length===0" style="text-align:center">
        该相机不受支持，无法调整参数<br>
        请尝试使用其它相机, 或在设置中打开“使用openCV调整相机参数”<br>
        请注意: 即使使用OpenCV, 某些相机仍然无法正常调整参数
      </div>
    </el-scrollbar>
  </el-container>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import pinia from '@/storages'
import { useSettings } from '@/storages/settings'
import { storeToRefs } from 'pinia';
const videoDeviceID = ref()
const vidResOption = ref<videoResolutionOption>()
const settings = useSettings(pinia)
const { desiredVideoSettings } = storeToRefs(settings)
const enabledSettings = ref([])
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
  currentStream.getVideoTracks().forEach(track => track.stop())
  console.log(videoDeviceID.value)
  const constraints: MediaStreamConstraints = {
    video: { deviceId: videoDeviceID.value }
  };
  navigator.mediaDevices.getUserMedia(constraints).then(initStreamSettings).then(initDeviceList)
}
async function onParametersChanged(setting) {
  let constraints = { advanced: [] }
  constraints.advanced.push({ [setting.propName]: setting.value })
  const video = document.querySelector('video')
  currentStream.getVideoTracks().forEach(async track => await track.applyConstraints(constraints))
}
async function onOpitonsChanged() {
  currentStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
    track.stop()
  });
  const constraints: MediaStreamConstraints = {
    video: {
      deviceId: videoDeviceID.value,
      width: vidResOption.value.value.width,
      height: vidResOption.value.value.height
    }
  };
  console.log(sourceOptionList)
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
    videoDeviceID.value = sourceOptionList.value[0].deviceId
    onInit=false
  }
}
async function initStreamSettings(stream: MediaStream, onRefresh: boolean = false) {
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
  const settings = track.getSettings()
  enabledSettings.value = []
  for (const setting of desiredVideoSettings.value) {
    if (!(setting.propName in settings)) {
      continue;
    }
    let enabledSetting = setting
    if (Array.isArray(trackCapabilities[setting.propName])) {
      // Map it to a select element.
      Object.assign(enabledSetting, {
        modes: trackCapabilities[setting.propName],
        value: settings[setting.propName]
      })
    } else {
      // Map it to a slider element.
      Object.assign(enabledSetting, {
        min: trackCapabilities[setting.propName].min,
        max: trackCapabilities[setting.propName].max,
        step: trackCapabilities[setting.propName].step,
        value: settings[setting.propName],
      })
    }
    console.log(enabledSetting)
    enabledSettings.value.push(enabledSetting)
  }
  vidResOption.value = resoloutionOptionList.value[0]

  const video = document.querySelector('video')
  video.srcObject = stream
  currentStream = stream
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
    navigator.mediaDevices.getUserMedia(constraints).then(initStreamSettings).then(initDeviceList).then(onOpitonsChanged).catch(handleError);
  }).catch(handleError)
}
onMounted(async () => {

  console.log(desiredVideoSettings)
  console.log(navigator.mediaDevices.getSupportedConstraints())
  start();
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
  justify-content: center;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

.crossline {
  display: flex;
  height: 80px;
  justify-content: center;
  align-items: center;
}
</style>