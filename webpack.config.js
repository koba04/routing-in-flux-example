module.exports = {
  entry: './app.js',
  output: {
    path: './public',
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
  devServer: {
    contentBase: './public',
    inline: true,
    port: 8080,
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
