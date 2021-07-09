// Minify using variety of minifiers and pick best result

const fs = require("fs.promises");
const copydir = require("copy-dir");

copydir.sync("src", "dist", {});

const babelMinify = require("babel-minify");
const { minify: terse } = require("terser");
const { minify: uglify } = require("uglify-js");

const writeSmallestToFile = (file, stage) => outputs => {
	const results = Object.entries(outputs).sort(
		(a, b) => a[1].length - b[1].length
	);

	const [name, src] = results[0];

	console.log(`best ${stage} minifier was ${name}. results:`);
	console.log(results.map(r => [r[0], r[1].length]));

	fs.writeFile(file, src);
};

// JS
fs.readFile("src/index.js", "utf-8")
	.then(src => {
		const babel = babelMinify(src);
		const uglifyjs = uglify(src, {
			toplevel: true,
			compress: { unsafe: true, passes: 4 }
		});

		return terse(src, {
			toplevel: true,
			compress: { unsafe: true, passes: 4 }
		}).then(terser => ({
			"babel-minify": babel.code,
			terser: terser.code,
			uglify: uglifyjs.code
		}));
	})
	.then(writeSmallestToFile("dist/index.js", "js"));

// CSS
const { minify: csso } = require("csso");
const CleanCSS = require("clean-css");
const cssnano = require("cssnano");

fs.readFile("src/index.css", "utf-8")
	.then(src => {
		const cssoResult = csso(src);
		const cleanCSS = new CleanCSS().minify(src);
		return cssnano()
			.process(src, { from: undefined }, { preset: "advanced" })
			.then(cssnano => ({
				csso: cssoResult.css,
				"clean-css": cleanCSS.styles,
				cssnano: cssnano.css
			}));
	})
	.then(writeSmallestToFile("dist/index.css", "css"));

// HTML
const htmlnano = require("htmlnano");
const { minify: htmlMinify } = require("html-minifier");

fs.readFile("src/index.html", "utf-8")
	.then(src => {
		const htmlMinifier = htmlMinify(src, {
			collapseInlineTagWhitespace: true,
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			removeAttributeQuotes: true,
			removeComments: true,
			removeEmptyAttributes: true,
			removeOptionalTags: true,
			removeRedundantAttributes: true,
			sortAttributes: true,
			sortClassName: true,
			useShortDoctype: true,
			minifyJS: true,
			minifyURLs: true
		});

		return htmlnano
			.process(src, { from: undefined }, htmlnano.presets.max)
			.then(htmlnano => ({
				"html-minifier": htmlMinifier,
				htmlnano: htmlnano.html
			}));
	})
	.then(writeSmallestToFile("dist/index.html", "html"));
