import authUI from "./AuthUI";
import TrelloUI from "./TrelloUI";

export default class TrelloApp {
  static init() {
    authUI.render();
    TrelloUI.render();
  }
}
