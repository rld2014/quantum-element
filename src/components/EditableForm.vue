<template>
  <el-table>
    <el-table-column v-for="item in headerFormulas">
      <template #header>
        <MathJaxHandler latex="item.value.label" type="inline">
          {{item.value.label}}
        </MathJaxHandler>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts" setup>
import { reactive, Ref, ref } from "@vue/reactivity";
import MathJaxHandler from '@/components/MathJaxHandler.vue'
interface tableHeader {
  name: String;
  label: String;
}
const headerFormulas: Ref<tableHeader>[] = [
  ref({ name: 'level', label: '级数' }),
  ref({ name: 'alpha_1', label: '$\\alpha_1$' }),
  ref({ name: 'alpha_2', label: '$\\alpha_2$' }),
  ref({ name: 'beta', label: '$\\beta$' }),
  ref({ name: "waveLength", label: "波长" })
];
interface measurement {
  angle_alpha1: number;
  angle_alpha2: number;
  level: number;
}
let Measurements: measurement[] = [];

</script>
<style>
  .el-table{
    width:100%;
    margin:5px;
    padding: 0;
  }
</style>
  