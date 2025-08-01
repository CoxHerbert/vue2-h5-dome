module.exports = {
    // publicPath: '/h5/', // 让打包后的静态资源带上 /h5/
    // assetsDir: 'static', // 确保静态资源仍然放在 static 目录
    lintOnSave: true,
    // 配置路径别名
    configureWebpack: {
        devServer: {
            port: 443,
            disableHostCheck: true,
        },
    },
};
