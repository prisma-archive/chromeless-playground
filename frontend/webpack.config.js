const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      './src/index.tsx',
      'graphcool-styles/dist/styles.css',
    ],
  },
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
      {test: /\.tsx?$/, loader: 'ts-loader'},
      {test: /\.json?$/, loader: 'json-loader'},
      {test: /\.css/, loader: 'style-loader!css-loader'},
      {test: /icons\/.*\.svg$/, loader: 'raw-loader!svgo-loader'},
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
