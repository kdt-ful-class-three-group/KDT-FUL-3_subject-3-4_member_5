const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const DATA_FILE = path.join(__dirname, "posts.json");

// 데이터 불러오기
// 기존 함수에서 !을 빼고 내가 보기 편하게 변경함
function loadPosts() {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return data ? JSON.parse(data) : [];
  } else {
    return [];
  }
}
//#18 데이터 저장
//writeFileSync은 저장하는 함수로 앞에 DATA_FILE에 JSON.stringify식으로 인자 받은 모든 객체 데이터를 들여쓰기로 저장한다는 함수
function savePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

// 데이터 유효성 검사 함수
//title와 content을 받아와 둘중에 하나하도 내용이 없으면 return을 실행 시키고 .length을 사용 하여 100자이내로 쓰는지 유효성 검사 하는 함수
function validatePostData(title, content) {
  if (!title || !content) return "제목과 내용을 입력하세요.";
  if (title.length > 100) return "제목은 100자 이내여야 합니다.";
  return null;
}

const server = http.createServer((req, res) => {
  //구조 분해 할당으로 req.을 사용 안해도 된다.
  const { method, url } = req;
  //
  if (url === "/" && method === "GET") {
    const posts = loadPosts();
    let html = `<h1>블로그</h1>
      <ul>
        <a href="/new">새 글 작성</a>
      </ul>`;
    //gpt를 사용 해서 가져온 코드인데 나였으면 forEach을 사용하지않고 for문을 사용했을거 같아 다시 코딩해보고 작동결과 똑같이 작동하는 걸 확인
    for (let i = 0; i < posts.length; i++) {
      html += `<li><a href="/post/${posts[i].id}">${posts[i].title}</a></li>`;
    }
    html += "</ul>";
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    //정상 작동하면 html를 열어라
    res.end(html);
  } else if (url === "/new" && method === "GET") {
    // 글 작성 페이지
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
    // 글 상세 보기
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
                  <a href="/">홈으로</a>
              `;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
    }
  } else if (url === "/create" && method === "POST") {
    // 글 작성 처리
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const postData = querystring.parse(body);
      const { title, content } = postData;

      // 데이터 유효성 검사
      const validationError = validatePostData(title, content);
      if (validationError) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<h1>입력 오류</h1><p>${validationError}</p><a href="/new">다시 작성</a>`
        );
        return;
      }

      // 새 글 추가
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
