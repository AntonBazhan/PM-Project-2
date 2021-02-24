import HttpService from './HttpService';

const cardsPath = '/cards';

export default class TrelloService {
  static async getCards() {
    return HttpService.makeRequest({ path: cardsPath });
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
}
