const button = document.querySelector(".menu-toggle");
const mainMenu = document.querySelector("#main-menu");

button.addEventListener("click", (event) => {
  event.preventDefault();
  const isOpen = mainMenu.classList.toggle("is-open");
  button.setAttribute("aria-expanded", String(isOpen));
});
