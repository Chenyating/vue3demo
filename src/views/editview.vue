<template>
  <div class="about">
        姓名<el-input v-model="form.name"></el-input>
        年龄<el-input v-model="form.year"></el-input>
        <el-button type="primary" @click="onSubmit">缓存</el-button>
    <div>
      cacheobj来自：cubeCache.get({{ $route.query.cacheKey }})<br />
      cacheObj:{{ cacheObj }}<br />
      <!-- cacheObj.allVersion:{{ cacheObj?.diff(0) }}<br /> -->
      <!-- cacheObj:{{ cacheObj?.getAllVersion() }}<br /> -->
    </div>
  </div>
</template>

<script>
import { cubeCacheStore } from '../store/index.js'

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
      var key = this.$route.query.cacheKey;
      if (key) {
        // 复制 this.form 的值
        const formCopy = { ...this.form };
        console.log(this.cubeCache.getAll());
        this.cubeCache.set(key, formCopy);
      } else {
        console.error("缺少 cacheKey 参数");
      }
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
          this.form = data
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
