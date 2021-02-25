import HttpService from './HttpService';

const cardsPath = '/cards';
const statusesPath = '/statuses';

export default class TrelloService {
  static async getCards() {
    return HttpService.makeRequest({ path: cardsPath });
  }
  
  static async getCardInfo(id) {
    return HttpService.makeRequest({ path: cardsPath + `/${id}` });
  }
  
  static async createCard(card) {
    return HttpService.makeRequest({
      path: cardsPath,
      method: 'POST',
      body: card,
    });
  }

  static async updateCard(card) {
    return HttpService.makeRequest({
      path: `${cardsPath}/${card.id}`,
      method: 'PUT',
      body: card,
    });
  }

  static async deleteCard(id) {
    return HttpService.makeRequest({
      path: `${cardsPath}/${id}`,
      method: 'DELETE',
    });
  }

  static async getStatuses() {
    return HttpService.makeRequest({ path: statusesPath });
  }
}
