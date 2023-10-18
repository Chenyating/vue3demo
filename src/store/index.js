import { defineStore, createPinia } from 'pinia'

const initialCacheData = JSON.parse(localStorage.getItem('cubeCache')) || {}

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
      const { cacheData } = this;
    
      if (!cacheData[cacheKey]) {
        cacheData[cacheKey] = {
          latestVersion: {
            data: null, // 特殊值
            number: 0,
          },
        };
      }
    
      const { latestVersion } = cacheData[cacheKey];
    
      if (latestVersion.data !== cacheInfo) {
        // 只有在cacheInfo与上一个版本存在差异时才存储为最新版本
        const versionNumber = latestVersion.number + 1;
        cacheData[cacheKey][`version${versionNumber}`] = {
          data: cacheInfo,
        };
        cacheData[cacheKey].latestVersion = {
          data: cacheInfo,
          number: versionNumber,
        };
    
        if (time > 0) {
          // 自动缓存
          if (cacheData[cacheKey].autoSaveTimer) {
            clearInterval(cacheData[cacheKey].autoSaveTimer);
          }
          cacheData[cacheKey].autoSaveTimer = setInterval(() => {
            this.set(cacheKey, cacheInfo);
          }, time);
        }
      }
    
      // 存储到localStorage
      localStorage.setItem('cubeCache', JSON.stringify(cacheData));
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
        localStorage.setItem('cubeCache', JSON.stringify(this.cacheData))
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
        return null
      }

      if (this.cacheData[cacheKey]) {
        // 直接将最新版本的数据存储在cacheObj中
        const cacheObj = this.cacheData[cacheKey].latestVersion.data || {}

        // 添加getVersion方法
        cacheObj.getVersion = (versionNum) => {
          if (versionNum > 0) {
            const versionKey = `version${versionNum}`
            return this.cacheData[cacheKey][versionKey]
              ? this.cacheData[cacheKey][versionKey].data
              : {}
          }
          if (versionNum <= 0) {
            const versionKey = `version1`
            return this.cacheData[cacheKey][versionKey]
              ? this.cacheData[cacheKey][versionKey].data
              : {}
          }
          return null
        }

        // 添加getAllVersion方法

        cacheObj.getAllVersion = () => {
          return this.cacheData[cacheKey]
        }

        // 检查是否存在diff方法
        // 添加diff方法
        cacheObj.diff = (versionNumOrObject) => {
          if (typeof versionNumOrObject === 'number') {
            const versionNum = versionNumOrObject;
            if (versionNum >= 0) {
              const currentVersion = cacheObj.getVersion(versionNum);
              const previousVersion = cacheObj.getVersion(versionNum - 1);
              if (currentVersion && previousVersion) {
                const diff = {};
                for (const key in currentVersion) {
                  if (
                    JSON.stringify(currentVersion[key]) !==
                    JSON.stringify(previousVersion[key])
                  ) {
                    diff[key] = [previousVersion[key], currentVersion[key]];
                  }
                }
                return diff;
              }
              return null;
            }
          } else if (typeof versionNumOrObject === 'object') {
            const currentVersion = versionNumOrObject;
            const previousVersion = cacheObj;
            if (currentVersion && previousVersion) {
              const diff = {};
              for (const key in currentVersion) {
                if (
                  JSON.stringify(currentVersion[key]) !==
                  JSON.stringify(previousVersion[key])
                ) {
                  diff[key] = [previousVersion[key], currentVersion[key]];
                }
              }
              return diff;
            }
          }
          return null; // 其他情况下返回 null，或者你可以根据需求返回其他值
        };
        
        

        return cacheObj
      }
      return null
    },
  }
})
