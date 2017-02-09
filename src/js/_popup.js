export default (function () {

	//CLOSEST POLYFILL Start
	(function(ELEMENT) {
	    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
	    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
	        if (!this) return null;
	        if (this.matches(selector)) return this;
	        if (!this.parentElement) {return null}
	        else return this.parentElement.closest(selector)
	      };
	}(Element.prototype));
	//CLOSEST POLYFILL End

	//helpers start
	let each = (elements, func) => {
		Array.prototype.forEach.call(elements, func);
	};

	let getFileHTML = (file, callback) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', file, true);
		xhr.send();
		xhr.onload = () => {
			if (xhr.status === 200) {
				callback(xhr.responseText);
			}
		};
	};
	//helpers end
	const OPEN = 'is-open';

	class Modal {

		constructor(props) {

			this._props = props;
			this._opened = false;
			this._currentTarget = null;
			this._currentFile = null;
			this._onOpenCallbacks = [];
			this._onCloseCallbacks = [];
			this._onLoadedCallbacks = [];

			this._findModalElements = this._findModalElements.bind(this);

			this._init();
		}

		_init() {
			let buttonsOpen = document.querySelectorAll(this._props.controls.open);
			let buttonsClose = document.querySelectorAll(this._props.controls.close);
			this._findModalElements();
			this._toggleOnButtonOpenClick(buttonsOpen);
			this._closeOnButtonCloseClick(buttonsClose);
			this._closeOnOutsideClick();
		}

		_findModalElements() {
			let doc = document;
			this._modal = {
				container: doc.querySelector(this._props.modal.container),
				inner: doc.querySelector(this._props.modal.inner),
				content: doc.querySelector(this._props.modal.content),
				close: doc.querySelectorAll(this._props.controls.close)
			};
		}

		_toggleOnButtonOpenClick(elements) {
			each(elements, button => button.addEventListener('click', e => {
				e.preventDefault();
				this._openOnButtonClick(button);
			}, false));
		}

		_closeOnButtonCloseClick(elements) {
			each(elements, button => button.addEventListener('click', e => {
				e.preventDefault();
				this._close();
			}, false));
		}

		_closeOnOutsideClick() {
			document.addEventListener('click', e => {
				if (!this._opened) return;
				let target = e.target;
				if (target.closest(this._props.controls.close)) return;
				if (target.closest(this._props.controls.open)) return;
				if (target.closest(this._props.modal.inner)) return;
				e.preventDefault();
				this._close();
			}, false);
		}

		_openOnButtonClick(button) {
			let file = button.getAttribute('data-file');
			let target = button.getAttribute('data-target');

			if (this._opened && file === this._currentFile && target === this._currentTarget) {
				this._close();
				return;
			}

			if (file === this._currentFile && target === this._currentTarget) {
				this._open();
				return;
			}

			getFileHTML(file, (data) => {
				//Making the code from the received data.
				let div = document.createElement('div');
				div.innerHTML = data;
				//Find the content and place it into the modal.
				let content = div.querySelector(`[data-modal="${target}"]`).innerHTML;
				this._modal.content.innerHTML = content;
				//Caching the current element id.
				this._currentTarget = target;
				this._currentFile = file;
				if (!this._opened) this._open();
				this._onLoaded(this._modal.content);
				//Add events on inner elements
				let buttonsOpen = this._modal.content.querySelectorAll(this._props.controls.open);
				let buttonsClose = this._modal.content.querySelectorAll(this._props.controls.close);
				this._toggleOnButtonOpenClick(buttonsOpen);
				this._closeOnButtonCloseClick(buttonsClose);
			});
		}

		_open() {
			this._opened = true;
			this._modal.container.classList.add(OPEN);
			if (!this._onOpenCallbacks.length) return;
			this._onOpenCallbacks.forEach(callback => {if (typeof callback == 'function') callback()});
		}

		_close() {
			this._opened = false;
			this._modal.container.classList.remove(OPEN);
			if (!this._onCloseCallbacks.length) return;
			this._onCloseCallbacks.forEach(callback => {if (typeof callback == 'function') callback()});
		}

		_onLoaded(content) {
			if (!this._onLoadedCallbacks.length) return;
			this._onLoadedCallbacks.forEach(callback => {if (typeof callback == 'function') callback(content)});
		}

		onOpen(callback) {
			this._onOpenCallbacks.push(callback);
		}

		onClose(callback) {
			this._onCloseCallbacks.push(callback);
		}

		onLoaded(callback) {
			this._onLoadedCallbacks.push(callback);
		}

	}

	return Modal;
})();