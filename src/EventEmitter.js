class EventEmitter {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, listener) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(listener);
  }

  emit(eventName, payload) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((listener) => listener(payload));
    }
  }
}

export default new EventEmitter();
