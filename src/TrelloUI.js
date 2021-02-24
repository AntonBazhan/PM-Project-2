import emitter from './EventEmitter';
import User from './User';
import TrelloService from './TrelloService';

class TrelloUI {
    constructor() {
        this.trelloBoard = document.getElementById('trelloBoard');

        let lists = document.getElementsByClassName('list-content'); // TODO: should be generated dynamically
        this.cardLists = [];
        for (const cardList of lists) {
            this.cardLists[cardList.getAttribute('data-status')] = cardList;
        }

        // form data
        this.cardForm = document.getElementById('cardForm'); // form for adding cards
        this.addCardButtons = document.getElementsByClassName('list-new-card');
        this.cardId = document.getElementById('cardId');
        this.oldCardStatus = document.getElementById('oldCardStatus');
        this.cardTitle = document.getElementById('cardTitle');
        this.cardDescription = document.getElementById('cardDescription');
        this.cardStatus = document.getElementById('cardStatus');
        this.showModal = this.showModal.bind(this);
        this.modalCloseBtn = document.getElementById('close-dialog'); // for modal

        this.render = this.render.bind(this);
        this.registerListeners = this.registerListeners.bind(this);

        this.getCards = this.getCards.bind(this);
        this.createCardElement = this.createCardElement.bind(this);
        this.addNewCard = this.addNewCard.bind(this);
        this.showCardForm = this.showCardForm.bind(this);
        this.editCard = this.editCard.bind(this);
        this.editCardForm = this.editCardForm.bind(this);

        this.getCards();
        this.showColumns();
        this.registerListeners();
    }

    getCards() {
        return TrelloService.getCards().then((response) => {
            if (response.status == 200 || response.status == 201) {
                if (response.response) {
                    response.response.forEach(this.createCardElement)
                }
            }
        });
    }

    createCardElement({ title, description, status, id }) {
        const dragStart = ev => {
            ev.dataTransfer.setData("text/plain", ev.target.id);

            for (const key in this.cardLists) {
                this.cardLists[key].classList.add('bordered');
                this.cardLists[key].classList.add('dim');
                document.getElementById('background').classList.remove('hide');
            }
        }

        const cardElement = document.createElement('div');
        cardElement.id = 'card' + id;
        cardElement.classList.add('card');
        cardElement.draggable = true;
        cardElement.setAttribute('data-description', description);
        cardElement.addEventListener('dragstart', dragStart);
        cardElement.addEventListener('click', this.editCardForm);
        cardElement.innerHTML = title;

        this.cardLists[status].append(cardElement);
    }

    showColumns() {
        const allowDrop = ev => {
            ev.preventDefault()

            if (!ev.target.classList.contains('card')) {
                ev.target.classList.add('alerts-border');
            } else {
                ev.target.parentElement.classList.add('alerts-border');
            }
        }

        const dragLeave = ev => {
            ev.preventDefault()

            if (!ev.target.classList.contains('card')) {
                ev.target.classList.remove('alerts-border');
            } else {
                ev.target.parentElement.classList.remove('alerts-border');
            }
        }

        const dragEnd = ev => {
            ev.preventDefault();

            for (const key in this.cardLists) {
                this.cardLists[key].classList.remove('bordered');
                this.cardLists[key].classList.remove('alerts-border');
                this.cardLists[key].classList.remove('dim');
                document.getElementById('background').classList.add('hide');
            }
        }

        const dropEvent = ev => {
            ev.preventDefault()

            for (const key in this.cardLists) {
                this.cardLists[key].classList.remove('bordered');
                this.cardLists[key].classList.remove('alerts-border');
                this.cardLists[key].classList.remove('dim');
                document.getElementById('background').classList.add('hide');
            }

            let sourceId = ev.dataTransfer.getData("text/plain");
            let sourceIdEl = document.getElementById(sourceId);
            let sourceIdParentEl = sourceIdEl.parentElement;
            let targetEl = ev.target;

            if (targetEl.classList.contains('card')) {
                targetEl = targetEl.parentElement;
            }
            let targetParentEl = targetEl?.parentElement;
            let cardId = sourceId.replace('card', '');
            let oldStatus = sourceIdParentEl.getAttribute('data-status');
            let newStatus = targetEl.getAttribute('data-status');

            if (targetParentEl && targetParentEl.id !== sourceIdParentEl.id) {
                targetEl.appendChild(sourceIdEl)
            } else {
                let holder = targetEl
                let holderText = holder.textContent
                targetEl.textContent = holderText
                holderText = ''
            }

            if (newStatus && oldStatus !== newStatus) {
                this.updateCard({ id: cardId, status: newStatus, oldStatus: oldStatus });
            }
        }

        for (const key in this.cardLists) {
            this.cardLists[key].innerHTML = '';
            this.cardLists[key].addEventListener('dragover', allowDrop);
            this.cardLists[key].addEventListener('dragleave', dragLeave);
            this.cardLists[key].addEventListener('drop', dropEvent);
            this.cardLists[key].addEventListener('dragend', dragEnd);
        }
    }

    showCardForm(e) {
        e.preventDefault();
        let status = e.target.previousElementSibling.getAttribute('data-status');

        this.showModal(status);
    }

    addNewCard(e) {
        e.preventDefault();

        if (this.cardId.value == -1) {
            return TrelloService.createCard({
                title: this.cardTitle.value,
                description: this.cardDescription.value,
                status: this.cardStatus.value,
            })
                .then((response) => {
                    if (response.status == 200 && response.response) {
                        this.createCardElement(response.response);
                        this.hideModal();
                    }
                })
                .catch(console.log);
        }
        // else :)
        return TrelloService.updateCard({
            id: this.cardId.value,
            title: this.cardTitle.value,
            description: this.cardDescription.value,
            status: this.cardStatus.value,
        }).then((response) => {
            if (response.status !== 200) {
                console.warn('error', error, card);
            } else if (response.status == 200 && response.response) {
                if (this.oldCardStatus.value != -1 && this.oldCardStatus.value !== this.cardStatus.value) {
                    this.moveCard(this.cardId.value, this.cardStatus.value);
                }
                this.editCard(response.response)
            }

            this.hideModal();
        }).catch(error => {
            console.warn('error', error);
        });
    }

    editCardForm(e) {
        let id = e.target.id.replace('card', '');
        let status = e.target.parentElement.getAttribute('data-status');
        let title = e.target.innerText;
        let description = e.target.getAttribute('data-description');

        this.showModal(status, 'edit', { title: title, description: description, id: id });
    }

    editCard(card) {
        let cardEl = document.getElementById('card' + card.id);

        if (cardEl) {
            cardEl.innerText = card.title;
            cardEl.setAttribute('data-status', card.status);
            cardEl.setAttribute('data-description', card.description);
        }
    }

    deleteCard(id) {
        return TrelloService.deleteCard(id);
    }

    updateCard(card) {
        TrelloService.updateCard(card).then((response) => {
            if (response.status !== 200) {
                console.warn('error', error, card);
                this.moveCard(card.id, card.oldStatus);
            }
        }).catch(error => {
            console.warn('error', error, card);
            this.moveCard(card.id, card.oldStatus);
        });
    }

    // move card from 1 column to another
    moveCard(id, destination) {
        let card = document.getElementById('card' + id);
        this.cardLists[destination].insertAdjacentElement('beforeEnd', card);
    }

    showModal(status = 'to_do', type = 'create', card = {}) {
        document.getElementById('cookiesPopup').classList.remove('hide');

        this.cardId.value = card?.id ?? -1;
        this.oldCardStatus.value = status ?? -1;
        this.cardTitle.value = card?.title ?? '';
        this.cardDescription.value = card?.description ?? '';
        this.cardStatus.value = status ?? card?.status;
    }

    hideModal() {
        document.getElementById('cookiesPopup').classList.add('hide');
    }

    render() {
        if (User.token) {
            this.trelloBoard.classList.remove('hide');
        } else {
            this.trelloBoard.classList.add('hide');
            this.hideModal();
        }
    }

    registerListeners() {
        emitter.subscribe('loggedIn', () => {
            this.getCards();
            this.render();
        });

        emitter.subscribe('unauthorizedRequest', this.render);

        for (const button of this.addCardButtons) {
            button.addEventListener('click', this.showCardForm)
        }

        this.modalCloseBtn.addEventListener('click', this.hideModal);
        this.cardForm.addEventListener('submit', this.addNewCard);
    }
}

export default new TrelloUI();