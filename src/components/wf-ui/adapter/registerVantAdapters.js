import {
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  CollapseItem,
  Empty,
  Field,
  Icon,
  Loading,
  Picker,
  Popup,
  Radio,
  RadioGroup,
  Rate,
  Search,
  Slider,
  Stepper,
  Switch,
  TimePicker,
} from 'vant';
import UPopup from './UPopup.vue';
import USelect from './USelect.vue';
import ULoadmore from './ULoadmore.vue';
import UForm from './UForm.vue';
import UFormItem from './UFormItem.vue';
import UToast from './UToast.vue';
import UNumberBox from './UNumberBox.vue';
import UButton from './UButton.vue';
import UCard from './UCard.vue';
import UCollapse from './UCollapse.vue';
import UCollapseItem from './UCollapseItem.vue';
import UPicker from './UPicker.vue';

const aliasComponents = [
  ['u-field', Field],
  ['u-input', Field],
  ['u-icon', Icon],
  ['u-search', Search],
  ['u-switch', Switch],
  ['u-radio', Radio],
  ['u-radio-group', RadioGroup],
  ['u-checkbox', Checkbox],
  ['u-checkbox-group', CheckboxGroup],
  ['u-slider', Slider],
  ['u-rate', Rate],
  ['u-empty', Empty],
];

const customComponents = [
  ['u-popup', UPopup],
  ['u-select', USelect],
  ['u-loadmore', ULoadmore],
  ['u-form', UForm],
  ['u-form-item', UFormItem],
  ['u-toast', UToast],
  ['u-number-box', UNumberBox],
  ['u-button', UButton],
  ['u-card', UCard],
  ['u-collapse', UCollapse],
  ['u-collapse-item', UCollapseItem],
  ['u-picker', UPicker],
];

const baseComponents = [
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  CollapseItem,
  Empty,
  Field,
  Icon,
  Loading,
  Picker,
  Popup,
  Radio,
  RadioGroup,
  Rate,
  Search,
  Slider,
  Stepper,
  Switch,
  TimePicker,
];

export function registerVantAdapters(app) {
  aliasComponents.forEach(([name, component]) => {
    app.component(name, component);
  });

  customComponents.forEach(([name, component]) => {
    app.component(name, component);
  });

  baseComponents.forEach((component) => {
    app.component(component.name, component);
  });
}
