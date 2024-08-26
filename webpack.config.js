const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: './index.js', // Adjust to your entry point
  target: 'node', // Specify that this is for a Node.js application
  externals: [nodeExternals()], // Exclude node_modules from the bundle
  output: {
    filename: 'bundle.js', // Output bundle file
    path: path.resolve(__dirname, 'public'), // Change output directory to 'public'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile JavaScript using Babel
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
