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
