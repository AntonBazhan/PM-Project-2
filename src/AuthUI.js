import User from "./User";
import AuthService from "./AuthService";
import emitter from "./EventEmitter";

class AuthUI {
  constructor() {
    this.createRefsElements();
    this.bindContext();
    this.registerListeners();
  }

  render() {
    if (User.token) {
      this.registrationForm.classList.add("hide");
      this.loginForm.classList.add("hide");
      this.logInBtn.classList.add("hide");
      this.signUpBtn.classList.add("hide");
      this.logoutBtn.classList.remove("hide");
      this.notAuthorized.classList.add("hide");
      this.showUserNickName.classList.remove("hide");
      this.trelloBoard.classList.remove("hide");
    } else {
      this.registrationForm.classList.add("hide");
      this.loginForm.classList.remove("hide");
      this.logInBtn.classList.remove("hide");
      this.logInBtn.classList.add("active");
      this.signUpBtn.classList.remove("hide");
      this.signUpBtn.classList.remove("active");
      this.logoutBtn.classList.add("hide");
      this.showUserNickName.classList.add("hide");
      this.trelloBoard.classList.add("hide");
    }
    // sorry about that -_-
    document.getElementsByClassName('popup__close')[0].click();
    document.getElementsByClassName('popup__close')[1].click();
  }

  renderUserName(username) {
    this.showUserNickName.innerHTML = `Hello, ${username}!`;
  }

  loginFormSubmit(e) {
    e.preventDefault();

    AuthService.login({
      username: this.username.value,
      password: this.password.value,
    });
  }
  
  registrationFormSubmit(e) {
    e.preventDefault();
    
    AuthService.register({
      userNickName: this.userNickName.value,
      email: this.email.value,
      registrationPassword: this.registrationPassword.value,
    });
  }

  onClickLoginBtn() {
    this.logInBtn.classList.add("active");
    this.signUpBtn.classList.remove("active");

    this.loginForm.classList.remove("hide");
    this.registrationForm.classList.add("hide");
  }

  onClickSignUpBtn() {
    this.signUpBtn.classList.add("active");
    this.logInBtn.classList.remove("active");

    this.registrationForm.classList.remove("hide");
    this.loginForm.classList.add("hide");
  }

  onClickLogoutBtn() {
    window.localStorage.removeItem("token");
    emitter.emit("logout");
  }

  toggleNotAuthorizedBlock() {
    this.notAuthorized.classList.remove("hide");
  }

  registerListeners() {
    this.loginForm.addEventListener("submit", this.loginFormSubmit);

    this.registrationForm.addEventListener(
      "submit",
      this.registrationFormSubmit
    );

    this.logInBtn.addEventListener("click", this.onClickLoginBtn);

    this.signUpBtn.addEventListener("click", this.onClickSignUpBtn);

    this.logoutBtn.addEventListener("click", this.onClickLogoutBtn);

    emitter.subscribe("loggedIn", this.render);
    emitter.subscribe("unauthorizedRequest", this.render);
    emitter.subscribe("logout", this.render);
    emitter.subscribe("notAuthorized", this.toggleNotAuthorizedBlock);
    emitter.subscribe("loggedIn", (username) => {
      this.renderUserName(username);
    });
    emitter.subscribe("userAlreadyExist", () => {
      this.registrationWarning.innerHTML = "Email already is used";
    });
  }

  createRefsElements() {
    this.loginForm = document.getElementById("loginForm");
    this.username = document.getElementById("username");
    this.password = document.getElementById("password");

    this.showUserNickName = document.getElementById("showUserNickName");
    this.registrationWarning = document.getElementById("registrationWarning");

    this.trelloBoard = document.getElementById('trelloBoard');

    this.registrationForm = document.getElementById("registrationForm");
    this.userNickName = document.getElementById("userNickName");
    this.email = document.getElementById("email");
    this.registrationPassword = document.getElementById("registrationPassword");

    this.logInBtn = document.getElementById("logInBtn");
    this.signUpBtn = document.getElementById("signUpBtn");

    this.logoutBtn = document.getElementById("logoutBtn");

    this.notAuthorized = document.getElementById("notAuthorized");
  }

  bindContext() {
    this.render = this.render.bind(this);
    this.registerListeners = this.registerListeners.bind(this);
    this.loginFormSubmit = this.loginFormSubmit.bind(this);

    this.onClickLoginBtn = this.onClickLoginBtn.bind(this);
    this.onClickSignUpBtn = this.onClickSignUpBtn.bind(this);

    this.onClickLogoutBtn = this.onClickLogoutBtn.bind(this);

    this.toggleNotAuthorizedBlock = this.toggleNotAuthorizedBlock.bind(this);
  }
}

export default new AuthUI();
