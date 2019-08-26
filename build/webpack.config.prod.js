'use strict'

const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const rm = require('rimraf');

rm.sync('./dist')

module.exports = merge(baseConfig, {
	mode: 'production',
	optimization: {
		minimizer: [new UglifyJsPlugin()],
		namedModules: false,
		namedChunks: false,
		nodeEnv: 'production',
		flagIncludedChunks: true,
		occurrenceOrder: true,
		sideEffects: true,
		usedExports: true,
		concatenateModules: true,
		noEmitOnErrors: true,
		checkWasmTypes: true,
		minimize: true,
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all'
				}
			}
		}
	},
	module: {
		rules: [
			{
				test: /\.css?$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.HashedModuleIdsPlugin(),
		new MiniCssExtractPlugin({
			filename: 'main.css'
		}),
		// new UglifyJsPlugin({
		// 	uglifyOptions: {
		// 		compress: {
		// 			warnings: false
		// 		}
		// 	},
		// 	sourceMap: false,
		// 	parallel: true
		// }),
	]
})