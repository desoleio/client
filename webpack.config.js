const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/desole.js',
  output: {
    library: 'Desole',
    libraryTarget: 'window',
    filename: 'desole.js',
    path: path.resolve(__dirname, 'dist')
  }
}
