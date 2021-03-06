const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path')
const env = require('dotenv').config({ silent: true }).parsed
const webpack = require('webpack')

module.exports = {
  entry: "./source/index.js",
  output: {
    "filename": "main.js",
    "path": path.resolve(__dirname, "bin"),
    publicPath: '/'
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "css-loader"
          }
        ]
      }
    ]
  },
  devServer: {
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html"
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env)
    })
  ]
};