import UIcon from './u-icon.vue';
import UInput from './u-input.vue';
import UField from './u-field.vue';
import UPopup from './u-popup.vue';
import USearch from './u-search.vue';
import ULoadmore from './u-loadmore.vue';
import URate from './u-rate.vue';
import USlider from './u-slider.vue';
import UNumberBox from './u-number-box.vue';
import UCheckboxGroup from './u-checkbox-group.vue';
import UCheckbox from './u-checkbox.vue';
import UEmpty from './u-empty.vue';
import UButton from './u-button.vue';
import UPicker from './u-picker.vue';
import USwitch from './u-switch.vue';
import USelect from './u-select.vue';
import URadioGroup from './u-radio-group.vue';
import URadio from './u-radio.vue';

const components = [
  UIcon,
  UInput,
  UField,
  UPopup,
  USearch,
  ULoadmore,
  URate,
  USlider,
  UNumberBox,
  UCheckboxGroup,
  UCheckbox,
  UEmpty,
  UButton,
  UPicker,
  USwitch,
  USelect,
  URadioGroup,
  URadio,
];

export function registerVantAdapters(app) {
  components.forEach((component) => {
    app.component(component.name, component);
  });
}

export default {
  install(app) {
    registerVantAdapters(app);
  },
};
