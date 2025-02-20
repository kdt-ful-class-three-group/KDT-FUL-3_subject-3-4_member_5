const http = require("http");
const fs = require("fs");

const server = http.createServer(function (request, response) {
  if (request.method === "GET") {
    if (request.url === "/") {
      // index.html 파일 읽기
      const MAIN_PAGE = fs.readFileSync("index.html");
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(MAIN_PAGE);
      return;
    } else if (request.url === "/style.css") {
      // style.css 파일 읽기
      const style = fs.readFileSync("style.css", "utf-8");
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/css");
      response.end(style);
      return;
    } else if (request.url === "/index.js") {
      // index.js 파일 읽기
      const js = fs.readFileSync("index.js", "utf-8");
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/javascript");
      response.end(js);
      return;
    } else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
      return;
    }
  }
  if (request.method === "POST") {
    console.log(request.url);
    request.on("data", function (data) {
      console.log(data.toString());
    });
    request.on("end", function () {
      console.log("응답 잘 받음");
    });
    return;
  } else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
    return;
  }
});

// 서버 실행 (포트 8000)
server.listen(8000, function () {
  console.log("서버 도는중 http://localhost:8000");
});
