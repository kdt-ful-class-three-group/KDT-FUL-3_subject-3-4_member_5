const root = document.getElementById("root");
const h1 = root.children[0];

// * DOM 이벤트
h1.addEventListener("click", function () {
  console.log("click 이벤트 발생!");
  h1.style.color = "red";
});
