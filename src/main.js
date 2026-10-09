const button = document.querySelector(".menu-toggle");
const mainMenu = document.querySelector("#main-menu");

button.addEventListener("click", (event) => {
  event.preventDefault();
  mainMenu.classList.toggle("is-open");
});
