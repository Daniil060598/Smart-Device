// ---------------------------------

window.addEventListener('DOMContentLoaded', () => {
  const SELECTORS = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([aria-hidden])',
    'textarea:not([disabled]):not([aria-hidden])',
    'button:not([disabled]):not([aria-hidden])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])'
  ];
  const productTitleElement = document.querySelector('.products__title');
  const mainScreenButtonElement = document.querySelector('.main-screen__button');
  const breakpoint = window.matchMedia('(max-width:767px)');
  const form = document.querySelector('.form');

  // Utils
  // ---------------------------------
  // focus-lock
  class FocusLock {
    constructor() {
      this._lockedSelector = null;
      this._focusableElements = null;
      this._endElement = null;
      this._selectors = SELECTORS;

      this._documentKeydownHandler = this._documentKeydownHandler.bind(this);
    }

    _documentKeydownHandler(evt) {
      const activeElement = document.activeElement;
      if (evt.key === 'Tab') {
        if (!this._focusableElements.length) {
          evt.preventDefault();
          activeElement.blur();
          return;
        }
        if (this._focusableElements.length === 1) {
          evt.preventDefault();
          this._focusableElements[0].focus();
          return;
        }
        if (this._focusableElements.length > 1 && !activeElement.closest(this._lockedSelector)) {
          evt.preventDefault();
          this._focusableElements[0].focus();
          return;
        }
      }
      if (evt.key === 'Tab' && !evt.shiftKey && activeElement === this._focusableElements[this._focusableElements.length - 1]) {
        evt.preventDefault();
        this._focusableElements[0].focus();
      }
      if (evt.key === 'Tab' && evt.shiftKey && activeElement === this._focusableElements[0]) {
        evt.preventDefault();
        this._focusableElements[this._focusableElements.length - 1].focus();
      }
    }

    lock(lockedSelector, startFocus = true) {
      this.unlock();
      this._lockedSelector = lockedSelector;
      const lockedElement = document.querySelector(this._lockedSelector);
      if (!lockedElement) {
        return;
      }
      this._focusableElements = lockedElement.querySelectorAll(this._selectors);
      this._endElement = document.activeElement;
      const startElement = lockedElement.querySelector('[data-focus]') || this._focusableElements[0];
      if (this._endElement) {
        this._endElement.blur();
      }
      if (startElement && startFocus) {
        startElement.focus();
      }
      document.addEventListener('keydown', this._documentKeydownHandler);
    }

    unlock(returnFocus = true) {
      if (this._endElement && returnFocus) {
        this._endElement.focus();
      }
      this._lockedSelector = null;
      this._focusableElements = null;
      this._endElement = null;
      document.removeEventListener('keydown', this._documentKeydownHandler);
    }
  }

  window.focusLock = new FocusLock();

  // ios-checker
  const iosChecker = () => {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  };

  // scroll-lock
  class ScrollLock {
    constructor() {
      this._iosChecker = iosChecker;
      this._lockClass = this._iosChecker() ? 'scroll-lock-ios' : 'scroll-lock';
      this._scrollTop = null;
      this._fixedBlockElements = document.querySelectorAll('[data-fix-block]');
    }

    _getScrollbarWidth() {
      return window.innerWidth - document.documentElement.clientWidth;
    }

    _getBodyScrollTop() {
      return (
        self.pageYOffset ||
        (document.documentElement && document.documentElement.ScrollTop) ||
        (document.body && document.body.scrollTop)
      );
    }

    disableScrolling() {
      document.body.classList.add(this._lockClass);

      const observer = new MutationObserver(() => {
        let inDom = document.body.contains(document.querySelector('.modal.is-active'));
        if (!inDom) {
          document.body.classList.remove(this._lockClass);
        }
      });
      observer.observe(document.body, {childList: true, subtree: true});
    }

    enableScrolling() {
      document.body.classList.remove(this._lockClass);
    }
  }

  window.scrollLock = new ScrollLock();


  // Modules
  // Modals
  class Modals {
    constructor(settings = {}) {
      this._scrollLock = new ScrollLock();
      this._focusLock = new FocusLock();

      this._modalOpenElements = document.querySelectorAll('[data-open-modal]');
      this._openedModalElement = null;
      this._modalName = null;
      this._enableScrolling = true;
      this._settingKey = 'default';

      this._settings = settings;
      this._preventDefault = this._settings[this._settingKey].preventDefault;
      this._stopPlay = this._settings[this._settingKey].stopPlay;
      this._lockFocus = this._settings[this._settingKey].lockFocus;
      this._startFocus = this._settings[this._settingKey].startFocus;
      this._focusBack = this._settings[this._settingKey].focusBack;
      this._eventTimeout = this._settings[this._settingKey].eventTimeout;
      this._openCallback = this._settings[this._settingKey].openCallback;
      this._closeCallback = this._settings[this._settingKey].closeCallback;

      this._documentKeydownHandler = this._documentKeydownHandler.bind(this);
      this._documentClickHandler = this._documentClickHandler.bind(this);
      this._modalClickHandler = this._modalClickHandler.bind(this);

      this._init();
    }

    _init() {
      if (this._modalOpenElements.length) {
        document.addEventListener('click', this._documentClickHandler);
      }
    }

    _setSettings(settingKey = this._settingKey) {
      if (!this._settings[settingKey]) {
        return;
      }

      this._preventDefault =
        typeof this._settings[settingKey].preventDefault === 'boolean'
          ? this._settings[settingKey].preventDefault
          : this._settings[this._settingKey].preventDefault;
      this._stopPlay =
        typeof this._settings[settingKey].stopPlay === 'boolean'
          ? this._settings[settingKey].stopPlay
          : this._settings[this._settingKey].stopPlay;
      this._lockFocus =
        typeof this._settings[settingKey].lockFocus === 'boolean'
          ? this._settings[settingKey].lockFocus
          : this._settings[this._settingKey].lockFocus;
      this._startFocus =
        typeof this._settings[settingKey].startFocus === 'boolean'
          ? this._settings[settingKey].startFocus
          : this._settings[this._settingKey].startFocus;
      this._focusBack =
        typeof this._settings[settingKey].lockFocus === 'boolean'
          ? this._settings[settingKey].focusBack
          : this._settings[this._settingKey].focusBack;
      this._eventTimeout =
        typeof this._settings[settingKey].eventTimeout === 'number'
          ? this._settings[settingKey].eventTimeout
          : this._settings[this._settingKey].eventTimeout;
      this._openCallback = this._settings[settingKey].openCallback || this._settings[this._settingKey].openCallback;
      this._closeCallback = this._settings[settingKey].closeCallback || this._settings[this._settingKey].closeCallback;
    }

    _documentClickHandler(evt) {
      const target = evt.target;

      if (!target.closest('[data-open-modal]')) {
        return;
      }

      evt.preventDefault();

      this._modalName = target.closest('[data-open-modal]').dataset.openModal;

      if (!this._modalName) {
        return;
      }

      this.open();
    }

    _documentKeydownHandler(evt) {
      const isEscKey = evt.key === 'Escape' || evt.key === 'Esc';

      if (isEscKey) {
        evt.preventDefault();
        this.close(document.querySelector('.modal.is-active').dataset.modal);
      }
    }

    _modalClickHandler(evt) {
      const target = evt.target;

      if (!target.closest('[data-close-modal]')) {
        return;
      }

      this.close(target.closest('[data-modal]').dataset.modal);
    }

    _addListeners(modal) {
      modal.addEventListener('click', this._modalClickHandler);
      document.addEventListener('keydown', this._documentKeydownHandler);
    }

    _removeListeners(modal) {
      modal.removeEventListener('click', this._modalClickHandler);
      document.removeEventListener('keydown', this._documentKeydownHandler);
    }

    _stopInteractive(modal) {
      if (this._stopPlay) {
        modal.querySelectorAll('video, audio').forEach((el) => el.pause());
        modal.querySelectorAll('[data-iframe]').forEach((el) => {
          el.querySelector('iframe').contentWindow.postMessage('{"event": "command", "func": "pauseVideo", "args": ""}', '*');
        });
      }
    }

    _autoPlay(modal) {
      modal.querySelectorAll('[data-iframe]').forEach((el) => {
        const autoPlay = el.closest('[data-auto-play]');
        if (autoPlay) {
          el.querySelector('iframe').contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
      });
    }

    open(modalName = this._modalName) {
      const modal = document.querySelector(`[data-modal="${modalName}"]`);

      if (!modal || modal.classList.contains('is-active')) {
        return;
      }

      document.removeEventListener('click', this._documentClickHandler);

      this._openedModalElement = document.querySelector('.modal.is-active');

      if (this._openedModalElement) {
        this._enableScrolling = false;
        this.close(this._openedModalElement.dataset.modal);
      }

      this._setSettings(modalName);
      modal.classList.add('is-active');

      if (!this._openedModalElement) {
        this._scrollLock.disableScrolling();
      }

      if (this._openCallback) {
        this._openCallback();
      }

      if (this._lockFocus) {
        this._focusLock.lock('.modal.is-active', this._startFocus);
      }

      setTimeout(() => {
        this._addListeners(modal);
        this._autoPlay(modal);
        document.addEventListener('click', this._documentClickHandler);
      }, this._eventTimeout);
    }

    close(modalName = this._modalName) {
      const modal = document.querySelector(`[data-modal="${modalName}"]`);
      document.removeEventListener('click', this._documentClickHandler);

      if (!modal || !modal.classList.contains('is-active')) {
        return;
      }

      if (this._lockFocus) {
        this._focusLock.unlock(this._focusBack);
      }

      modal.classList.remove('is-active');
      this._removeListeners(modal);
      this._stopInteractive(modal);

      if (this._closeCallback) {
        this._closeCallback();
      }

      if (this._enableScrolling) {
        setTimeout(() => {
          this._scrollLock.enableScrolling();
        }, this._eventTimeout);
      }

      setTimeout(() => {
        document.addEventListener('click', this._documentClickHandler);
      }, this._eventTimeout);

      this._setSettings('default');
      this._enableScrolling = true;
    }
  }

  // init-modals
  let modals;
  const settings = {
    'default': {
      preventDefault: true,
      stopPlay: true,
      lockFocus: true,
      startFocus: true,
      focusBack: true,
      eventTimeout: 400,
      openCallback: false,
      closeCallback: false,
    },
  };

  const initModals = () => {
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach((el) => {
      setTimeout(() => {
        el.classList.remove('modal_preload');
      }, 100);
    });
    modals = new Modals(settings);
    // Используйте в разработке экспортируемую переменную modals, window сделан для бэкэнда
    window.modals = modals;
  };

  // show-more-text
  const showMoreText = () => {
    const textElement = document.querySelector('.about__text-wrapper');
    const buttonElement = document.querySelector('.about__button');
    textElement.classList.remove('about__text-wrapper_no-js');

    buttonElement.addEventListener('click', () => {
      if (textElement.classList.contains('about__text-wrapper_closed')) {
        textElement.classList.remove('about__text-wrapper_closed');
        textElement.classList.add('about__text-wrapper_opened');
        buttonElement.textContent = 'Свернуть';
      } else {
        textElement.classList.add('about__text-wrapper_closed');
        textElement.classList.remove('about__text-wrapper_opened');
        buttonElement.textContent = 'Подробнее';
      }
    });
  };

  // validate-number
  const validatePhone = () => {
    let phoneInputs = document.querySelectorAll('input[type=tel]');

    const getInputNumbersValue = (input) => {
      return input.value.replace(/\D/g, '');
    };

    const onPhonePaste = (evt) => {
      let input = evt.target;
      let inputNumbersValue = getInputNumbersValue(input);
      let pasted = evt.clipboardData || window.clipboardData;
      if (pasted) {
        let pastedText = pasted.getData('Text');
        if (/\D/g.test(pastedText)) {
          // Attempt to paste non-numeric symbol — remove all non-numeric symbols,
          // formatting will be in onPhoneInput handler
          input.value = inputNumbersValue;
          return input.value;
        }
      }
      return input.value;
    };

    const onPhoneInput = (evt) => {
      let input = evt.target;
      let inputNumbersValue = getInputNumbersValue(input);
      let selectionStart = input.selectionStart;
      let formattedInputValue = '';

      if (!inputNumbersValue) {
        input.value = '';
        return input.value;
      }

      if (input.value.length !== selectionStart) {
        // Editing in the middle of input, not last symbol
        if (evt.data && /\D/g.test(evt.data)) {
          // Attempt to input non-numeric symbol
          input.value = inputNumbersValue;
        }
        return input.value;
      }

      if (['7', '8', '9'].indexOf(inputNumbersValue[0]) > -1) {
        // Russian phone number
        if (inputNumbersValue[0] === '9') {
          inputNumbersValue = '7' + inputNumbersValue;
        }

        let firstSymbols = (inputNumbersValue[0] === '8') ? '8' : '+7';
        formattedInputValue = firstSymbols + ' ';
        if (inputNumbersValue.length > 1) {
          formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
        }

        if (inputNumbersValue.length >= 5) {
          formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
        }

        if (inputNumbersValue.length >= 8) {
          formattedInputValue += ' ' + inputNumbersValue.substring(7, 9);
        }

        if (inputNumbersValue.length >= 10) {
          formattedInputValue += ' ' + inputNumbersValue.substring(9, 11);
        }

      } else {
        input.value = formattedInputValue;
      }

      input.value = formattedInputValue;
      return input.value;
    };

    for (let i = 0; i < phoneInputs.length; i++) {
      let input = phoneInputs[i];
      input.addEventListener('input', onPhoneInput);
    }

    const onPhoneKeyDown = function (evt) {
      // Clear input after remove last symbol
      let inputValue = evt.target.value.replace(/\D/g, '');
      if (evt.keyCode === 8 && inputValue.length === 1) {
        evt.target.value = '';
      }
    };

    for (let phoneInput of phoneInputs) {
      phoneInput.addEventListener('input', onPhoneInput);
      phoneInput.addEventListener('keydown', onPhoneKeyDown);
      phoneInput.addEventListener('paste', onPhonePaste);
    }
  };

  // breakpoint-checker
  const breakpointChecker = () => {
    if (breakpoint.matches) {
      mainScreenButtonElement.textContent = 'бесплатная консультация';
      productTitleElement.textContent = 'Товары и услуги Smart Device';
    } else {
      mainScreenButtonElement.textContent = 'Получить бесплатную консультацию';
      productTitleElement.textContent = 'Smart Device предлагает следующие товары и услуги';
    }
  };

  breakpoint.addEventListener('change', breakpointChecker);

  // accordion
  document.querySelectorAll('.accordion-item').forEach((item) => item.classList.remove('accordion-item_no-js'));
  document.querySelectorAll('.accordion-item__trigger').forEach((item) =>
    item.addEventListener('click', (evt) => {
      evt.preventDefault();
      const parent = item.parentNode;

      if (parent.classList.contains('accordion-item_active')) {
        parent.classList.remove('accordion-item_active');
      } else {
        document.querySelectorAll('.accordion-item').forEach((child) => child.classList.remove('accordion-item_active'));

        parent.classList.add('accordion-item_active');
      }
    })
  );

  form.addEventListener('submit', () => {
    const inputName = document.getElementById('name');
    const inputTel = document.getElementById('tel');
    const inputMessage = document.getElementById('message');
    localStorage.setItem('name', inputName.value);
    localStorage.setItem('tel', inputTel.value);
    localStorage.setItem('message', inputMessage.value);
  });

  showMoreText();
  validatePhone();
  breakpointChecker(breakpoint);

  // ---------------------------------
  // все скрипты должны быть в обработчике 'DOMContentLoaded', но не все в 'load'
  // в load следует добавить скрипты, не участвующие в работе первого экрана
  window.addEventListener('load', () => {
    initModals();
  });
});

// ---------------------------------

// ❗❗❗ обязательно установите плагины eslint, stylelint, editorconfig в редактор кода.

// привязывайте js не на классы, а на дата атрибуты (data-validate)

// вместо модификаторов .block--active используем утилитарные классы
// .is-active || .is-open || .is-invalid и прочие (обязателен нейминг в два слова)
// .select.select--opened ❌ ---> [data-select].is-open ✅

// выносим все в дата атрибуты
// url до иконок пинов карты, настройки автопрокрутки слайдера, url к json и т.д.

// для адаптивного JS используется matchMedia и addListener
// const breakpoint = window.matchMedia(`(min-width:1024px)`);
// const breakpointChecker = () => {
//   if (breakpoint.matches) {
//   } else {
//   }
// };
// breakpoint.addListener(breakpointChecker);
// breakpointChecker();

// используйте .closest(el)
