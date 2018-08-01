const GasPlugin = require('gas-webpack-plugin');

const base = {
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js']
  }
};

module.exports = [
  Object.assign(base, {
    entry: './src/frontend/index.ts',
    output: {
      filename: 'bundle.js',
      path: __dirname + '/public'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader'
        }
      ]
    }
  }),
  Object.assign(base, {
    entry: './src/functions/index.ts',
    output: {
      filename: 'bundle.js',
      path: __dirname + '/dist'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsconfig.gas.json'
              }
            }
          ]
        }
      ]
    },
    devtool: false,
    plugins: [new GasPlugin()]
  })
];
