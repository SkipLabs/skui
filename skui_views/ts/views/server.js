import * as http from "http";
import * as fs from "fs";
import * as path from "path";

const host = "localhost";
const port = 3333;

const files = {
  "/": { path: "./index.html", mime: "text/html" },
  "/index.html": { path: "./index.html", mime: "text/html" },
  "/favicon.svg": { path: "./favicon.svg", mime: "image/svg" },
  "/skui-views/src/": {
    path: "../../../node_modules/@skui/views/dist/src/skui_launch.js",
    mime: "text/javascript",
  },
};

const requestListener = function (req, res) {
  const fileresponce = (file) => {
    const filePath = path.join(import.meta.dirname, file.path);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end();
    } else {
      var stat = fs.statSync(filePath);
      res.writeHead(200, {
        "Content-Type": file.mime,
        "Content-Length": stat.size,
      });
      var readStream = fs.createReadStream(filePath);
      // We replaced all the event handlers with a simple call to readStream.pipe()
      readStream.pipe(res);
    }
  };

  const url = req.url.startsWith("/")
    ? new URL(`http://localhost${req.url}`)
    : new URL(req.url);
  try {
    const file = files[url.pathname];
    if (file) {
      fileresponce(file);
    } else if (url.pathname.startsWith("/skui-views/")) {
      const mime = url.pathname.endsWith(".js")
        ? "text/javascript"
        : url.pathname.endsWith(".ts")
          ? "text/typescript"
          : "application/octet-stream";
      fileresponce({
        path: `../../../node_modules/@skui/views/dist/${url.pathname.substring(12)}`,
        mime,
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
