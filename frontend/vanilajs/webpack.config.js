const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const childProcess = require("child_process");
const apiMocker = require("connect-api-mocker");

module.exports = {
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    publicPath: "/",
    host: "localhost",
    overlay: true,
    port: 8081,
    stats: "errors-only",
    historyApiFallback: true,
    before: (app) => {
      app.use(apiMocker("/api", "mocks/api"));
    },
  },
  entry: {
    main: ["./sass/main.scss", "./src/app.js"],
  },
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: [
          process.env.NODE_ENV === "production"
            ? MiniCssExtractPlugin.loader // 프로덕션 환경
            : "style-loader", // 개발 환경
          "css-loader",
          "sass-loader",
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "url-loader",
        options: {
          publicPath: "./",
          name: "[name].[ext]?[hash]",
          limit: 200, // 2kb넘으면 file-loader가 동작
        },
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `
        Build Date : ${new Date().toLocaleString()}
        Author : ${childProcess.execSync("git config user.name")}
      `,
    }),
    new webpack.DefinePlugin({}), // api.domain: JSON.stringify('http://dev.api.domain) 이렇게 지정 가능
    new HtmlWebpackPlugin({
      template: "./src/index.html", // main.js 추가해준다.
      templateParameters: {
        env: process.env.NODE_ENV === "development" ? "(개발용)" : "(배포용)",
      },
      minify:
        process.env.NODE_ENV === "development"
          ? {
              collapseWhitespace: true,
              removeComments: true,
            }
          : false,
    }),
    new CleanWebpackPlugin({}),
    new MiniCssExtractPlugin({ filename: "[name].css" }), // 원랜 배포에서만
  ],
};