const http = require("http");
const fs = require("fs");
const url = require("url");

const DATA_FILE = "posts.json";
// 데이터 불러오기
//if문으로 fs. existsSync함수를 활용하여 DATA_FILE에 파일이 있나 없나 확인 있으면 코드 작동  없으면 []을 반환 하여 함수 종료
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
