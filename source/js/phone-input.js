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
      // Not Russian phone number
      formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
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

export {validatePhone};
