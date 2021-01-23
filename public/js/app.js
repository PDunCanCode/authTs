let auth0 = null;
const fetchAuthConfig = () => fetch("/auth_config.json");
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });
};
// ..

window.onload = async () => {
  await configureClient();
  updateUI();
};

const updateUI = async () => {
  const isAuthenticated = await auth0.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;

  if (isAuthenticated) {
    document.getElementById("gated-content").classList.remove("hidden");

    document.getElementById(
      "ipt-access-token"
    ).innerHTML = await auth0.getTokenSilently();

    document.getElementById("ipt-user-profile").textContent = JSON.stringify(
      await auth0.getUser()
    );
  } else {
    document.getElementById("gated-content").classList.add("hidden");
  }
};

const query = window.location.search;
if (query.includes("code=") && query.includes("state=")) {
  // Process the login state
  await auth0.handleRedirectCallback();

  updateUI();

  // Use replaceState to redirect the user away and remove the querystring parameters
  window.history.replaceState({}, document.title, "/");
}

// ..

const login = async () => {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin,
  });
};
// public/js/app.js

const logout = () => {
  auth0.logout({
    returnTo: window.location.origin,
  });
};

var days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var date = new Date();
var todaysDay = document.getElementById("todaysDay");
var todaysDate = document.getElementById("todaysDate");
todaysDay.textContent = days[date.getDay()];
todaysDate.textContent =
  months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
var formEl = document.getElementById("form");
var todoInputEl = document.getElementById("todoInput");
var todoListContainer = document.querySelector(".todo__list");
function displayTodoDOM(todo) {
  var liEl = document.createElement("li");
  liEl.classList.add("bounceIn");
  liEl.innerHTML =
    '\n  <span class="text">' +
    todo +
    '</span>\n  <div class="options">\n    <span id="check"><i class="fa fa-check"></i></span>\n    <span id="edit"><i class="fa fa-edit"></i></span>\n    <span id="trash"><i class="fa fa-trash"></i></span>\n  </div>\n  ';
  todoListContainer.appendChild(liEl);
}
function itemToDelete(item) {
  if (item.classList.contains("fa-trash") || item.id === "trash") {
    var todoLiEl_1 = item.closest("li");
    todoLiEl_1.classList.remove("bounceIn");
    todoLiEl_1.classList.add("bounceOutDown");
    setTimeout(function () {
      todoLiEl_1.remove();
    }, 1000);
    deleteDataFromLocalStorage(item);
  }
}
function itemToEdit(item) {
  if (item.classList.contains("fa-edit") || item.id === "edit") {
    var todoLiEl = item.closest("li");
    todoInputEl.value = todoLiEl.textContent.trim();
    todoLiEl.remove();
    editItemFromLocalStorage(item);
  }
}
function itemDone(item) {
  if (item.classList.contains("fa-check") || item.id === "check") {
    var crossItem_1 = item.closest("li");
    crossItem_1.firstElementChild.classList.add("completed");
    crossItem_1.classList.add("rotateOutDownLeft");
    crossItem_1.addEventListener("transitionend", function () {
      crossItem_1.remove();
    });
    deleteDataFromLocalStorage(item);
  }
}
// Local Storage Functions
function storeToLocalStorage(todo) {
  var todoArr;
  if (localStorage.getItem("todos") === null) {
    todoArr = [];
  } else {
    todoArr = JSON.parse(localStorage.getItem("todos"));
  }
  todoArr.push(todo);
  localStorage.setItem("todos", JSON.stringify(todoArr));
}
function displayDataFromLocalStorage() {
  var todoArr = JSON.parse(localStorage.getItem("todos"));
  for (var _i = 0, todoArr_1 = todoArr; _i < todoArr_1.length; _i++) {
    var todo = todoArr_1[_i];
    displayTodoDOM(todo);
  }
}
function deleteDataFromLocalStorage(item) {
  var todoArr = JSON.parse(localStorage.getItem("todos"));
  var todoLiEl = item.closest("li");
  var todoItemLeft = todoArr.filter(function (todo) {
    return todoLiEl.textContent.trim() !== todo;
  });
  localStorage.setItem("todos", JSON.stringify(todoItemLeft));
}
function editItemFromLocalStorage(item) {
  deleteDataFromLocalStorage(item);
}
document.addEventListener("DOMContentLoad", displayDataFromLocalStorage);
todoListContainer.addEventListener("click", function (e) {
  itemToDelete(e.target);
  itemToEdit(e.target);
  itemDone(e.target);
});
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  var inputTodo = todoInputEl.value;
  if (!inputTodo) {
    alert("Please enter a Todo Item");
  } else {
    displayTodoDOM(inputTodo);
    storeToLocalStorage(inputTodo);
  }
  formEl.reset();
});
