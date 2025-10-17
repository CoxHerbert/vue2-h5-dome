const componentModules = import.meta.glob('./components/*.vue', { eager: true });

function toKebabCase(name) {
  return name
    .replace(/^Dc/, '')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export const dcComponents = Object.entries(componentModules).reduce(
  (acc, [path, module]) => {
    const component = module.default;
    if (!component) {
      return acc;
    }

    const fileName = path.split('/').pop().replace(/\.vue$/, '');
    const componentName = component.name || fileName;
    const tagName = `dc-${toKebabCase(componentName)}`;

    if (!component.name) {
      component.name = componentName;
    }

    acc[tagName] = component;
    return acc;
  },
  {}
);

export default dcComponents;
