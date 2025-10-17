import {
  ActionSheet,
  Area,
  Button,
  Cascader,
  Cell,
  CellGroup,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Empty,
  Field,
  Form,
  Grid,
  GridItem,
  Icon,
  List,
  Loading,
  NavBar,
  Picker,
  PickerGroup,
  Popup,
  PullRefresh,
  Radio,
  RadioGroup,
  Search,
  Space,
  Tabbar,
  TabbarItem,
  Tag,
  TimePicker,
  Uploader,
} from 'vant';

const vantComponents = {
  ActionSheet,
  Area,
  Button,
  Cascader,
  Cell,
  CellGroup,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Empty,
  Field,
  Form,
  Grid,
  GridItem,
  Icon,
  List,
  Loading,
  NavBar,
  Picker,
  PickerGroup,
  Popup,
  PullRefresh,
  Radio,
  RadioGroup,
  Search,
  Space,
  Tabbar,
  TabbarItem,
  Tag,
  TimePicker,
  Uploader,
};

function toKebabCase(name) {
  return name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export const wfComponents = Object.entries(vantComponents).reduce(
  (acc, [componentName, component]) => {
    const tagName = `wf-${toKebabCase(componentName)}`;
    acc[tagName] = component;
    return acc;
  },
  {},
);

export default wfComponents;
