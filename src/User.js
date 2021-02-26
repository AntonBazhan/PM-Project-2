export default class User {
  static get token() {
    return window.localStorage.getItem('token');
  }

  static set token(value) {
    window.localStorage.setItem('token', value);
  }
  
  static get username() {
    return window.localStorage.getItem('username');
  }

  static set username(value) {
    window.localStorage.setItem('username', value);
  }
}
