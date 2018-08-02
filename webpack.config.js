const base = {
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js']
  }
};

module.exports = [
  {
    ...base,
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
  },
  {
    ...base,
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
  }
];
