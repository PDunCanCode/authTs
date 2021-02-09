export {};
import createAuth0Client from "@auth0/auth0-spa-js";

let auth0: {
  isAuthenticated: () => any;
  getTokenSilently: () => string | PromiseLike<string>;
  getUser: () => any;
  handleRedirectCallback: () => any;
  loginWithRedirect: (arg0: { redirect_uri: string }) => any;
  logout: (arg0: { returnTo: string }) => void;
} = null;
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


const days: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months: string[] = [
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
const date = new Date();
const todaysDay = document.getElementById("todaysDay");
const todaysDate = document.getElementById("todaysDate");
todaysDay.textContent = days[date.getDay()];
todaysDate.textContent = `${
  months[date.getMonth()]
} ${date.getDate()}, ${date.getFullYear()}`;

const formEl = document.getElementById("form") as HTMLFormElement;
const todoInputEl = document.getElementById("todoInput") as HTMLInputElement;
const todoListContainer = document.querySelector(".todo__list");

function displayTodoDOM(todo: string | number) {
  const liEl = document.createElement("li");
  liEl.classList.add("bounceIn");
  liEl.innerHTML = `
  <span class="text">${todo}</span>
  <div class="options">
    <span id="check"><i class="fa fa-check"></i></span>
    <span id="edit"><i class="fa fa-edit"></i></span>
    <span id="trash"><i class="fa fa-trash"></i></span>
  </div>
  `;
  todoListContainer.appendChild(liEl);
}

function itemToDelete(item: any) {
  if (item.classList.contains("fa-trash") || item.id === "trash") {
    const todoLiEl = item.closest("li");
    todoLiEl.classList.remove("bounceIn");
    todoLiEl.classList.add("bounceOutDown");

    setTimeout(() => {
      todoLiEl.remove();
    }, 1000);

    deleteDataFromLocalStorage(item);
  }
}

function itemToEdit(item: any) {
  if (item.classList.contains("fa-edit") || item.id === "edit") {
    const todoLiEl = (item as HTMLInputElement).closest("li");
    todoInputEl.value = todoLiEl.textContent.trim();
    todoLiEl.remove();
    editItemFromLocalStorage(item);
  }
}

function itemDone(item: any) {
  if (item.classList.contains("fa-check") || item.id === "check") {
    const crossItem = item.closest("li");
    crossItem.firstElementChild.classList.add("completed");
    crossItem.classList.add("rotateOutDownLeft");
    crossItem.addEventListener("transitionend", () => {
      crossItem.remove();
    });
    deleteDataFromLocalStorage(item);
  }
}

// Local Storage Functions
function storeToLocalStorage(todo: any) {
  let todoArr;
  if (localStorage.getItem("todos") === null) {
    todoArr = [];
  } else {
    todoArr = JSON.parse(localStorage.getItem("todos"));
  }
  todoArr.push(todo);
  localStorage.setItem("todos", JSON.stringify(todoArr));
}

function displayDataFromLocalStorage() {
  let todoArr = JSON.parse(localStorage.getItem("todos"));

  for (const todo of todoArr) {
    displayTodoDOM(todo);
  }
}

function deleteDataFromLocalStorage(item: { closest: (arg0: string) => any }) {
  const todoArr = JSON.parse(localStorage.getItem("todos"));
  const todoLiEl = item.closest("li");
  const todoItemLeft = todoArr.filter(
    (todo: any) => todoLiEl.textContent.trim() !== todo
  );
  localStorage.setItem("todos", JSON.stringify(todoItemLeft));
}

function editItemFromLocalStorage(item: any) {
  deleteDataFromLocalStorage(item);
}

document.addEventListener("DOMContentLoad", displayDataFromLocalStorage);

todoListContainer.addEventListener("click", (e) => {
  itemToDelete(e.target as HTMLInputElement);
  itemToEdit(e.target as HTMLInputElement);
  itemDone(e.target as HTMLInputElement);
});

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputTodo = (todoInputEl as HTMLInputElement).value;
  if (!inputTodo) {
    alert("Please enter a Todo Item");
  } else {
    displayTodoDOM(inputTodo);
    storeToLocalStorage(inputTodo);
  }
  formEl.reset();
});
