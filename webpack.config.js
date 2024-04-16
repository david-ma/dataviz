const webpack = require('webpack')
const fs = require('fs')
const files = fs
  .readdirSync('./src/js')
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
  .reduce((acc, file) => {
    acc[file.replace('.ts', '')] = {
      import: `./src/js/${file}`,
      dependOn: 'chart',
    }
    return acc
  }, {})

var config = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    ...files,
    chart: './src/js/chart.ts',
  },
  output: {
    path: __dirname + '/dist/js',
    filename: '[name].js',
  },
  plugins: [
    // https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'datatables.net': 'datatables.net',
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
      {
        test: /\.([cm]?ts|tsx)$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
        },
      },
    ],
  },
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000,
  },
}

module.exports = (env, argv) => {
  // development by default
  if (argv.mode === 'production') {
    config.mode = 'production'
    delete config.devtool
    config.output.path = __dirname + '/public/js'
  }

  return config
}
