<template>
    <el-tabs
      v-model="editableTabsValue"
      type="card"
      editable
      class="demo-tabs"
      @edit="handleTabsEdit"
    >
      <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
      <EditableForm />
      </el-tab-pane>
    </el-tabs>
  </template>
  <script lang="ts" setup>
  import { ref } from 'vue'
  import EditableForm from '@/components/EditableForm.vue'
  let tabIndex = 2
  const editableTabsValue = ref('2')
  const editableTabs = ref([
    {
      title: '测量 1',
      name: '1',
      componentName:'EditableForm',
    },
    {
      title: '测量 2',
      name: '2',
      componentName:'EditableForm',
    },
  ])
  
  const handleTabsEdit = (targetName: string, action: string) => {
    if (action === 'add') {
      const newTabName = `${++tabIndex}`
      editableTabs.value.push({
        title: `测量 ${editableTabs.value.length+1}`,
        name: newTabName,
        componentName:'EditableForm'
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
  </script>
  <style>
  .demo-tabs > .el-tabs__content {
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }
  </style>
  