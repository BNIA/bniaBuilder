const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

//https://www.excitoninteractive.com/articles/read/62/webpack4/step-by-step-sass-with-autoprefixer
//https://github.com/postcss/autoprefixer

var BrotliGzipPlugin = require('brotli-gzip-webpack-plugin');
// Compression Fallbacks, depends on browser Content Encoding
// Updates .htaccess to serve these filetypes
// Can be replaced with https://webpack.js.org/plugins/compression-webpack-plugin/ in the future
// https://css-tricks.com/brotli-static-compression/
// https://betterexplained.com/articles/how-to-optimize-your-site-with-gzip-compression/
// https://www.npmjs.com/package/brotli-gzip-webpack-plugin

const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
// const PrerenderSPAPlugin = require('prerender-spa-plugin')
const WebpackMonitor = require('webpack-monitor');

// Zoomable Treemap
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//var glob = require("glob");
//folder: glob.sync("./src/js/utils/*.js")
module.exports = env => {
  return {

  devServer: {
    port: 9000
  },
  cache: true,
  entry: {
    head: './src/js/head',
    index: './src/js/main'
  },
  resolve: {
    alias: {
      'js': path.join(process.cwd(), 'src/js'),
      'css': path.join(process.cwd(), 'src/css'),
      'images': path.join(process.cwd(), 'src/images')
    }
  },
  output: {
    // Webpack traditionally only outputs js files.
    // html plugin required to insert js files
    // https://webpack.js.org/guides/lazy-loading/
    // https://webpack.js.org/guides/code-splitting/
    filename: '[name].[hash].js',
    chunkFilename: '[name].js',
    globalObject: "this"
  },
  optimization: {
    // https://itnext.io/react-router-and-webpack-v4-code-splitting-using-splitchunksplugin-f0a48f110312
    // https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: {
      chunks: 'all'
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
        // use: { loader: "babel-loader" } // Alt method maps .babelrc 
        use: { 
          loader: "babel-loader", 
          options: {
              "presets": [ ["env", { "targets": { node: "6" } }], "stage-0", "react" ],
              "plugins": ["syntax-dynamic-import"]
          }
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
        test: /\.css$/i,
        use: [ MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: {} },
          // indexHTML increases from 37.5Kb to 36.7Kb w autoprefixer
          { loader: "postcss-loader",
            options: {
              ident: 'postcss',
              plugins: [ require('autoprefixer')({
                  'overrideBrowserslist': ['> 1%', 'last 2 versions']
              }) ]
            }
          }
      ],
      },
      /* 
      // By default every local <img src="image.png"> is required (require('./image.png')). 
      // You may need to specify loaders for images in your configuration (recommended file-loader or url-loader).
      // In your code: import img from './file.png'; 
      // This will emit file.png as a file in the output directory
      // I'm not doing this right now but it could easily be added.
      // at the moment it builds a images folder within dist/images/src/
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath: 'images'
            }
          },
        ],
      }
      */
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    // https://webpack.js.org/plugins/mini-css-extract-plugin/
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].[id].css"
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    // https://github.com/numical/script-ext-html-webpack-plugin
    new ScriptExtHtmlWebpackPlugin({
      // inline: /\.js$/,
      defaultAttribute: 'async'
    }),
    // https://www.npmjs.com/package/html-inline-css-webpack-plugin
    new HTMLInlineCSSWebpackPlugin(),
    env.NODE_ENV == 'local' ? null : new BrotliGzipPlugin({
      asset: '[path].br[query]',
      algorithm: 'brotli',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      quality: 11
    }), 
    env.NODE_ENV == 'local' ? null : new BrotliGzipPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      quality: 11
    }),
    /*
    new PrerenderSPAPlugin({
      staticDir: path.join(__dirname, 'dist'),
      routes: [ '/' ]
    }),
    */ /*
    // zoomable treemap
    new BundleAnalyzerPlugin(),
    new WebpackMonitor({
      launch: true,
      port: 8887
    }),
    */
    new CopyWebpackPlugin([
      { from: './src/json_config.json', to: 'json_config.json', toType: 'file' },
      { from: './src/manifest.json', to: 'manifest.json', toType: 'file' },
      { from: './src/robots.txt', to: 'robots.txt', toType: 'file' },
      { from: './src/.htaccess', to: '.htaccess', toType: 'file' },
      { from: './src/images', to: 'images' },
      { from: './src/api', to: 'api' },
    ]),
    new WorkboxPlugin.InjectManifest({
      swSrc: './src/service-worker.js'
    })
  ].filter(Boolean),
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

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
// life begins at a billion examples
// markov models -> local variation. no backprop
// nlp = holy grail
// computers are programmable. That is, by inputting an appropriate sequence of instructions, we can change a computer’s behavior. Second, computers are universal. That is, with the right program we can make a computer perform any algorithmic process whatsoever, as long as the machine has enough memory and time.
// crystallized in a 1937 paper by Alan Turing, who argued that any algorithmic process whatsoever could be computed by a single universal, programmable computer. The machine Turing described — often known as a Turing machine — was the ancestor of modern computers.
// If you had a complete understanding of the machine, you’d understand all physical processes.
// In 1985, the physicist David Deutsch took another important step toward understanding the nature of algorithms.
// Every finitely realizable physical system can be perfectly simulated by a universal model computing machine operating by finite means.
// relationships between language and thought? Philosophers, linguists, psychologists, evolutionary theorists and cognitive scientists have too
// we don’t yet know how to combine quantum mechanics with general relativity
// All arguments which can be given are bound to be, fundamentally, appeals to intuition, and for this reason rather unsatisfactory mathematically
// who loves the sun -> calabria 2008 (iknowuthinkurthetalkofthetown)
// corner-stone applications in cognitive neuroscience, including face recognition, neural representation of word meaning, decoding mental states.
//http://www.kurzweilai.net/the-law-of-accelerating-returns


