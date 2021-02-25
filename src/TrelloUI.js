import emitter from './EventEmitter';
import User from './User';
import TrelloService from './TrelloService';

class TrelloUI {
    constructor() {
        this.trelloBoard = document.getElementById('trelloBoard');
        this.cardListContainer = document.getElementById('cardListContainer');

        // let lists = document.getElementsByClassName('list-content'); // TODO: should be generated dynamically
        this.cardLists = [];
        /* for (const cardList of lists) {
            this.cardLists[cardList.getAttribute('data-status')] = cardList;
        } */

        // form data
        this.cardForm = document.getElementById('cardForm'); // form for adding cards
        this.deleteButton = document.getElementById('deleteButton'); // form for adding cards
        this.addCardButtons = document.getElementsByClassName('list-new-card');
        this.cardId = document.getElementById('cardId');
        this.oldCardStatus = document.getElementById('oldCardStatus');
        this.cardTitle = document.getElementById('cardTitle');
        this.cardDescription = document.getElementById('cardDescription');
        this.cardStatus = document.getElementById('cardStatus');
        this.modalCloseBtn = document.getElementById('close-dialog'); // for modal

        this.render = this.render.bind(this);
        this.registerListeners = this.registerListeners.bind(this);

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);

        this.getStatuses = this.getStatuses.bind(this);
        this.getCards = this.getCards.bind(this);
        this.getCardInfo = this.getCardInfo.bind(this);
        this.editCard = this.editCard.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
        this.createCardElement = this.createCardElement.bind(this);
        this.addNewCard = this.addNewCard.bind(this);
        this.showCardForm = this.showCardForm.bind(this);
        this.editCardForm = this.editCardForm.bind(this);
        this.deleteCardFromUI = this.deleteCardFromUI.bind(this);
        this.createCardColumn = this.createCardColumn.bind(this);

        this.getStatuses();
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

    createCardElement({ title, status, id }) {
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
        cardElement.addEventListener('dragstart', dragStart);
        cardElement.addEventListener('click', this.editCardForm);
        cardElement.innerHTML = title;

        this.cardLists[status].append(cardElement);
    }

    getStatuses() {
        return TrelloService.getStatuses().then((response) => {
            if (response.status == 200 || response.status == 201) {
                if (response.response) {
                    /*
                    тут можно симитировать ответ сервера, когда колонки имеют другое название, например
                    here you can simulate the server's response where the new titles are shown :)
                    let statuses = [
                        { "id": 1, "title": "Сделать", "value": "to_do", "published_at": "2021-02-17T06:41:12.627Z", "created_at": "2021-02-17T06:41:09.433Z", "updated_at": "2021-02-17T06:41:12.646Z" },
                        { "id": 2, "title": "В процессе", "value": "in_progress", "published_at": "2021-02-17T06:41:28.539Z", "created_at": "2021-02-17T06:41:27.476Z", "updated_at": "2021-02-17T06:41:28.558Z" },
                        { "id": 3, "title": "Тестируем", "value": "testing", "published_at": "2021-02-17T06:41:39.633Z", "created_at": "2021-02-17T06:41:38.438Z", "updated_at": "2021-02-17T06:41:39.653Z" },
                        { "id": 4, "title": "Сделано", "value": "done", "published_at": "2021-02-17T06:41:47.808Z", "created_at": "2021-02-17T06:41:46.824Z", "updated_at": "2021-02-17T06:41:47.826Z" }
                    ];
                    statuses.forEach(this.createCardColumn); */
                    response.response.forEach(this.createCardColumn);
                    
                    // т.к. это в цикле нету асинхронных операций, карточки будут риквеститься после построения колонок
                    this.getCards();
                }
            }
        });
    }

    createCardColumn({ id, title, value }) {
        console.log('creating column', id, title);

        const highlightBorders = () => {
            for (const key in this.cardLists) {
                this.cardLists[key].classList.remove('bordered');
                this.cardLists[key].classList.remove('alerts-border');
                this.cardLists[key].classList.remove('dim');
                document.getElementById('background').classList.add('hide');
            }
        }

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

            highlightBorders();
        }

        const dropEvent = ev => {
            ev.preventDefault()

            highlightBorders();

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

        // creating el in UI
        const columnElement = document.createElement('div');
        columnElement.id = 'list' + id;
        columnElement.classList.add('board-list');

        const columnTitle = document.createElement('div');
        columnTitle.classList.add('list-title');
        columnTitle.innerText = title;

        const columnContent = document.createElement('div');
        columnContent.classList.add('list-content');
        columnContent.setAttribute('data-status', value);

        const columnFooter = document.createElement('div');
        columnFooter.classList.add('list-new-card');
        columnFooter.innerText = "+ Add new card";
        columnFooter.addEventListener('click', this.showCardForm)

        columnElement.append(columnTitle);
        columnElement.append(columnContent);
        columnElement.append(columnFooter);

        cardListContainer.append(columnElement);

        this.cardLists[value] = columnContent;
        this.cardLists[value].addEventListener('dragover', allowDrop);
        this.cardLists[value].addEventListener('dragleave', dragLeave);
        this.cardLists[value].addEventListener('drop', dropEvent);
        this.cardLists[value].addEventListener('dragend', dragEnd);
    }

    showCardForm(e) {
        e.preventDefault();
        let status = e.target.previousElementSibling.getAttribute('data-status');

        this.showModal({ status: status });
    }

    addNewCard(e) {
        e.preventDefault();

        if (!this.cardTitle.value || this.cardTitle.value === '' || !this.cardStatus.value || this.cardStatus.value === '') {
            alert('Please enter the title/select status -_-')
            return;
        }

        // использую == чтобы не приводить -1 к числу при строгом сравнении (===)
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
                alert(response?.response?.message ?? 'ERORR');
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
        this.getCardInfo(id);
    }

    editCard(card) {
        let cardEl = document.getElementById('card' + card.id);

        if (cardEl) {
            cardEl.innerText = card.title;
            cardEl.setAttribute('data-status', card.status);
        }
    }

    deleteCard(ev) {
        ev.preventDefault();

        let id = ev.target?.getAttribute('data-id');

        if (id) {
            if (confirm('Are you sure you want to remove the card #' + id + '?')) {
                return TrelloService.deleteCard(id).then((response) => {
                    if (response.status !== 200) {
                        alert(response?.response?.message ?? 'ERORR');
                    } else if (response.status == 200 && response.response) {
                        this.deleteCardFromUI(id);
                    }
                    this.hideModal();
                }).catch(error => {
                    console.warn('error', error);
                });
            }
        } else {
            console.warn('Can\'t get the ID of the card -_-');
            return;
        }
    }

    deleteCardFromUI(id) {
        document.getElementById('card' + id)?.remove();
    }

    updateCard(card) {
        TrelloService.updateCard(card).then((response) => {
            if (response.status !== 200) {
                console.warn('error', error, card);
                this.moveCard(card.id, card.oldStatus);
            }
        }).catch(error => {
            this.moveCard(card.id, card.oldStatus);
        });
    }

    // move card from 1 column to another
    moveCard(id, destination) {
        let card = document.getElementById('card' + id);
        this.cardLists[destination].insertAdjacentElement('beforeEnd', card);
    }

    getCardInfo(id) {
        return TrelloService.getCardInfo(id).then((response) => {
            if (response.status == 200 || response.status == 201) {
                if (response.response) {
                    this.showModal(response.response);
                }
            } else {
                alert(response?.response?.message ?? 'ERORR');
                this.deleteCardFromUI(id);
            }
        }).catch(e => {
            console.log('error', e)
        });
    }

    showModal(card = {}) {
        document.getElementById('cookiesPopup').classList.remove('hide');
        document.getElementById('background').classList.remove('hide');

        this.cardId.value = card?.id ?? -1;
        this.oldCardStatus.value = card?.status ?? -1;
        this.cardTitle.value = card?.title ?? '';
        this.cardDescription.value = card?.description ?? '';
        this.cardStatus.value = card?.status ?? 'to_do';
        this.deleteButton.setAttribute('data-id', card?.id ?? -1);

        if (!card?.id) {
            this.deleteButton.classList.add('hide');
        } else {
            this.deleteButton.classList.remove('hide');
        }

        this.cardTitle.focus();
    }

    hideModal() {
        document.getElementById('cookiesPopup').classList.add('hide');
        document.getElementById('background').classList.add('hide');
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
            this.getStatuses();
            this.render();
        });

        emitter.subscribe('unauthorizedRequest', this.render);

        this.modalCloseBtn.addEventListener('click', this.hideModal);
        this.cardForm.addEventListener('submit', this.addNewCard);
        this.deleteButton.addEventListener('click', this.deleteCard);
    }
}

export default new TrelloUI();