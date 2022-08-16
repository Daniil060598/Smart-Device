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

export {showMoreText};
