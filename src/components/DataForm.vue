<template>
  <el-main id='tableContainer' style="height:50%;overflow: hidden;">
    <el-tabs v-model="editableTabsValue" type="card" editable class="demo-tabs" @edit="handleTabsEdit">
      <el-tab-pane v-for=" item,index in editableTabs" :key="item.name" :label="item.title" :name="item.name">
        <EditableForm :index="String(index)" @got-result="handleGotResult" />
      </el-tab-pane>
    </el-tabs>
  </el-main>
  <el-table :data="results">
    <el-table-column prop="key" label="序号" sortable ></el-table-column>
    <el-table-column  type='expand'>
      <template #default="props">
        <el-table :data="props.row.variances">
          <h3>各级方差</h3>
          <el-table-column prop="level" label="级数"></el-table-column>
          <el-table-column prop="val" label="方差"></el-table-column>
        </el-table>
      </template>
    </el-table-column>
    <el-table-column prop="wavelength" label="测得波长"></el-table-column>
  </el-table>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import EditableForm from '@/components/EditableForm.vue'
import { useMeasurements } from '@/storages/measurements'
import { storeToRefs } from "pinia";
let tabIndex = 2
const editableTabsValue = ref('1')
const editableTabs = ref([
  {
    title: '测量 1',
    name: '1',
    componentName: 'EditableForm',
  },
  {
    title: '测量 2',
    name: '2',
    componentName: 'EditableForm',
  },
])

const handleTabsEdit = (targetName: string, action: string) => {
  if (action === 'add') {
    const newTabName = `${++tabIndex}`
    editableTabs.value.push({
      title: `测量 ${editableTabs.value.length + 1}`,
      name: newTabName,
      componentName: 'EditableForm'
    })
    editableTabsValue.value = newTabName
  } else if (action === 'remove') {
    const tabs = editableTabs.value
    let activeName = editableTabsValue.value
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
    }
    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
  }
}
class ResultHolder {
  wavelength: number;
  variance: Map<number, number>
}
class resultRow {
  key: string;
  wavelength: number;
  variances: {
    level: number,
    val: number
  }[]
}
const results = ref<resultRow[]>([])
function handleGotResult(res: ResultHolder) {
  console.log(res)
  results.value = results.value.filter(element => element.key !== editableTabsValue.value)
  const variances = []
  res.variance.forEach((value, key) => {
    variances.push({
      level: key, val: value
    })
  })
  results.value.push({ key: editableTabsValue.value, wavelength: res.wavelength, variances:variances})
}

</script>
<style>
.demo-tabs>.el-tabs__content {
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
  