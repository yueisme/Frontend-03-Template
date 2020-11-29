const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CopyPlugin = require("copy-webpack-plugin");

// https://vue-loader.vuejs.org/zh/guide/#webpack-%E9%85%8D%E7%BD%AE

module.exports = {
  entry: "./src/main.js",
  mode: "development",
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    // 请确保引入这个插件来施展魔法
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [{ from: "src/*.html", to: "[name].[ext]" }],
    }),
  ],
};
