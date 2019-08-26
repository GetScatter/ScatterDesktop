'use strict'

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const utils = require('./utils')

module.exports = {
	entry : "./src/main.js",
	//devtool: 'source-map',
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		modules: [
			'node_modules'
		],
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
	},

	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader'
			}, {
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				}
			}, {
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						name: utils.assetsPath('img/[name].[hash:7].[ext]')
					}
				}
			}, {
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						name: utils.assetsPath('media/[name].[hash:7].[ext]')
					}
				}
			}, {
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
					}
				}
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'index.html',
			inject: true,
			chunksSortMode: 'none'
		}),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin([{
			from: utils.resolve('static'),
			to: utils.resolve('dist/static'),
			toType: 'dir'
		}]),
	]
}