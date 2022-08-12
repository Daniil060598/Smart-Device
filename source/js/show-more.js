const showMore = () => {
  const textElement = document.querySelector('.about__text');
  const buttonElement = document.querySelector('.about__button');
  textElement.classList.remove('about__text_no-js');

  buttonElement.addEventListener('click', () => {
    if (textElement.classList.contains('about__text_closed')) {
      textElement.classList.remove('about__text_closed');
      textElement.classList.add('about__text_opened');
      buttonElement.textContent = 'Свернуть';
    } else {
      textElement.classList.add('about__text_closed');
      textElement.classList.remove('about__text_opened');
      buttonElement.textContent = 'Подробнее';
    }
  });
};

export {showMore};
