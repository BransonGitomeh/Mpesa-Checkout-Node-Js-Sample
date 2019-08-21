const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

const { NODE_ENV } = process.env;

console.log("building with ", { NODE_ENV });
const nodeModules = {};
fs.readdirSync("node_modules")
  .filter(x => [".bin"].indexOf(x) === -1)
  .forEach(mod => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  entry: NODE_ENV !== "development" ? "./src/index.js" : "./src/server.js",
  target: "node",
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "."),
    filename: "index.js",
    libraryTarget: "this"
  },
  externals: nodeModules,
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ],
  stats: {
    colors: true
  }
};
