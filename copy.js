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
  }
  //새 글 작성 페이지(/new)을 연다
  else if (url === "/new" && method === "GET") {
    // 글 작성 페이지(HTML)
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
  }
  //   /post/는 /post/{id}형태로만 요청 한걸 처리한다.
  // 글 상세 보기
  else if (url.startsWith("/post/") && method === "GET") {
    //parseInt() 함수는 문자열을 숫자(int형)으로 변경해준다.
    //.split("/")[2]은  "/"기준으로 나누어서 배열로 만들어 준다. 그리고 [2]번째의 문자열을 반환 해준다.
    //split로 받은 문자열을 parseInt()함수로 숫자로 변경 해준다.
    //그리하여 postId변수에 url로 받은 주소값을 변환된값이 postId의 값이 된다.
    const postId = parseInt(url.split("/")[2]);
    //posts는 모든 게시글을 담고 있는 배열
    const posts = loadPosts();
    //find()함수로 posts에 있는 데이터의 몇번째의 id가 psot로 들어가는 postId와 p.id를 비교해서 대입 한다.
    //그냥 p로 하면 가독성이 떨어져 다른 이름으로 하는게 보기는 편할거 같다.
    //그리고 데이터가 없으면 undefined가 대입 한다.
    const post = posts.find((p) => p.id === postId);
    //post의 값이 undefined가 아니라면 if문의 코드를 실행시킨다.
    //게시글을 찾았다는 의미
    if (post) {
      //post안에 있는 title와 content을 가져와서 html식으로 보여준다.
      const html = `
                  <h1>${post.title}</h1>
                  <p>${post.content}</p>
                  <p><small>작성일: ${new Date(
                    post.createdAt
                  ).toLocaleString()}</small></p>
              `;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    }
    //데이터가 undefined이면 else로 가서 404다 라는 식으로 HTML을 보여준다.
    else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
    }
  }
  //
  else if (url === "/create" && method === "POST") {
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
