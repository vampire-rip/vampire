const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const distPath = path.resolve(__dirname, './public');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin([distPath]),
    new HtmlWebpackPlugin({
      title: '<Template>',
      template: './src/index.html',
      filename: 'index.html',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].ext.[hash:7].css',
      chunkFilename: 'css/[id].[hash:7].css',
    }),
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js',
      '@s': path.resolve(__dirname, 'src'),
      '@c': path.resolve(__dirname, 'src/components'),
      '@r': path.resolve(__dirname, 'src/resources'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.vcss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader/url',
          {
            loader: 'file-loader',
            options: {
              name: 'css/[name].[hash:7].css',
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader/url',
          {
            loader: 'file-loader',
            options: {
              name: 'css/[name].[hash:7].css',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, 'src')],
        options: {
          presets: [
            [
              '@babel/preset-env', {
              'targets': {
                'chrome': '58',
                'ie': '11',
                'safari': '10.1'
              },
            }]
          ],
          plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-syntax-dynamic-import", "@babel/plugin-transform-runtime"]
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'images/[name].[hash:7].[ext]',
          limit: 8192,
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'media/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[hash:7].[ext]',
          limit: 8192,
        },
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':data-src'],
          },
        },
      },
      {
        test: /favicon\.ico(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'favicon.ico',
        },
      },
    ],
  },
  devServer: {
    contentBase: '.',
  },
  output: {
    filename: 'scripts/[name].[hash:7].js',
    path: distPath,
  },
};
