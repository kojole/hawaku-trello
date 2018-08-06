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
  config({
    entry: './src/functions/index.ts',
    output: {
      filename: 'bundle.js',
      path: __dirname + '/dist',
      library: 'Hawaku',
      libraryTarget: 'this'
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
