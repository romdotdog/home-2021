const fg = require("fast-glob");
const fs = require("fs.promises");
const { optimize } = require("svgo");
const join = require("@telia/svg-join");

const options = { multipass: true };
module.exports = fg("svgs/*.svg")
	.then(files =>
		Promise.all(
			files.map(f =>
				fs.readFile(f, "utf-8").then(svg => [f, optimize(svg, options).data])
			)
		)
	)
	.then(svgs =>
		fs.writeFile("src/bundle.svg", join(svgs)[0].replace(/\n/g, ""))
	);
