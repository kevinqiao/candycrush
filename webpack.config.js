const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    w3: "./src/www_index.tsx", // 第一个入口点
    match3: "./src/index.tsx", // 第一个入口点
    tg: "./src/telegram_index.tsx", // 第二个入口点
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  // entry: "./src/index.tsx",
  // output: {
  //   path: path.resolve(__dirname, "dist"),
  //   filename: "bundle.js",
  // },
  module: {
    rules: [
      // 处理 .ts 或 .tsx 文件
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      // 处理 .css 文件
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      // 处理图片文件
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]", // 输出到 dist/images 目录下
        },
      },
    ],
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: "./public/index.html",
    // }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "w3.html",
      chunks: ["w3"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "match3/index.html",
      chunks: ["match3"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/telegram_index.html",
      filename: "tg/index.html",
      chunks: ["tg"],
    }),
    new CopyPlugin({
      patterns: [
        { from: "public/assets", to: "assets" }, // 将 public 目录下的所有内容复制到构建目录下的 public
        { from: "public/*.png", to: "images/[name][ext]", noErrorOnMissing: true },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      util: path.resolve(__dirname, "src/util/"),
      service: path.resolve(__dirname, "src/service/"),
      model: path.resolve(__dirname, "src/model/"),
      component: path.resolve(__dirname, "src/component/"),
      components: path.resolve(__dirname, "src/components/"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    // ...其他选项...
    port: 3000,
    open: true, // 自动打开浏览器
    hot: true, // 启用热模块替换
    historyApiFallback: {
      rewrites: [
        // 重定向规则
        { from: "/match3/*", to: "/match3/index.html" },
        { from: "/tg/*", to: "/tg/index.html" },
        // 你可以添加更多的重定向规则
      ],
    },
  },
};
