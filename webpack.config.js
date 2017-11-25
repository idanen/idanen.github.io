const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: {
    lib: './app/index.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: 'last 2 versions'
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  },
  target: 'web',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyWebpackPlugin([
      {
        from: 'node_modules/**/*.css',
        to: path.resolve(__dirname, 'lib')
      }
    ])
  ],
  output: {
    path: path.resolve(__dirname, 'build', 'lib'),
    filename: '[name].bundle.js'
  },
  // devServer: {
  //   contentBase: path.join(__dirname, 'lib'),
  //   // compress: true,
  //   port: 9000
  // }
};

module.exports = config;
