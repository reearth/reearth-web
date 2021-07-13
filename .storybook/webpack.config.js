const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const pkg = require("../package");

module.exports = ({ config }) => {
  config.externals = {
    ...config.externals,
    cesium: "Cesium",
  };

  config.module.rules.push({
    test: /\.yml$/,
    use: [{ loader: "json-loader" }, { loader: "yaml-flat-loader" }],
  });

  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: ".storybook/public",
        },
        {
          from: "node_modules/cesium/Build/Cesium",
          to: "cesium",
        },
      ],
    }),
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify("cesium"),
      REEARTH_WEB_VERSION: pkg.version,
    }),
  );

  config.resolve.alias = {
    ...config.resolve.alias,
    "@reearth": path.resolve(__dirname, "..", "src"),
    "@emotion/core": path.resolve(__dirname, "..", "node_modules", "@emotion", "react"),
    "emotion-theming": path.resolve(__dirname, "..", "node_modules", "@emotion", "react"),
  };

  // For quickjs-emscripten
  // In webpack v6, you have to change this configuration as following:
  // config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false }
  config.node = {
    ...config.node,
    fs: "empty",
  };

  return config;
};
