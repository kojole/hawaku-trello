module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: ['./src/index.js'],
  output: {
    filename: 'bundle.js',
    path: __dirname + '/public'
  }
};
