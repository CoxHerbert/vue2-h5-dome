<template>
  <div class="wf-cascade-selection">
    <div v-if="title" class="wf-cascade-title">{{ title }}</div>
    <div
      class="wf-bottom-line wf-scroll-x"
      :class="{ 'wf-btm-none': !headerLine }"
      ref="headerScroll"
      :style="{ backgroundColor: headerBgColor }"
    >
      <div class="wf-selection-header" :style="{ height: toPx(tabsHeight), backgroundColor: backgroundColor }">
        <div
          v-for="(item, index) in selectedArr"
          :key="index"
          ref="headerItems"
          class="wf-header-item"
          :class="{ 'wf-font-bold': index === currentTab && bold }"
          :style="{ color: index === currentTab ? activeColor : color, fontSize: toPx(size) }"
          @click.stop="swichNav(index)"
        >
          {{ item[labelKey] }}
          <div
            v-if="index === currentTab && showLine"
            class="wf-active-line"
            :style="{ backgroundColor: lineColor }"
          ></div>
        </div>
      </div>
    </div>
    <div class="wf-selection-list" :style="{ height: toPx(height), backgroundColor: backgroundColor }">
      <div
        v-for="(item, index) in selectedArr"
        :key="index"
        v-show="index === currentTab"
        class="wf-selection-panel"
      >
        <div ref="listContainers" class="wf-selection-item" :style="{ height: toPx(height) }">
          <div class="wf-first-item" :style="{ height: toPx(firstItemTop) }"></div>
          <div
            v-for="(subItem, subIndex) in item.list"
            :key="subIndex"
            class="wf-selection-cell"
            :style="{ padding: toPx(padding), backgroundColor: backgroundColor }"
            :data-scroll-index="subIndex"
            @click="change(index, subIndex, subItem)"
          >
            <van-icon
              v-if="item.index === subIndex"
              name="success"
              :color="checkMarkColor"
              class="wf-icon-success"
              :style="{ fontSize: toPx(checkMarkSize) }"
            />
            <img
              v-if="subItem.src"
              :src="subItem.src"
              class="wf-cell-img"
              :style="{ width: toPx(imgWidth), height: toPx(imgHeight), borderRadius: toPx(radius) }"
              alt=""
            />
            <div
              class="wf-cell-title"
              :class="{ 'wf-font-bold': item.index === subIndex && textBold, 'wf-flex-shrink': nowrap }"
              :style="{ color: item.index === subIndex ? textActiveColor : textColor, fontSize: toPx(textSize) }"
            >
              {{ subItem[labelKey] }}
            </div>
            <div
              v-if="subItem[descKey]"
              class="wf-cell-sub_title"
              :style="{ color: subTextColor, fontSize: toPx(subTextSize) }"
            >
              {{ subItem[descKey] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DIC_PROPS } from '../../../util/variable.js'

export default {
  name: 'WfCascade',
  props: {
    title: {
      type: String,
      default: '',
    },
    props: {
      type: Object,
      default: () => DIC_PROPS,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    itemList: {
      type: Array,
      default: () => [],
    },
    defaultItemList: {
      type: Array,
      default: () => [],
    },
    headerLine: {
      type: Boolean,
      default: true,
    },
    headerBgColor: {
      type: String,
      default: '#FFFFFF',
    },
    tabsHeight: {
      type: String,
      default: '88rpx',
    },
    text: {
      type: String,
      default: '请选择',
    },
    size: {
      type: Number,
      default: 28,
    },
    color: {
      type: String,
      default: '#555',
    },
    activeColor: {
      type: String,
      default: '#5677fc',
    },
    bold: {
      type: Boolean,
      default: true,
    },
    showLine: {
      type: Boolean,
      default: true,
    },
    lineColor: {
      type: String,
      default: '#5677fc',
    },
    checkMarkSize: {
      type: Number,
      default: 15,
    },
    checkMarkColor: {
      type: String,
      default: '#5677fc',
    },
    imgWidth: {
      type: String,
      default: '40rpx',
    },
    imgHeight: {
      type: String,
      default: '40rpx',
    },
    radius: {
      type: String,
      default: '50%',
    },
    textColor: {
      type: String,
      default: '#333',
    },
    textActiveColor: {
      type: String,
      default: '#333',
    },
    textBold: {
      type: Boolean,
      default: true,
    },
    textSize: {
      type: Number,
      default: 28,
    },
    nowrap: {
      type: Boolean,
      default: false,
    },
    subTextColor: {
      type: String,
      default: '#999',
    },
    subTextSize: {
      type: Number,
      default: 24,
    },
    padding: {
      type: String,
      default: '20rpx 30rpx',
    },
    firstItemTop: {
      type: String,
      default: '20rpx',
    },
    height: {
      type: String,
      default: '300px',
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF',
    },
    request: {
      type: Boolean,
      default: false,
    },
    receiveData: {
      type: Array,
      default: () => [],
    },
    reset: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      currentTab: 0,
      selectedArr: [],
    }
  },
  computed: {
    valueKey() {
      return this.props.value || DIC_PROPS.value
    },
    labelKey() {
      return this.props.label || DIC_PROPS.label
    },
    childrenKey() {
      return this.props.children || DIC_PROPS.children
    },
    descKey() {
      return this.props.desc || DIC_PROPS.desc
    },
  },
  emits: ['change', 'complete'],
  watch: {
    itemList(val) {
      this.initData(val, -1)
    },
    receiveData(val) {
      this.subLevelData(val, this.currentTab)
    },
    reset() {
      this.initData(this.itemList, -1)
    },
    defaultItemList(val) {
      this.setDefaultData(val)
    },
    currentTab() {
      this.checkCor()
    },
    selectedArr: {
      handler() {
        this.checkCor()
      },
      deep: true,
    },
  },
  created() {
    this.setDefaultData(this.defaultItemList)
  },
  methods: {
    toPx(value) {
      if (typeof value === 'number') return `${value}px`
      if (typeof value === 'string') {
        return value.replace(/rpx/g, 'px')
      }
      return value
    },
    scrollToHeader(index) {
      const refs = this.$refs.headerItems
      if (!refs) return
      const elements = Array.isArray(refs) ? refs : [refs]
      const el = elements[index]
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    },
    scrollToList(layerIndex, subIndex) {
      const refs = this.$refs.listContainers
      if (!refs) return
      const containers = Array.isArray(refs) ? refs : [refs]
      const container = containers[layerIndex]
      if (!container) return
      if (subIndex == null || subIndex < 0) {
        container.scrollTop = 0
        return
      }
      const target = container.querySelector(`[data-scroll-index="${subIndex}"]`)
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    },
    setDefaultData(val) {
      const defaultItemList = val || []
      if (defaultItemList.length > 0) {
        this.selectedArr = defaultItemList
        this.currentTab = defaultItemList.length - 1
      } else {
        this.initData(this.itemList, -1)
      }
    },
    initData(data, layer) {
      if (!data || data.length === 0) return
      if (this.request) {
        this.subLevelData(data, layer)
      } else {
        const selectedValue = this.selectedValue || {}
        if (selectedValue.type) {
          this.setDefaultData(selectedValue)
        } else {
          this.subLevelData(this.getItemList(layer, -1), layer)
        }
      }
    },
    removeChildren(data) {
      return (data || []).map(item => {
        const clone = { ...item }
        delete clone[this.childrenKey]
        return clone
      })
    },
    getItemList(layer, index) {
      let list = []
      const arr = JSON.parse(JSON.stringify(this.itemList))
      if (layer === -1) {
        list = this.removeChildren(arr)
      } else {
        let value = (this.selectedArr[0] && this.selectedArr[0].index)
        value = value === -1 ? index : value
        const firstLevel = arr[value] || {}
        list = firstLevel[this.childrenKey] || []
        if (layer > 0) {
          for (let i = 1; i < layer + 1; i++) {
            const current = this.selectedArr[i] || {}
            const val = layer === i ? index : current.index
            const levelItem = list[val] || {}
            list = levelItem[this.childrenKey] || []
            if (!list || list.length === 0) break
          }
        }
        list = this.removeChildren(list)
      }
      return list
    },
    swichNav(index) {
      if (this.currentTab !== index) {
        this.currentTab = index
      }
    },
    checkCor() {
      const item = this.selectedArr[this.currentTab]
      if (!item) return
      this.$nextTick(() => {
        this.scrollToHeader(this.currentTab)
        this.scrollToList(this.currentTab, item.index)
      })
    },
    change(index, subIndex, subItem) {
      const item = this.selectedArr[index]
      if (!item || item.index === subIndex) return
      this.selectedArr.splice(index + 1)
      item.index = subIndex
      item[this.labelKey] = subItem[this.labelKey]
      item[this.valueKey] = subItem[this.valueKey]
      item[this.descKey] = subItem[this.descKey] || ''
      item.src = subItem.src || ''

      this.$emit('change', {
        layer: index,
        subIndex,
        ...subItem,
      })

      if (!this.request) {
        const data = this.getItemList(index, subIndex)
        this.subLevelData(data, index)
      }
    },
    subLevelData(data, layer) {
      if (!data || data.length === 0) {
        if (layer === -1) return
        let result = JSON.parse(JSON.stringify(this.selectedArr))
        const lastItem = result[result.length - 1] || {}
        const text = []
        result = result.map(item => {
          text.push(item[this.labelKey])
          const clone = { ...item }
          delete clone.list
          return clone
        })
        this.$emit('complete', {
          result,
          [this.valueKey]: lastItem[this.valueKey],
          [this.labelKey]: text.join('/'),
          [this.descKey]: lastItem[this.descKey],
          src: lastItem.src,
        })
      } else {
        const item = [
          {
            [this.labelKey]: this.text,
            [this.descKey]: '',
            [this.valueKey]: '',
            src: '',
            index: -1,
            list: data,
          },
        ]
        if (layer === -1) {
          this.selectedArr = item
        } else {
          const retainArr = this.selectedArr.slice(0, layer + 1)
          this.selectedArr = retainArr.concat(item)
        }
        this.$nextTick(() => {
          this.currentTab = this.selectedArr.length - 1
        })
      }
    },
  },
}
</script>

<style scoped>
.wf-cascade-selection {
  width: 100%;
  box-sizing: border-box;
}

.wf-cascade-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  background-color: #fff;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
  position: relative;
  font-size: 36px;
}

.wf-scroll-x {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
  scroll-behavior: smooth;
}

.wf-selection-header {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}

.wf-bottom-line {
  position: relative;
}

.wf-bottom-line::after {
  width: 100%;
  content: '';
  position: absolute;
  border-bottom: 1px solid #eaeef1;
  transform: scaleY(0.5) translateZ(0);
  transform-origin: 0 100%;
  bottom: 0;
  right: 0;
  left: 0;
}

.wf-btm-none::after {
  border-bottom: 0 !important;
}

.wf-header-item {
  max-width: 240px;
  padding: 15px 30px;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
}

.wf-font-bold {
  font-weight: bold;
}

.wf-active-line {
  width: 60px;
  height: 6px;
  border-radius: 4px;
  position: absolute;
  bottom: 16px;
  right: 0;
  left: 50%;
  transform: translateX(-50%);
}

.wf-selection-list {
  width: 100%;
  box-sizing: border-box;
}

.wf-selection-panel {
  height: 100%;
}

.wf-selection-item {
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.wf-selection-cell {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.wf-icon-success {
  margin-right: 12px;
}

.wf-cell-img {
  margin-right: 12px;
  flex-shrink: 0;
}

.wf-cell-title {
  word-break: break-all;
}

.wf-flex-shrink {
  flex-shrink: 0;
}

.wf-cell-sub_title {
  margin-left: 20px;
  word-break: break-all;
}

.wf-first-item {
  width: 100%;
}
</style>
