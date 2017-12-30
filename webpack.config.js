const webpack = require('webpack');

const config = {
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        include: /src/,
        exclude: /node_modules/
      }
    ]
  },
  plugins: [],
  externals: {
    react: 'react',
    redux: 'redux',
    'react-redux': 'react-redux'
  }
};

if (process.env.NODE_ENV !== 'development') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;
