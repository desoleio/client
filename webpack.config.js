'use strict';
const path = require('path'),
	fs = require('fs'),
	SriPlugin = require('webpack-subresource-integrity'),
	PrintIntegrityPlugin = function () {
		this.apply = function (compiler) {
			compiler.hooks.done.tap('integrity', (stats) => {
				const mainAssetName = stats.toJson().assetsByChunkName.main,
					integrity = stats.compilation.assets[mainAssetName].integrity;
				console.log('integrity', integrity);
				fs.writeFileSync(path.resolve(__dirname, 'dist', 'sri-integrity.txt'), integrity, 'utf8');
			});
		};
	};

module.exports = {
	mode: 'production',
	entry: './src/desole.js',
	output: {
		crossOriginLoading: 'anonymous',
		library: 'Desole',
		libraryTarget: 'window',
		filename: 'client-min.js',
		path: path.resolve(__dirname, 'dist')
	},
	plugins: [
		new SriPlugin({
			hashFuncNames: ['sha256', 'sha384'],
			enabled: true
		}),
		new PrintIntegrityPlugin()
	]
};
