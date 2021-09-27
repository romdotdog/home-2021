const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const requestListener = function (req, res) {
	const uri = url.parse(req.url).pathname, 
      filename = path.join(process.cwd(), "dist", uri == "/" ? "index.html" : uri);

  	fs.readFile(filename, "binary", function(err, file) {
		if(err) {        
			res.writeHead(500, {"Content-Type": "text/plain"});
			res.write(err + "\n");
			res.end();
			return;
		}
		
		let ct = "text/html";
		if (uri == "/index.css")
			ct = "text/css"
		else if (uri == "/index.js")
			ct = "text/javascript"
		else if (uri == "/bundle.svg")
			ct = "image/svg+xml"

		res.writeHead(200, { "Content-Type": ct });
		res.write(file, "binary");
		res.end();
	});
}

const server = http.createServer(requestListener);
server.listen(3000);