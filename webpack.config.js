const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackMonitor = require('webpack-monitor');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
          test: /\.worker\.js$/,
          use: {
            loader: 'worker-loader',
            options: { inline: true, name: '[hash].[hash].js' }
          }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" }
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
      filename: "./index.html"
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new BundleAnalyzerPlugin(),
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
    filename: '[name].[hash].js',
    globalObject: "this"
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:80/bniaBuilder/src/',
        secure: false,
        changeOrigin: true
      }
    }
  }
}
};
/*      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader,"css-loader"]
      },

    new WebpackMonitor({
      launch: true,
      port: 8887
    }),
*/
