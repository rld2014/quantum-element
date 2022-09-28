<template>
  <el-container style="font-size:15px;align-items: center; justify-content: flex-end;">
    光栅线数:<el-input v-model="gratingLineDensity" type="number" style="width:150px" size="default"></el-input>
  </el-container>
  <el-table class='table' :data="Measurements" :row-style="{height: 35+'px'}"
    :header-cell-style="{'text-align':'center'}" :max-height=maxTableHeight>
    <el-table-column type="index" :label="'编号'" :width="55"></el-table-column>
    <el-table-column class="cols" prop='level' width="130">
      <template #header>
        级数
      </template>
      <template #default="scope">
        <el-form-item :prop="'Measurements.'+scope.$index+'.level'" class="all">
          <el-input v-model="scope.row.level" type="number" min="1" step="1" clearable
            v-on:change="onChanged(scope.row)"></el-input>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column class="cols" prop='__alpha_1' width="300">
      <template #header>
        <MathJaxHandler type="inline">
          $\alpha_1$
        </MathJaxHandler>
      </template>
      <template #default="scope">
        <el-form-item :prop="'Measurements.'+scope.$index+'.__alpha_1'" class="all">
          <el-container class="angleCell">
            <el-input v-model="scope.row.__alpha1.degree" type="number" clearable v-on:change="onChanged(scope.row)">
            </el-input> <span class="angleSymbol">°</span>
            <el-input v-model="scope.row.__alpha1.minute" type="number" clearable v-on:change="onChanged(scope.row)">
            </el-input> <span class="angleSymbol">'</span>
            <el-input v-model="scope.row.__alpha1.second" type="number" clearable v-on:change="onChanged(scope.row)">
            </el-input> <span class="angleSymbol">"</span>
          </el-container>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column class="cols" prop='__alpha_2' width="300">
      <template #header>
        <MathJaxHandler type="inline">
          $\alpha_2$
        </MathJaxHandler>
      </template>
      <template #default="scope">
        <el-form-item :prop="'Measurements.'+scope.$index+'.__alpha_2'" class="all">
          <el-container class="angleCell">
            <el-input v-model="scope.row.__alpha2.degree" type="number" clearable v-on:change="onChanged(scope.row)">
            </el-input> <span class="angleSymbol">°</span>
            <el-input v-model="scope.row.__alpha2.minute" type="number" clearable v-on:change="onChanged(scope.row)">
            </el-input> <span class="angleSymbol">'</span>
            <el-input v-model="scope.row.__alpha2.second" type="number" clearable v-on:change="onChanged(scope.row)">
            </el-input> <span class="angleSymbol">"</span>
          </el-container>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column class="cols" prop='theta'>
      <template #header>
        <MathJaxHandler type="inline">
          $\theta$
        </MathJaxHandler>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
        <el-button type="danger" size="small" plain @click.prevent="onDeleteRow(scope.row)">
          移除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-container>
    <el-button class="btnNewMeasurement" style="width: 100%" @click="onAddItem">增加测量次数</el-button>
    <el-button class="btnGetResult" type="primary" style="width: 100%" v-on:click="checkResult">计算结果</el-button>
  </el-container>
</template>
<script lang="ts" setup>
import { Ref, ref } from "@vue/reactivity";
import MathJaxHandler from '@/components/MathJaxHandler.vue'
import { onMounted } from "vue";
import { nextTick } from "process";
class ResultHolder {
  wavelength: number;
  variance: Map<number, number>
  constructor() {
    this.wavelength = 0
    this.variance = new Map<number, number>()
  }
}

const gratingLineDensity = ref<number>(undefined)
class highPrecAngle {
  degree: number;
  minute: number;
  second: number;
  isValid() {
    return !(!this.degree && !this.minute && !this.second)
  }
  getValueInDegs() {
    let deg: number = Number(this.degree ?? 0)
    let min: number = Number(this.minute ?? 0) / 60.
    let sec: number = Number(this.second ?? 0) / 3600.
    console.log(deg, min, sec)
    let res = deg + min + sec
    console.log(res)
    return res
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
const Measurements = ref<measurement[]>([]);
let maxTableHeight = ref(0);
const getTableHeight = () => {
  nextTick(() => {
    console.log('resizing...')
    let box = document.querySelector("#tableContainer")
    let box_clientHeight = box.clientHeight
    maxTableHeight.value = box_clientHeight - 41 - 15 - 39.2 - 35;
  })
}
onMounted(() => {
  for (let i = 0; i < 5; i++) {
    Measurements.value.push({
      __alpha1: new highPrecAngle(undefined, undefined, undefined),
      __alpha2: new highPrecAngle(undefined, undefined, undefined),
      level: undefined,
      theta: undefined,
    })
  }
  getTableHeight()
  window.addEventListener('resize', getTableHeight)
})

async function onChanged(row: measurement) {
  console.log(row)
  if (row.__alpha1.isValid() && row.__alpha2.isValid()) {
    row.theta =
      Math.abs(row.__alpha1.getValueInDegs() - row.__alpha2.getValueInDegs()) / 2.
  }
}

function onAddItem() {
  Measurements.value.push({
    __alpha1: new highPrecAngle(undefined, undefined, undefined),
    __alpha2: new highPrecAngle(undefined, undefined, undefined),
    level: undefined,
    theta: undefined,
  })
}

const onDeleteRow = async (row: measurement) => Measurements.value.splice(Measurements.value.indexOf(row), 1)
const emit = defineEmits(['gotResult'])

function checkResult() {
  let thetas = new Map<number, number[]>()
  let res = new ResultHolder

  if (!gratingLineDensity.value) {
    return;
  }
  Measurements.value.forEach(measurement => {
    if (measurement.level) {
      if (measurement.theta) {
        if (thetas[measurement.level] === undefined) {
          thetas.set(measurement.level, [])
        }
        thetas.get(measurement.level).push(measurement.theta)
      }
    }
  })
  if (thetas.size) {
    res.wavelength = 0
    thetas.forEach((arr, level) => {
      let mean = arr.reduce((a, b) => a + b) / arr.length
      let variance = 0;
      arr.forEach((value, key) => { variance += (value - mean) * (value - mean) })
      res.variance.set(level, variance)
      res.wavelength += Math.sin(mean * Math.acos(-1) / 180) * 1E6 / gratingLineDensity.value
    })
    res.wavelength /= thetas.size
    console.log('result:', res)
    emit('gotResult', res)
  }
}
</script>
<style>
.el-table {
  width: 100%;
  margin: 5px;
  padding: 0;
  text-align: center;
}

.cols {
  text-align: center;
}

.el-form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0;
  flex-wrap: nowrap;
}

.angleCell {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.angleSymbol {
  background: transparent;
}
</style>
  