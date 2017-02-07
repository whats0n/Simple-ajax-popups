//CLOSEST POLYFILL
(function(ELEMENT) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
        if (!this) return null;
        if (this.matches(selector)) return this;
        if (!this.parentElement) {return null}
        else return this.parentElement.closest(selector)
      };
}(Element.prototype));

export default class Modal {

	constructor(props) {
		this._props = props;
		this._modalOpened = false;
		this._currentModal = null;
		this._currentTarget = null;
		this._modalOpen = document.querySelectorAll(props.buttonOpen);
		this._body = document.querySelector('body');
		this._close = this._close.bind(this);
		this.init();
	}

	init() {
		this._toggleOnButtonOpenClick(this._modalOpen);
		if (this._props.closeOnOutSide) this._closeOnOutSideClick();
	}

	_each(elements, func) {
		Array.prototype.forEach.call(elements, func);
	}

	_toggleOnButtonOpenClick(elements) {
		this._each(elements, el => {
			el.addEventListener('click', () => {
				let file = el.getAttribute('data-file');
				let target = el.getAttribute('data-target');
				if (!this._modalOpened) {
					this._open(file, target);
				} else {
					let callbackOnClose = null;
					if (target != this._currentTarget) callbackOnClose = () => this._open(file, target);
					this._close(callbackOnClose);
				}
			});
		});
	}

	_closeOnButtonCloseClick() {
		let buttons = this._body.querySelectorAll(this._props.buttonClose);
		this._each(buttons, el => {
			el.addEventListener('click', this._close, false);
		});
	}

	_closeOnOutSideClick() {
		document.addEventListener('click', e => {
			let target = e.target;
			let props = this._props;
			if (target.closest(props.inner)) return false;
			if (target.closest(props.buttonClose)) return false;
			if (target.closest(props.buttonOpen)) return false;
			this._close();
		}, false);
	}

	_open(file, target) {
		this._modalOpened = true;
		this._currentTarget = target;
		this._ajax(file, (data) => {
			let div = document.createElement('div');
			div.innerHTML = data;
			this._currentModal = div.querySelector(`${this._props.container}[data-modal="${target}"]`);
			this._body.appendChild(this._currentModal);
			let buttonOpen = this._currentModal.querySelectorAll(this._props.buttonOpen);
			this._closeOnButtonCloseClick();
			this._toggleOnButtonOpenClick(buttonOpen);
			setTimeout(() => this._currentModal.classList.add('is-open'), 100);
		});
	}

	_findTransition(el) {

		let styles = getComputedStyle(el);
		let duration = styles.transitionDuration;
		let msDuration = styles.msTransitionDuration;

		if (duration) {
			return this._checkTransitionDuration(duration);
		} else if (msDuration) {
			return this._checkTransitionDuration(msDuration);
		}

		return false;

	}

	_checkTransitionDuration(duration) {
		let listOfDurations = duration.split(',');
		for (let i = 0; i < listOfDurations.length; i++) {
			if (parseFloat(listOfDurations[i]) == 0) return false;
		}
		return true;
	}

	_close(callback) {
		if (!this._currentModal) return;
		this._currentModal.classList.remove('is-open');
		let callbacks = () => {
			this._body.removeChild(this._currentModal);
			this._modalOpened = false;
			if (callback) callback();
			this._currentModal = null;
		};
		if (this._findTransition(this._currentModal)) {
			this._currentModal.addEventListener('transitionend', () => {
				callbacks();
			}, false);
		} else {
			callbacks();
		}
	}

	_ajax(file, callback) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', file, true);
		xhr.send();
		xhr.onload = () => {
			if (xhr.status === 200) {
				callback(xhr.responseText);
			}
		};
	}

}