module.exports = {
    publicPath: './',
    devServer: {
        proxy: {
            '/WebMap/*': {
                target: 'http://localhost:80',
                changeOrigin: true,
                secure: false
            },
            '/external-settings.js': { // or create your own file external-settings.js in public folder
                target: 'http://localhost:80/WebMap/App/ExternalSettings/Test-3.js',
                changeOrigin: true,
                secure: false
            }
        }
    }
};
