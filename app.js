const http = require("http");
const fs = require("fs");
const url = require("url");
const parse = require("querystring");

const DATA_FILE = "posts.json"; // 블로그 데이터 저장 파일

// 파일에서 데이터 읽기
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return data ? JSON.parse(data) : [];
}

// 파일에 데이터 저장
function writeData(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf8");
}

// 서버 생성
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // CORS 설정 (프론트엔드와 연동 시 필요)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS 요청 처리 (CORS Preflight)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  //  1. 전체 게시글 조회 (GET /posts)
  if (req.method === "GET" && pathname === "/posts") {
    const posts = readData();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(posts));
  }

  //  2. 게시글 추가 (POST /posts)
  // if (req.method === "POST" && pathname === "/posts") {
  //   let body = "";
  //   req.on("data", (chunk) => (body += chunk));
  //   req.on("end", () => {
  //     const newPost = JSON.parse(body);
  //     const posts = readData();
  //     newPost.id = Date.now(); // 고유 ID 부여
  //     posts.push(newPost);
  //     writeData(posts);
  //     res.writeHead(201, { "Content-Type": "application/json" });
  //     res.end(JSON.stringify(newPost));
  //   });
  // }
  //  2. 게시글 추가 (POST /posts)
  if (req.method === "POST" && pathname === "/posts") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const newPost = JSON.parse(body);
        const posts = readData();
        newPost.id = Date.now();
        posts.push(newPost);
        writeData(posts);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newPost));
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      }
    });
  }

  //  3. 게시글 수정 (PUT /posts?id=123)
  // if (req.method === "PUT" && pathname === "/posts") {
  //   const postId = Number(query.id);
  //   let body = "";
  //   req.on("data", (chunk) => (body += chunk));
  //   req.on("end", () => {
  //     const updatedPost = JSON.parse(body);
  //     let posts = readData();
  //     posts = posts.map((post) =>
  //       post.id === postId ? { ...post, ...updatedPost } : post
  //     );
  //     writeData(posts);
  //     res.writeHead(200, { "Content-Type": "application/json" });
  //     return res.end(JSON.stringify({ message: "Post updated" }));
  //   });
  // }
  if (req.method === "PUT" && pathname === "/posts") {
    const postId = Number(query.id);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const updatedPost = JSON.parse(body);
        let posts = readData();
        posts = posts.map((post) =>
          post.id === postId ? { ...post, ...updatedPost } : post
        );
        writeData(posts);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Post updated" }));
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      }
    });
  }

  //  4. 게시글 삭제 (DELETE /posts?id=123)
  if (req.method === "DELETE" && pathname === "/posts") {
    const postId = Number(query.id);
    let posts = readData();
    posts = posts.filter((post) => post.id !== postId);
    writeData(posts);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Post deleted" }));
  }

  //  404 처리
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(8000, () => {
  console.log("서버 실행 중: http://localhost:8000");
});
