const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin'); ////gzip压缩
// const TerserJSPlugin = require('terser-webpack-plugin'); //正式环境的console.log

const port = process.env.port || process.env.npm_config_port || 80; // 端口

// 定义压缩文件类型
const productionGzipExtensions = ['.js', '.css', '.html', '.vue', '.scss'];

function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
    outputDir: 'dist',
    assetsDir: 'static',
    lintOnSave: process.env.NODE_ENV === 'development',
    productionSourceMap: false,
    devServer: {
        host: '0.0.0.0',
        port: port,
        open: true,
        disableHostCheck: true,
        proxy: {
            [process.env.VUE_APP_BASE_API]: {
                target: process.env.VUE_APP_BASE_URL + process.env.VUE_APP_BASE_API,
                changeOrigin: true,
                pathRewrite: {
                    ['^' + process.env.VUE_APP_BASE_API]: '',
                },
            },
        },
    },
    css: {
        modules: false,
        // loaderOptions: {
        //   sass: {
        //     prependData: `@import "@/styles/index.scss";`
        //   }
        // }
    },
    chainWebpack: (config) => {
        // 别名 alias
        config.resolve.alias.set('@', resolve('src'));
    },
};
