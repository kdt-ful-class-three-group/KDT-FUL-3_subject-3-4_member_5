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
      html += `<li><a href="/post/${posts[i].id}">${posts[i].title}</a></li>
                <a href="/edit/${posts[i].id}">[수정]</a> 
                <a href="/delete/${posts[i].id}">[삭제]</a></li>`;
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
      console.log("post에서의 에러");
      res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
    }
  }
  //  /create 주소로 들어노는 POST요청을 처리 시작 html에서 submit버튼을 누르면
  // 요청을 받아서 처리하는 부분
  // 글 작성 처리
  else if (url === "/create" && method === "POST") {
    //요청 본문을 저장할 변수
    let body = "";
    //chunk는 클라이언트가 보낸 요청데이터를 조각조각 받아 대입 하는부분
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      //요청 데이터가 잘들어가나 확인
      console.log("받은 데이터 :", body);
      //querystring은 문자열을 객체로 변환 시켜주는 도구
      const postData = querystring.parse(body);
      //querystring.parse()로 어떻게 변화는지 확인
      console.log("변환 데이터 :", postData);
      //구조 분해 할당 활용
      //각각 받은 데이터 속 title, content를 변수 title, content 담는 부분
      const { title, content } = postData;
      // 데이터 유효성 검사
      // 받은 데이터를 validatePostData()함수에다가 넣어 이상이 없으면
      // null값을 받아 if문이 작동이 안되며 이상이 있어 if문이 실행이 되면
      // res.end의 html에 함수에 전달 받은 값을 ${validationError}에 값을 전달한다.
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
        //새글에 id을 넣어주는 방법
        //posts.length > 0은 저장한 데이터가 있는지 확인 하는 부분
        //데이터가 없으면 id가 1이 되는부분
        //있으면 posts[posts.length-1](posts.length의 -1하는 이유는 배열 때문에)
        //기존에 있는 아이디에 +1 하여 순서대로 id값이 들어가게 했습니다.
        id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1,
        title,
        content,
        createdAt: new Date().toISOString(),
      };
      //push()함수로 배열에 새로운 데이터를 축가하는 부분
      //newPost를 posts에 추가한다.
      //이 부분에 데이터가 title나 content가 데이터가 없으면 ""로 들어가지만
      //문제가 없이 돌아간다 하지만 앞에 데이터 유효성 검사 했으므로 데이터가 있다.
      posts.push(newPost);
      //savePosts(posts); 을 사용하지 않으면 무슨 문제가 생기는지
      //push로 붙인 부분은 데이터가 사라지기 때문에
      //push는 데이터만 붙이는 것뿐 파일에는 저장을 못하기 때문에
      //savePosts을 사용하여 파일에 저장 해주는 역활을 해준다.
      savePosts(posts);
      //크롬 네트워크 create의 상태가 302이라고 나온게 요청이 끝나면 302로 "/"으로 다시 돌아가서 http://localhost/로 다시 요청하는 방식이다.
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  }
  // 글 수정 페이지
  // /edit/는 /edit/{id}형태로만 요청 한걸 처리한다
  else if (url.startsWith("/edit/") && method === "GET") {
    const postId = parseInt(url.split("/")[2]);
    const posts = loadPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      //리스트에서 수정하고 싶은 글에 수정를 누르면 아래 html로 들어가진다.
      //id로 검색하여 원하는 글을 수정하는 부분이다.
      //수정 버튼을 눌러 다시 글작서을 하는 방식으로 type="submit"로 POST로 넘겨 다시 글을 작성하는 방식이다.
      const html = `
                  <h1>글 수정</h1>
                  <form method="POST" action="/update/${post.id}">
                      <input type="text" name="title" value="${post.title}" required /><br>
                      <textarea name="content" required>${post.content}</textarea><br>
                      <button type="submit">수정</button>
                  </form>
              `;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      console.log("edit에서의 에러");
      res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
    }
  }
  // 글 수정 처리
  else if (url.startsWith("/update/") && method === "POST") {
    const postId = parseInt(url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      //body로 받았을때 키-값 형태의 객체로 변환
      const postData = querystring.parse(body);
      //각각 데이터 대입
      const { title, content } = postData;
      const posts = loadPosts();
      //게시글 목록에서 postId와 일치하는 글을 찾아서 인덱스를 반환
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex !== -1) {
        //찾은 글의 title을 수정된 title로 바꾸는 것
        posts[postIndex].title = title;
        //찾은 글의 content을 수정된 content로 바꾸는 것
        posts[postIndex].content = content;
        //수정된 게시글을 다시 파일에 저장
        savePosts(posts);
      }
      res.writeHead(302, { Location: "/" });
      console.log("/update/302 작동");
      res.end();
    });
  }
  // 글 삭제 처리
  ///delete/3라고 url로 요청을 하면 3번게시물을 삭제 하라는 요청하는 방식
  else if (url.startsWith("/delete/") && method === "GET") {
    //삭제할 id을 찾고 postID에 대입
    const postId = parseInt(url.split("/")[2]);
    //삭제할 id하고  게시글 id하고 일치 하는지 비교 하여 맞으면 삭제 후
    //새로운 배열을 만듬
    const posts = loadPosts().filter((p) => p.id !== postId);
    // 삭제후 새로운 배열을 저장할 파일에 저장
    savePosts(posts);
    //삭제후 "/"로 이동
    res.writeHead(302, { Location: "/" });
    //삭제 확인
    console.log(`${postId}삭제`);
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    console.log("delete에서의 에러");
    res.end("<h1>404 - 페이지를 찾을 수 없음</h1>");
  }
});

server.listen(8000, () => {
  console.log("서버 실행 중: http://localhost:8000");
});
