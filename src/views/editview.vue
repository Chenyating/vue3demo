<template>
  <div class="about">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="姓名">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="年龄">
        <el-input v-model="form.year"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">缓存版本</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
    <div>
      var cacheobj = cubeCache.get({{ $route.query.cacheKey }})<br />
      <hr />
      cacheObj - 当前最新数据:{{ cacheObj }}<br />
      <hr />
      cacheObj.getAllVersion() - 所有版本信息:{{ cacheObj?.getAllVersion()
      }}<br />
      <hr />
      cacheObj.getVersion(2) -指定2版本:{{ cacheObj?.getVersion(2) }}<br />
      cacheObj.getVersion(1) -指定1版本:{{ cacheObj?.getVersion(1) }}<br />
      cacheObj.getVersion(0) -小于1都返回1版本:{{ cacheObj?.getVersion(0)
      }}<br />
      <hr />
      cacheObj.diff(3) - 版本3与版本2的差异:{{ cacheObj?.diff(3) }}<br />
      cacheObj.diff(2) - 版本2与版本1的差异:{{ cacheObj?.diff(2) }}<br />
      cacheObj.diff(1) - 小于2都返回:{{ cacheObj?.diff(1) }}<br />
      cacheObj.diff(0) - 小于1都返回:{{ cacheObj?.diff(0) }}<br />
      <hr />
      cacheObj?.diff(form:obj) - 当前输入差异:{{ cacheObj?.diff(form) }}<br />
    </div>
  </div>
</template>

<script>
import { cubeCacheStore } from '../store/index.js'
import { cloneDeep } from 'lodash'

export default {
  data() {
    return {
      form: {
        name: '',
        year: '',
      },
      cubeCache: cubeCacheStore(),
    }
  },
  methods: {
    onSubmit() {
      var key = this.$route.query.cacheKey
      var formCopy = cloneDeep(this.form)
      console.log(this.cubeCache.getAll())
      this.cubeCache.set(key, { ...formCopy })
    },
  },
  computed: {
    cacheObj() {
      return this.cubeCache.get(this.$route.query.cacheKey)
    },
  },
  watch: {
    $route(to, from) {
      if (to.query.cacheKey) {
        const data = this.cubeCache.get(to.query.cacheKey)
        if (data) {
          this.form = cloneDeep(data)
        } else {
          // 如果没有缓存数据，可以设置表单字段为空或默认值
          this.form = {
            name: '',
            year: '',
          }
        }
      }
    },
  },
  mounted() {},
}
</script>
