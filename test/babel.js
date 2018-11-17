require("babel-register")({
	ignore: /node_modules\/(?!tronweb)/,
	presets: ["env", "stage-2"],
});