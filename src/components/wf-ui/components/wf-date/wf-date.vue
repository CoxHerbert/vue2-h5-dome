<template>
  <div class="wf-date">
    <template v-if="singleFieldTypes.includes(type)">
      <van-field
        v-model="date"
        readonly
        clickable
        :disabled="disabled"
        :placeholder="getPlaceholder(column)"
        :is-link="!disabled"
        @click="handleShowSelect()"
      >
        <template #right-icon>
          <van-icon :name="type === 5 ? 'clock-o' : 'calendar-o'" color="rgb(192, 196, 204)" size="20" />
        </template>
      </van-field>
    </template>

    <template v-else>
      <div class="wf-date-time">
        <div class="wf-date-time__start">
          <van-field
            v-model="initStartDate"
            readonly
            clickable
            :disabled="disabled"
            :placeholder="startPlaceholder"
            :input-align="type === 5 ? 'left' : 'center'"
            @click="handleShowSelect('start')"
          >
            <template #right-icon>
              <van-icon name="clock-o" color="rgb(192, 196, 204)" size="20" />
            </template>
          </van-field>
        </div>
        <template v-if="type === 6">
          <span class="wf-date-time__separator">至</span>
          <div class="wf-date-time__end">
            <van-field
              v-model="initEndDate"
              readonly
              clickable
              :disabled="disabled"
              :placeholder="endPlaceholder"
              input-align="center"
              @click="handleShowSelect('end')"
            />
          </div>
        </template>
      </div>
    </template>

    <van-popup v-model:show="showDatePicker" position="bottom" round @close="onPickerCancel">
      <van-date-picker
        v-model="datePickerValue"
        :title="datePickerTitle"
        :columns-type="['year', 'month', 'day']"
        :min-date="datePickerMinDate"
        :max-date="datePickerMaxDate"
        @confirm="onDateConfirm"
        @cancel="onPickerCancel"
      />
    </van-popup>

    <van-popup v-model:show="showTimePicker" position="bottom" round @close="onPickerCancel">
      <van-time-picker
        v-model="timePickerValue"
        :title="timePickerTitle"
        :columns-type="timeColumns"
        v-bind="timePickerLimits"
        @confirm="onTimeConfirm"
        @cancel="onPickerCancel"
      />
    </van-popup>
  </div>
</template>

<script>
import { DatePicker, Field, Icon, Popup, TimePicker } from 'vant';
import Props from '../../mixins/props.js';
import timeFormat from '../../util/timeFormat.js';

export default {
  name: 'wf-date',
  mixins: [Props],
  components: {
    VanDatePicker: DatePicker,
    VanField: Field,
    VanIcon: Icon,
    VanPopup: Popup,
    VanTimePicker: TimePicker,
  },
  computed: {
    type() {
      switch (this.column.type) {
        case 'date':
          return 1;
        case 'daterange':
          return 2;
        case 'datetime':
          return 3;
        case 'datetimerange':
          return 4;
        case 'time':
          return 5;
        case 'timerange':
          return 6;
        default:
          return 1;
      }
    },
    valueFormat() {
      switch (this.column.type) {
        case 'date':
        case 'daterange':
          return 'yyyy-MM-dd';
        case 'datetime':
        case 'datetimerange':
          return 'yyyy-MM-dd HH:mm:ss';
        case 'time':
        case 'timerange':
          return 'HH:mm:ss';
        default:
          return 'yyyy-MM-dd';
      }
    },
    singleFieldTypes() {
      return [1, 2, 3, 4];
    },
    startPlaceholder() {
      if (this.type === 5) return this.getPlaceholder(this.column);
      return this.column.startPlaceholder || '开始时间';
    },
    endPlaceholder() {
      if (this.type === 6) return this.column.endPlaceholder || '结束时间';
      return this.column.endPlaceholder || '结束时间';
    },
    datePickerTitle() {
      if (this.type === 2 || this.type === 4) {
        return this.pendingStep === 'end'
          ? this.column.endPlaceholder || '结束日期'
          : this.column.startPlaceholder || '开始日期';
      }
      return this.column.label || '日期选择';
    },
    timePickerTitle() {
      if (this.type === 6) {
        return this.pendingStep === 'end'
          ? this.column.endPlaceholder || '结束时间'
          : this.column.startPlaceholder || '开始时间';
      }
      if (this.type === 4) {
        return this.pendingStep === 'end' ? '结束时间' : '开始时间';
      }
      if (this.type === 3) {
        return this.column.label || '时间';
      }
      return '时间';
    },
    datePickerMinDate() {
      const min = this.column?.props?.minDate || this.column?.minDate;
      return this.parseDate(min) || new Date(1900, 0, 1);
    },
    datePickerMaxDate() {
      const max = this.column?.props?.maxDate || this.column?.maxDate;
      return this.parseDate(max) || new Date(2099, 11, 31);
    },
    timeColumns() {
      const columns = this.column?.props?.timeColumns || this.column?.props?.columnsType;
      if (Array.isArray(columns) && columns.length) {
        return columns;
      }
      return ['hour', 'minute', 'second'];
    },
    timePickerLimits() {
      const props = this.column?.props || {};
      const keys = ['minHour', 'maxHour', 'minMinute', 'maxMinute', 'minSecond', 'maxSecond', 'minTime', 'maxTime'];
      return keys.reduce((acc, key) => {
        if (props[key] !== undefined) {
          acc[key] = props[key];
        }
        return acc;
      }, {});
    },
  },
  data() {
    return {
      date: '',
      initStartDate: '',
      initEndDate: '',
      showDatePicker: false,
      showTimePicker: false,
      pendingStep: 'single',
      datePickerValue: [],
      timePickerValue: [],
      pendingDate: '',
    };
  },
  methods: {
    handleShowSelect(step = 'single') {
      if (this.disabled) return;
      this.handleClick();
      switch (this.type) {
        case 1:
          this.openDatePicker('single');
          break;
        case 2:
          this.openDatePicker(step === 'end' ? 'end' : 'start');
          break;
        case 3:
          this.openDatePicker('single');
          break;
        case 4:
          this.openDatePicker(step === 'end' ? 'end' : 'start');
          break;
        case 5:
          this.openTimePicker('single');
          break;
        case 6:
          this.openTimePicker(step === 'end' ? 'end' : 'start');
          break;
        default:
          this.openDatePicker('single');
      }
    },
    openDatePicker(step) {
      this.pendingStep = step;
      const base = this.getBaseDateValue(step) || this.formatDate(new Date());
      this.datePickerValue = this.toDateColumns(base);
      this.showDatePicker = true;
    },
    openTimePicker(step, baseDate = '') {
      this.pendingStep = step;
      const baseTime = this.getBaseTimeValue(step);
      this.pendingDate = baseDate || this.getPendingDate(step);
      this.timePickerValue = this.toTimeColumns(baseTime);
      this.showTimePicker = true;
    },
    getBaseDateValue(step) {
      switch (this.type) {
        case 1:
          return this.initStartDate || this.date;
        case 2:
          return step === 'end' ? this.initEndDate : this.initStartDate;
        case 3:
          return this.extractDate(this.initStartDate);
        case 4:
          return step === 'end' ? this.extractDate(this.initEndDate) : this.extractDate(this.initStartDate);
        default:
          return this.initStartDate;
      }
    },
    getBaseTimeValue(step) {
      switch (this.type) {
        case 3:
          return this.extractTime(this.initStartDate);
        case 4:
          return step === 'end' ? this.extractTime(this.initEndDate) : this.extractTime(this.initStartDate);
        case 5:
          return this.initStartDate;
        case 6:
          return step === 'end' ? this.initEndDate : this.initStartDate;
        default:
          return '';
      }
    },
    getPendingDate(step) {
      if (this.type === 3) {
        return this.extractDate(this.initStartDate) || this.formatDate(new Date());
      }
      if (this.type === 4) {
        const base = step === 'end' ? this.extractDate(this.initEndDate) : this.extractDate(this.initStartDate);
        return base || this.formatDate(new Date());
      }
      return '';
    },
    toDateColumns(value) {
      const [year, month, day] = (value || '').split('-');
      return [year || `${this.datePickerMinDate.getFullYear()}`, this.pad(month || '1'), this.pad(day || '1')];
    },
    toTimeColumns(value) {
      const [hour, minute, second] = this.normalizeTime(value);
      return this.timeColumns.map((type) => {
        if (type === 'hour') return this.pad(hour);
        if (type === 'minute') return this.pad(minute);
        if (type === 'second') return this.pad(second);
        return '00';
      });
    },
    formatDateColumns(values) {
      const [year, month, day] = values;
      return `${year}-${this.pad(month)}-${this.pad(day)}`;
    },
    formatTimeColumns(values) {
      const map = {};
      this.timeColumns.forEach((type, index) => {
        map[type] = values[index];
      });
      const hour = this.pad(map.hour || '00');
      const minute = this.pad(map.minute || '00');
      const second = this.pad(map.second || '00');
      return `${hour}:${minute}:${second}`;
    },
    extractDate(value = '') {
      if (!value) return '';
      return value.split(' ')[0];
    },
    extractTime(value = '') {
      if (!value) return '';
      const parts = value.split(' ');
      return parts[1] || value;
    },
    normalizeTime(value = '') {
      if (!value) return ['00', '00', '00'];
      const parts = value.split(':');
      return [parts[0] || '00', parts[1] || '00', parts[2] || '00'];
    },
    formatDate(date) {
      const d = date instanceof Date ? date : this.parseDate(date) || new Date();
      const year = d.getFullYear();
      const month = this.pad(d.getMonth() + 1);
      const day = this.pad(d.getDate());
      return `${year}-${month}-${day}`;
    },
    pad(value) {
      return `${value}`.padStart(2, '0');
    },
    parseDate(value) {
      if (!value) return null;
      if (value instanceof Date) return value;
      const date = new Date(`${value}`.replace(/-/g, '/'));
      return Number.isNaN(date.getTime()) ? null : date;
    },
    parseTextValues() {
      if (this.validateNull(this.text)) return [];
      if (Array.isArray(this.text)) return this.text;
      return `${this.text}`.split(',');
    },
    initValue() {
      const values = this.parseTextValues();
      const start = values[0] ? timeFormat(this.formatTime(values[0]), this.valueFormat) : '';
      const end = values[1] ? timeFormat(this.formatTime(values[1]), this.valueFormat) : '';
      this.initStartDate = start;
      this.initEndDate = end;
      if ([1, 3, 5].includes(this.type)) {
        this.date = start;
      } else if ([2, 4].includes(this.type)) {
        this.date = [start, end].filter(Boolean).join(' 至 ');
      }
    },
    formatTime(val) {
      if ([5, 6].includes(this.type)) {
        return `2008-08-08 ${val}`;
      }
      return val;
    },
    onDateConfirm({ selectedValues }) {
      const formatted = this.formatDateColumns(selectedValues);
      this.showDatePicker = false;
      switch (this.type) {
        case 1:
          this.initStartDate = formatted;
          this.text = formatted;
          this.date = formatted;
          break;
        case 2:
          if (this.pendingStep === 'start') {
            this.initStartDate = formatted;
            this.openDatePicker('end');
          } else {
            this.initEndDate = formatted;
            this.updateRangeText();
          }
          break;
        case 3:
          this.openTimePicker('single', formatted);
          break;
        case 4:
          this.openTimePicker(this.pendingStep, formatted);
          break;
        default:
          this.initStartDate = formatted;
          this.text = formatted;
          this.date = formatted;
      }
    },
    onTimeConfirm({ selectedValues }) {
      const formatted = this.formatTimeColumns(selectedValues);
      this.showTimePicker = false;
      switch (this.type) {
        case 3: {
          const datetime = `${this.pendingDate} ${formatted}`;
          this.initStartDate = datetime;
          this.text = datetime;
          this.date = datetime;
          break;
        }
        case 4: {
          const datetime = `${this.pendingDate} ${formatted}`;
          if (this.pendingStep === 'end') {
            this.initEndDate = datetime;
            this.updateRangeText();
          } else {
            this.initStartDate = datetime;
            this.openDatePicker('end');
          }
          break;
        }
        case 5:
          this.initStartDate = formatted;
          this.text = formatted;
          this.date = formatted;
          break;
        case 6:
          if (this.pendingStep === 'end') {
            this.initEndDate = formatted;
          } else {
            this.initStartDate = formatted;
          }
          this.text = [this.initStartDate, this.initEndDate].filter(Boolean);
          break;
        default:
          this.initStartDate = formatted;
          this.text = formatted;
      }
    },
    onPickerCancel() {
      this.showDatePicker = false;
      this.showTimePicker = false;
    },
    onClear() {
      if (this.stringMode) {
        this.text = '';
      } else {
        this.text = [];
      }
      this.date = '';
      this.initStartDate = '';
      this.initEndDate = '';
    },
    updateRangeText() {
      const parts = [this.initStartDate, this.initEndDate].filter(Boolean);
      this.date = parts.join(' 至 ');
      this.text = parts.length ? parts : [];
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-date {
  width: 100%;

  &-time {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &-time__start,
  &-time__end {
    flex: 1;
  }

  &-time__separator {
    color: #999;
    font-size: 24rpx;
  }
}
</style>
