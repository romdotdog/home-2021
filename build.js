// Minify using variety of minifiers and pick best result

const fs = require("fs.promises");
const copydir = require("copy-dir");

copydir.sync("src", "dist", {});

const babelMinify = require("babel-minify");
const terse = require("terser").minify;
const uglify = require("uglify-js").minify;
const Compiler = require("google-closure-compiler").compiler;

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

const compiled = new Compiler({
	js: "src/index.js",
	compilation_level: "ADVANCED",
	rewrite_polyfills: false
});

fs.readFile("src/index.js", "utf-8")
	.then(src => {
		const babel = babelMinify(src);
		const uglifyjs = uglify(src, {
			toplevel: true,
			compress: { unsafe: true, passes: 4 }
		});

		return Promise.all([
			terse(src, {
				toplevel: true,
				compress: { unsafe: true, passes: 4 }
			}),
			new Promise((r, e) =>
				compiled.run((_, res, err) => (err ? e(err) : r(res)))
			)
		]).then(([terser, closure]) => ({
			"babel-minify": babel.code,
			terser: terser.code,
			uglify: uglifyjs.code,
			closure
		}));
	})
	.then(writeSmallestToFile("dist/index.js", "js"));

// CSS
const csso = require("csso").minify;
const CleanCSS = require("clean-css");
const cssnano = require("cssnano");

fs.readFile("src/index.css", "utf-8")
	.then(src => {
		const cssoResult = csso(src);
		const cleanCSS = new CleanCSS({ level: 2 }).minify(src);
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
const htmlMinify = require("html-minifier").minify;

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
