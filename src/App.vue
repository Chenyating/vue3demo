<template>
  <div>
    所有缓存信息：<br />
    {{ allCache }}
    <br />路由示例图：<br />
    <el-tabs
      v-model="editableTabsValue"
      type="card"
      @tab-click="goEdit"
      editable
      @edit="handleTabsEdit"
    >
      <el-tab-pane
        :disabled="editableTabsValue == item.name"
        :key="item.name"
        v-for="(item, index) in editableTabs"
        :label="item.title + item.name"
        :name="item.name"
        :id="`tab-${item.cacheKey}`"
      >
        {{ item.cacheKey }}
        <router-view />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { useStore } from 'pinia'
import { cubeCacheStore } from './store/index.js'

export default {
  data() {
    return {
      editableTabsValue: '',
      editableTabs: [],
      cubeCache: cubeCacheStore(),
      cacheData: cubeCacheStore().cacheData, // 添加cacheData属性
    }
  },
  computed: {
    allCache() {
      return this.cacheData
    },
  },
  methods: {
    goEdit(tab) {
      this.editableTabsValue = tab.name
      this.$router.push({ path: `/edit?cacheKey=${tab.name}` }) // 更新路由
    },
    handleTabsEdit(targetName, action) {
      if (action === 'add') {
        var cacheKey = this.cubeCache.getCacheKey()
        this.editableTabs.push({
          title: '编辑',
          name: cacheKey,
          content: '编辑',
          cacheKey: cacheKey,
        })
        this.editableTabsValue = cacheKey
        this.$router.push({ path: `/edit?cacheKey=${cacheKey}` }) // 更新路由
        localStorage.setItem('editableTabs', JSON.stringify(this.editableTabs))
      }
      if (action === 'remove') {
        this.editableTabs = this.editableTabs.filter(
          (item) => item.name !== targetName
        )
        localStorage.setItem('editableTabs', JSON.stringify(this.editableTabs))
      }
    },
  },
  mounted() {
    var list = localStorage.getItem('editableTabs')
    if (list != null) {
      this.editableTabs = JSON.parse(list)
    } else {
      this.editableTabs = []
    }
  },
}
</script>
