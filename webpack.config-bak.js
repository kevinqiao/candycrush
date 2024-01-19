const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx", // 入口文件
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // 正则表达式，匹配 .ts 和 .tsx 文件
        exclude: /node_modules/, // 排除 node_modules 目录
        use: {
          loader: "babel-loader", // 指定使用 babel-loader
          options: {
            presets: [
              "@babel/preset-env", // 转换 ES6 语法
              "@babel/preset-react", // 转换 React JSX
              "@babel/preset-typescript", // 转换 TypeScript
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  resolve: {
    alias: {
      util: path.resolve(__dirname, "src/util/"),
      service: path.resolve(__dirname, "src/service/"),
      model: path.resolve(__dirname, "src/model/"),
      component: path.resolve(__dirname, "src/component/"),
      components: path.resolve(__dirname, "src/components/"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  devServer: {
    // 将 contentBase 替换为 static
    static: {
      directory: path.join(__dirname, "dist"), // 或您以前在 contentBase 中指定的目录
    },
    // ... 其他配置 ...
    open: true, // 替换 --open 命令行参数
    historyApiFallback: true, // 如果您使用的是单页应用
    hot: true, // 启用热更新
    // ... 其他选项 ...
  },
};
