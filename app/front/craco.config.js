const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.devServer = {
                ...webpackConfig.devServer,
                setupMiddlewares: (middlewares, devServer) => {
                    if (!devServer) throw new Error('webpack-dev-server is not defined');

                    devServer.app.use((req, res, next) => {
                        console.log('Before setup middleware');
                        next();
                    });

                    middlewares.push((req, res, next) => {
                        console.log('After setup middleware');
                        next();
                    });

                    return middlewares;
                },
            };

            return webpackConfig;
        },
    },
};
