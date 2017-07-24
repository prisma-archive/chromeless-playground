const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/app.tsx',
  output: {
    path: __dirname + '/dist',
    filename: '[name].[hash].js',
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.json?$/, loader: 'json-loader' },
      { test: /\.css/, loader: 'raw-loader' },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
  ],
  node: {
    fs: "empty"
  }
}
