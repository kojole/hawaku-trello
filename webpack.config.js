const path = require('path');

const config = params => env => {
  const configFile =
    'src/config' + (env && env.development ? '.development' : '');

  return {
    ...params,
    mode: 'development',
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@/config$': path.resolve(__dirname, configFile)
      }
    }
  };
};

module.exports = [
  config({
    entry: {
      index: './src/frontend/index.ts',
      'add-assignment': './src/frontend/add-assignment.ts'
    },
    output: {
      filename: '[name].js',
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
  config({
    entry: './src/functions/index.ts',
    output: {
      filename: 'bundle.js',
      path: __dirname + '/dist',
      library: 'Hawaku'
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
    }
  })
];
