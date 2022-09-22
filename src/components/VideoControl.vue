<template>
  <el-container>
    <el-header class="streamSpecs">
      <el-row>
        <p>视频设备: </p>
        <el-select v-model="vidSrcOption" class="options" placeholder="采集设备" @change="onOpitonsChanged">
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
    <el-main style="display: flex;justify-content:center;">
      <video id="capture" autoplay playsineline style="display: block;"></video>
    </el-main>
    <el-main class="configurations" style="flex-flow:column">
      <el-row>
        曝光时间: <el-slider class="exposuretime"></el-slider>
      </el-row>
      <el-row>
        感光度: <el-slider class="iso"></el-slider>
      </el-row>
    </el-main>
  </el-container>
</template>
<script lang="ts" setup>
import { nextTick } from 'process';
import { onMounted, ref } from 'vue';
const vidSrcOption = ref<videoSourceOption>({})
const vidResOption = ref<videoResolutionOption>({})
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
var sourceOptionList = ref<videoSourceOption[]>([])
var resoloutionOptionList = ref<videoResolutionOption[]>([])
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
}
async function initStreamSettings(stream: MediaStream) {
  const track = stream.getVideoTracks()[0]
  const trackCapabilities = track.getCapabilities()
  const { width, height } = { width: trackCapabilities.width.max, height: trackCapabilities.height.max, }
  console.log(trackCapabilities)
  let div = 1.;
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


  vidSrcOption.value = sourceOptionList.value[0]
  vidResOption.value = resoloutionOptionList.value[0]
  currentStream = stream
  const video = document.querySelector('video')
  video.srcObject = stream
  video.onplay = () => {
    console.log(track.getCapabilities())
    console.log(track.getConstraints())
    console.log(track.getSettings())
  }
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
    navigator.mediaDevices.getUserMedia(constraints).then(initStreamSettings).then(initDeviceList);
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
</style>