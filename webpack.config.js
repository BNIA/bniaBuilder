const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');

//var glob = require("glob");//folder: glob.sync("./src/js/utils/*.js")
module.exports = env => {
  // Use env.<YOUR VARIABLE> here:
  // console.log('NODE_ENV: ', env.NODE_ENV)
  return {
  optimization: {
    splitChunks: {
      chunks : 'all'
    }
  },
  cache: true,
  entry: {
    index: './src/js/main',
  },
  resolve: {
    alias: {
      'js': path.join(process.cwd(), 'src/js'),
      'css': path.join(process.cwd(), 'src/css'),
      'images': path.join(process.cwd(), 'src/images')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [ 'file-loader' ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      title: 'Progressive Web Application'
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new CopyWebpackPlugin([
      { from: './src/json_config.json', to: 'json_config.json', toType: 'file' },
      { from: './src/manifest.json', to: 'manifest.json', toType: 'file' },
      { from: './src/images', to: 'images' },
    ]),
    new WorkboxPlugin.InjectManifest({
      swSrc: './src/service-worker.js'
    })
  ],
  output: {
    filename: '[name].js',
  }
  }
};
/*      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader,"css-loader"]
      },
*/
