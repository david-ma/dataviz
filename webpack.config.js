const webpack = require('webpack')
const fs = require('fs')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')

// const files = fs
//   .readdirSync('./src/js')
//   .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
//   .reduce((acc, file) => {
//     acc[file.replace('.ts', '')] = {
//       import: `./src/js/${file}`,
//       dependOn: 'chart',
//     }
//     return acc
//   }, {})

// function getFiles(dir) {
//   let results = {}
//   const list = fs.readdirSync(dir)
  
//   list.forEach(file => {
//     const filePath = path.join(dir, file)
//     const stat = fs.statSync(filePath)
    
//     if (stat.isDirectory()) {
//       // Not /js/vendor
//       Object.assign(results, getFiles(filePath))
//     } else if (
//       file.endsWith('.ts') && 
//       !file.endsWith('.d.ts') || 
//       file.endsWith('.js')
//     ) {
//       const relativePath = path.relative('./src/js', dir)
//       const entryName = path.join(
//         relativePath, 
//         file.replace(/\.(ts|js)$/, '')
//       ).replace(/\\/g, '/')
      
//       results[entryName] = {
//         import: `./${path.relative('.', filePath)}`,
//         dependOn: 'chart'
//       }
//     }
//   })
  
//   return results
// }

function getFiles(dir) {
  let results = {}
  const list = fs.readdirSync(dir)
  
  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      Object.assign(results, getFiles(filePath))
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      // Only include TypeScript files
      const relativePath = path.relative('./src/js', dir)
      const entryName = path.join(
        relativePath, 
        file.replace('.ts', '')
      ).replace(/\\/g, '/')
      
      results[entryName] = {
        import: `./${path.relative('.', filePath)}`,
        dependOn: 'chart'
      }
    }
  })
  
  return results
}



const files = getFiles('./src/js')
// console.log(files)


var config = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    ...files,
    chart: ['./src/js/chart.ts', './src/css/chart.scss'],
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
    new MiniCssExtractPlugin({
      filename: '../css/[name].css',
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/js/**/*.js',
          to: '[path][name][ext]',
          context: 'src/js/',
          noErrorOnMissing: true,
          info: { minimized: false }
        }
      ]
    })
  ],
  resolve: {
    // mainFields: ['module'],
    // mainFields: ['module', 'browser', 'main'],
    // Add `.ts` and `.tsx` as a resolvable extension.
    // extensions: ['.ts', '.tsx', '.js'],
    // extensions: ['.ts', '.tsx'],
    extensions: ['.ts', '.tsx', '.js', '.wasm'],
    alias: {
      'three/examples/jsm/loaders/OBJLoader': path.resolve(__dirname, 'node_modules/three/examples/jsm/loaders/OBJLoader.js'),
      'three/examples/jsm/loaders/MTLLoader': path.resolve(__dirname, 'node_modules/three/examples/jsm/loaders/MTLLoader.js'),
      './diff_match_patch': path.resolve(__dirname, 'src/js/diff_match_patch.js')
    },
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      // '.js': ['.js', '.ts'],
      '.cjs': ['.cjs', '.cts'],
      '.mjs': ['.mjs', '.mts'],
    },
  },
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true
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
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
      // {
      //   test: /rapier\.(js|wasm)$/,
      //   type: 'javascript/auto',
      //   loader: 'file-loader',
      //   options: {
      //     name: '[name].[ext]'
      //   }
      // }

      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   type: 'javascript/auto',
      //   // Just copy
      //   // loader: 'copy-webpack-plugin',

      //   // options: {
      //   //   name: '[name].[ext]',
      //   //   outputPath: '../js',
      //   // },
      // }
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
