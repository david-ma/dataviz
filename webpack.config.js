// // path
// module.exports = {
//   mode: 'development',
//   entry: './src/js/index.ts',
//   output: {
//     path: __dirname + '/public/js',
//     filename: 'index.js',
//   },
//   resolve: {
//     // mainFields: ['browser', 'module'],
//     mainFields: ['module', 'browser', 'main'],
//   },
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         use: 'ts-loader',
//       },
//       {
//         test: /\.(?:js|mjs|cjs)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: [['@babel/preset-env', { targets: 'defaults' }]],
//           },
//         },
//       },
//     ],
//   },
// }

var webpack = require('webpack')

const fs = require('fs')

var files = fs
  .readdirSync('./src/js')
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
  .reduce((acc, file) => {
    acc[file.replace('.ts', '')] = `./src/js/${file}`
    return acc
  }, {})

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  // entry: './src/js/index.ts',
  entry: {
    // ...files,
    chart: './src/js/chart.ts',
    // index: './src/js/index.ts',
    earthquake: './src/js/earthquake.ts',
    war: './src/js/war.ts',
    Theseus: './src/js/Theseus.ts',
    go: './src/js/go.ts',
    breathe: './src/js/breathe.ts',
    matrix: './src/js/matrix.ts',
    winamp: './src/js/winamp.ts',
    AusIncome: './src/js/AusIncome.ts',
    wealth: './src/js/wealth.ts',
  },
  output: {
    path: __dirname + '/public/js',
    filename: '[name].js',
    // filename: 'index.js',
  },
  plugins: [
    // https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      datatables: 'datatables.net',
      'datatables.net': 'datatables.net',
      'dataTables.net': 'datatables.net',
      d3: 'd3',
      showdown: 'showdown',
    }),
  ],
  resolve: {
    // mainFields: ['module'],
    // mainFields: ['module', 'browser', 'main'],
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.cjs': ['.cjs', '.cts'],
      '.mjs': ['.mjs', '.mts'],
    },
  },
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.([cm]?ts|tsx)$/, loader: 'ts-loader' },
    ],
  },
}
