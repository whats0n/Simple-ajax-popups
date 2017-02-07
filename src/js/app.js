import Modal from './_popup';

let modals = new Modal({
	controls: {
		open: '.js-modal-open',
		close: '.js-modal-close',
	},
	modal: {
		container: '.js-modal',
		inner: '.js-modal-inner',
		content: '.js-modal-info'
	}
});

modals.onOpen(() => {
	alert('ТЫ ОТКРЫЛ ПОПАП!!!!!!!');
});

modals.onClose(() => {
	alert('ТЫ ЗАКРЫЛ ПОПАП!!!!!!!');
});

modals.onLoaded((content) => {
	console.log(content);
});