import User from "./User";
import AuthService from "./AuthService";
import emitter from "./EventEmitter";

class AuthUI {
  constructor() {
    this.loginForm = document.getElementById("loginForm");
    this.authorized = document.getElementById("authorized");
    this.username = document.getElementById("username");
    this.password = document.getElementById("password");

    this.registrationForm = document.getElementById("registrationForm");
    this.userNickName = document.getElementById("userNickName");
    this.email = document.getElementById("email");
    this.registrationPassword = document.getElementById("registrationPassword");

    this.trelloIMG = document.getElementById("trello-img");

    this.logInBtn = document.getElementById("logInBtn");
    this.signUpBtn = document.getElementById("signUpBtn");

    this.logoutBtn = document.getElementById("logoutBtn");

    this.render = this.render.bind(this);
    this.registerListeners = this.registerListeners.bind(this);
    this.loginFormSubmit = this.loginFormSubmit.bind(this);

    this.onClickLoginBtn = this.onClickLoginBtn.bind(this);
    this.onClickSignUpBtn = this.onClickSignUpBtn.bind(this);

    this.onClickLogoutBtn = this.onClickLogoutBtn.bind(this);

    this.registerListeners();
  }

  render() {
    if (User.token) {
      this.registrationForm.classList.add("hide");
      this.trelloIMG.classList.add("hide");
      this.loginForm.classList.add("hide");
      this.logInBtn.classList.add("hide");
      this.signUpBtn.classList.add("hide");
      this.authorized.classList.remove("hide");
    } else {
      this.registrationForm.classList.add("hide");
      this.loginForm.classList.remove("hide");
      this.authorized.classList.add("hide");
      this.logInBtn.classList.remove("hide");
      this.logInBtn.classList.add("active");
      this.signUpBtn.classList.remove("hide");
      this.signUpBtn.classList.remove("active");
      this.trelloIMG.classList.remove("hide");
    }
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
    this.logInBtn.classList.toggle("active");
    this.signUpBtn.classList.toggle("active");

    this.loginForm.classList.remove("hide");
    this.registrationForm.classList.add("hide");
  }

  onClickSignUpBtn() {
    this.signUpBtn.classList.toggle("active");
    this.logInBtn.classList.toggle("active");

    this.registrationForm.classList.remove("hide");
    this.loginForm.classList.add("hide");
  }

  onClickLogoutBtn() {
    window.localStorage.removeItem("token");
    this.render();
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
  }
}

export default new AuthUI();
