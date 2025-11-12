const modules = import.meta.glob('./**/*.vue', { eager: true });

export default {
    install(app) {
        Object.keys(modules).forEach((file) => {
            const component = (modules[file] && modules[file].default) || modules[file];
            if (component && component.name) {
                app.component(`wf-${component.name}`, component);
            } else {
                console.warn(`Component in ${file} has no name`);
            }
        });
    },
};
