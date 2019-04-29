module.exports = {
    devServer: {
        proxy: {
            "/WebMap/*": {
                target: "http://localhost:80",
                changeOrigin: true,
                ws: true,
                secure: false
            }
        }
    }
};
