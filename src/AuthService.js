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
    }).then((data) => {
      if (data.status == 200) {
        User.token = data.response?.jwt ?? "";
      }

      if (User.token) {
        emitter.emit("loggedIn", data.response.user.username);
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
      if (data.status == 200) {
        User.token = data.response?.jwt ?? '';
      }
      
      if (User.token) {
        emitter.emit("loggedIn", data.response.user.username);
      } else if (data.status === 400) {
        emitter.emit("userAlreadyExist");
      } else {
        emitter.emit("notAuthorized");
      }
    });
  }
}
