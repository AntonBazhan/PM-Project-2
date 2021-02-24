import User from "./User";
import HttpService from "./HttpService";
import emitter from "./EventEmitter";

export default class AuthService {
  static async login({ username, password }) {
    HttpService.makeRequest({
      method: "POST",
      path: "/auth/local",
      body: {
        identifier: username,
        password,
      },
    }).then((response) => {
      if (response.status == 200) {
        User.token = response.response?.jwt ?? '';
      }
      
      if (User.token) {
        emitter.emit("loggedIn");
      } else {
        emitter.emit("notAuthorized");
      }
    });
  }

  static async register({
    userNickName: username,
    email,
    registrationPassword: password,
  }) {
    HttpService.makeRequest({
      method: "POST",
      path: "/auth/local/register",
      body: {
        username,
        email,
        password,
      },
    }).then((data) => {
      if (data.jwt) {
        User.token = data.jwt;
        emitter.emit("loggedIn");
      } else {
        emitter.emit("notAuthorized");
      }
    });
  }
}
