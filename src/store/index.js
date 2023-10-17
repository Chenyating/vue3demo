import { defineStore, createPinia } from 'pinia'

const initialCacheData = JSON.parse(localStorage.getItem('cacheData')) || {}

export const cubeCacheStore = defineStore('cubeCache', {
  state: () => ({
    cacheData: initialCacheData, // 用于存储缓存数据
  }),

  actions: {
    // 生成唯一缓存key
    getCacheKey() {
      // 返回一个唯一的缓存key，你可以使用更复杂的逻辑生成
      return Math.random().toString(36).substring(7)
    },
    // 设置缓存
    set(cacheKey, cacheInfo, time = 0) {
      if (!this.cacheData[cacheKey]) {
        // 如果cacheKey不存在，将cacheInfo设置为初始版本
        this.cacheData[cacheKey] = {
          latestVersion: {
            data: cacheInfo,
            number: 0,
          },
        }
      }

      const lastVersion = this.cacheData[cacheKey].latestVersion

      if (JSON.stringify(lastVersion.data) !== JSON.stringify(cacheInfo)) {
        // 只有在cacheInfo与上一个版本存在差异时才存储为最新版本
        const versionNumber = lastVersion.number + 1
        this.cacheData[cacheKey][`version${versionNumber}`] = {
          data: cacheInfo,
        }
        this.cacheData[cacheKey].latestVersion = {
          data: cacheInfo,
          number: versionNumber,
        }

        if (time > 0) {
          // 自动缓存
          const autoSaveTimer = setInterval(() => {
            this.set(cacheKey, cacheInfo)
          }, time)

          this.cacheData[cacheKey].autoSaveTimer = autoSaveTimer
        }
      }
      localStorage.setItem('cacheData', JSON.stringify(this.cacheData))
    },
    // 取消时间自动缓存
    cancelAutoSave(cacheKey) {
      if (this.cacheData[cacheKey] && this.cacheData[cacheKey].autoSaveTimer) {
        clearInterval(this.cacheData[cacheKey].autoSaveTimer)
      }
    },

    // 清空指定缓存
    clear(cacheKey) {
      if (this.cacheData[cacheKey]) {
        delete this.cacheData[cacheKey]
        localStorage.setItem('cacheData', JSON.stringify(this.cacheData))
        return true
      }
      return false
    },

    // 清空所有缓存
    clearAll() {
      for (const cacheKey in this.cacheData) {
        this.clear(cacheKey)
      }
      this.cacheData = {}
    },

    // 获取所有缓存对象
    getAll() {
      return this.cacheData
    },

    // 获取指定缓存对象
    get(cacheKey) {
      if (!cacheKey) {
        return {}
      }

      if (this.cacheData[cacheKey]) {
        // 直接将最新版本的数据存储在cacheObj中
        const cacheObj = this.cacheData[cacheKey].latestVersion.data || {}

        // 添加getVersion方法
        cacheObj.getVersion = (versionNum) => {
          if (versionNum >= 0) {
            const versionKey = `version${versionNum}`
            return this.cacheData[cacheKey][versionKey]
              ? this.cacheData[cacheKey][versionKey].data
              : {}
          }
          return {}
        }

        // 添加getAllVersion方法

        cacheObj.getAllVersion = () => {
          return this.cacheData[cacheKey]
        }

        // 检查是否存在diff方法
        // 添加diff方法
        cacheObj.diff = (versionNum) => {
          if (versionNum >= 0) {
            const currentVersion = cacheObj.getVersion(versionNum)
            const previousVersion = cacheObj.getVersion(versionNum - 1)
            if (currentVersion && previousVersion) {
              const diff = {}
              for (const key in currentVersion) {
                if (
                  JSON.stringify(currentVersion[key]) !==
                  JSON.stringify(previousVersion[key])
                ) {
                  diff[key] = [previousVersion[key], currentVersion[key]]
                }
              }
              return diff
            }
          }
          return {}
        }

        return cacheObj
      }
      return {}
    },

    // 返回指定版本的内容
    getVersion(cacheKey, versionNum) {
      if (
        this.cacheData[cacheKey] &&
        this.cacheData[cacheKey][`version${versionNum}`]
      ) {
        return this.cacheData[cacheKey][`version${versionNum}`].data
      }
      return {}
    },

    // 返回版本差异
    diff(cacheKey, versionNum) {
      if (
        versionNum === undefined ||
        versionNum === this.cacheData[cacheKey].latestVersion.number
      ) {
        return {}
      }
      const currentVersion = this.cacheData[cacheKey][`version${versionNum}`]
      const nextVersion = this.cacheData[cacheKey][`version${versionNum + 1}`]
      const diff = {}

      for (const key in currentVersion.data) {
        if (
          JSON.stringify(currentVersion.data[key]) !==
          JSON.stringify(nextVersion.data[key])
        ) {
          diff[key] = [currentVersion.data[key], nextVersion.data[key]]
        }
      }

      return diff
    },
  },
  persist: true,
})
