const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./main.js",
  plugins: [new webpack.ProgressPlugin()],
  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        //include: [],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [["@babel/plugin-transform-react-jsx", { pragma: "createElement" }]],
          },
        },
      },
    ],
  },
};
