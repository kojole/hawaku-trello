module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: ['./src/index.ts'],
  output: {
    filename: 'bundle.js',
    path: __dirname + '/public'
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  },
  resolve: {
    extensions: ['.ts']
  }
};
