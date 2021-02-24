import { END_POINT } from './config';
import User from './User';
import emitter from './EventEmitter';
import AuthService from './AuthService';

export default class HttpService {
  static async makeRequest({ method = 'GET', path, body }) {
    const url = `${END_POINT}${path}`;

    var response;

    let promise = new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();

      request.open(method, url, true);

      if (method !== 'GET') {
        request.setRequestHeader("Content-type", "application/json; charset=utf-8");
      }

      if (User.token) {
        request.setRequestHeader('Authorization', 'Bearer ' + User.token);
      }

      request.addEventListener("readystatechange", () => {
        if (request.readyState === 4) {
          if ([401, 403].includes(request.status)) {
            User.token = '';
            emitter.emit('unauthorizedRequest');
            throw new Error('Unauthorized');
          }

          // сразу пробуем конвертируем в JSON
          try {
            resolve({ status: request.status, response: JSON.parse(request.response) });
          } catch (ex) {
            resolve({ status: request.status, response: request.response });
          }
        }
      });

      request.onerror = function (e) {
        console.log('ERROR: ' + url);
        console.log(e);
        reject('There\'s error');
      }

      if (body != '') {
        body = JSON.stringify(body);
        request.send(body);
      } else {
        try {
          request.send();
        } catch (ex) {
          console.log('error:', ex);
          return;
        }
      }
    });

    response = await promise;

    return response;
  }
}