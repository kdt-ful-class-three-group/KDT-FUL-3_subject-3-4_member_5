//gtp 원본 코드
const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const DATA_FILE = path.join(__dirname, "posts.json");

function loadPosts() {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return data ? JSON.parse(data) : [];
  } else {
    return [];
  }
}
function savePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}
function validatePostData(title, content) {
  if (!title || !content) return "제목과 내용을 입력하세요.";
  if (title.length > 100) return "제목은 100자 이내여야 합니다.";
  return null;
}

const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (url === "/" && method === "GET") {
    const posts = loadPosts();
    let html = `<h1>블로그</h1>
      <ul>
        <a href="/new">새 글 작성</a>
      </ul>`;
    for (let i = 0; i < posts.length; i++) {
      html += `<li><a href="/post/${posts[i].id}">${posts[i].title}</a></li>`;
    }
    html += "</ul>";
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } else if (url === "/new" && method === "GET") {
    const html = `
              <h1>새 글 작성</h1>
              <form method="POST" action="/create">
                  <input type="text" name="title" placeholder="제목" required /><br>
                  <textarea name="content" placeholder="내용" required></textarea><br>
                  <button type="submit">작성</button>
              </form>
          `;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } else if (url.startsWith("/post/") && method === "GET") {
    const postId = parseInt(url.split("/")[2]);
    const posts = loadPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      const html = `
                  <h1>${post.title}</h1>
                  <p>${post.content}</p>
                  <p><small>작성일: ${new Date(
                    post.createdAt
                  ).toLocaleString()}</small></p>
              `;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
    }
  } else if (url === "/create" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const postData = querystring.parse(body);
      const { title, content } = postData;

      const validationError = validatePostData(title, content);
      if (validationError) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<h1>입력 오류</h1><p>${validationError}</p><a href="/new">다시 작성</a>`
        );
        return;
      }
      const posts = loadPosts();
      const newPost = {
        id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1,
        title,
        content,
        createdAt: new Date().toISOString(),
      };
      posts.push(newPost);
      savePosts(posts);
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
  }
});

server.listen(8000, () => {
  console.log("서버 실행 중: http://localhost:8000");
});
