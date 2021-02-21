import User from "./User";
import HttpService from "./HttpService";
import emitter from "./EventEmitter";

export default class AuthService {
  static async login({ username, password }) {
    HttpService.request({
      method: "POST",
      path: "/auth/local",
      body: {
        identifier: username,
        password,
      },
    }).then((data) => {
      if (data.statusCode === 200) {
        User.token = data.jwt;
        emitter.emit("loggedIn");
      } else {
        console.log("wrong login or password");
      }
    });
  }

  static async register({
    userNickName: username,
    email,
    registrationPassword: password,
  }) {
    HttpService.request({
      method: "POST",
      path: "/auth/local/register",
      body: {
        username,
        email,
        password,
      },
    }).then((data) => {
      User.token = data.jwt;
      emitter.emit("loggedIn");
    });
  }
}
