const path = require("path");
const webpack = require("webpack");

console.log(__dirname);

module.exports = {
  mode: "development",
  entry: {
    //object key name需要和<script>的src文件名中一致
    'animation-demo': "./animation-demo.js",
    'main': './main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new webpack.ProgressPlugin(),
  ],
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
