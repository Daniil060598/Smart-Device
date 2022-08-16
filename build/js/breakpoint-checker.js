const productTitleElement = document.querySelector('.products__title');
const mainScreenButtonElement = document.querySelector('.main-screen__button');
const breakpoint = window.matchMedia('(max-width:767px)');

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

export {breakpointChecker, breakpoint};
