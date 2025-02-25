const http = require("http");
const fs = require("fs");
const url = require("url");

const DATA_FILE = "posts.json";

function loadPosts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return data ? JSON.parse(data) : [];
}

//writeFileSync은 저장하는 함수로 앞에 DATA_FILE에 JSON.stringify식으로 인자 받은 모든 객체 데이터를 들여쓰기로 저장한다는 함수
function savePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}
