// Скрипты лендинга: мобильное меню, лента направлений, слайдер отзывов, форма подписки.
// Без библиотек - всё на чистом JavaScript.

// ===== Мобильное меню =====

const burger = document.querySelector('.burger');
const nav = document.querySelector('#main-nav');

function setMenuOpen(isOpen) {
  nav.classList.toggle('is-open', isOpen);
  // Состояние храним в aria-expanded: по нему же CSS рисует крестик
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
}

burger.addEventListener('click', () => {
  const isOpen = burger.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isOpen);
});

// Клик по пункту меню на телефоне - переходим к разделу и закрываем меню
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});

// Esc закрывает меню - привычно для пользователей клавиатуры
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

// Если меню открыли на телефоне, а потом окно расширили до десктопа - сбрасываем состояние
window.matchMedia('(min-width: 1280px)').addEventListener('change', () => setMenuOpen(false));


// ===== Лента направлений: стрелки листают на одну карточку =====

document.querySelectorAll('[data-carousel-controls]').forEach((controls) => {
  const track = document.getElementById(controls.dataset.carouselControls);
  const prev = controls.querySelector('[data-dir="-1"]');
  const next = controls.querySelector('[data-dir="1"]');

  // Шаг прокрутки = ширина карточки + промежуток между карточками
  function step() {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  // Кнопка неактивна, если дальше листать некуда (на десктопе все 3 карточки видны сразу)
  function updateButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= maxScroll - 1;
  }

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dir]');
    if (!button) return;
    track.scrollBy({ left: Number(button.dataset.dir) * step() });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
});


// ===== Слайдер отзывов =====

document.querySelectorAll('[data-slider]').forEach((slider) => {
  const slides = [...slider.querySelectorAll('.testimonial')];
  const dots = [...slider.querySelectorAll('.dots__dot')];
  let current = 0;

  function show(index) {
    // Остаток от деления даёт «зацикливание»: после последнего - первый
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  slider.addEventListener('click', (event) => {
    const arrow = event.target.closest('[data-slide]');
    if (arrow) show(current + Number(arrow.dataset.slide));

    const dot = event.target.closest('.dots__dot');
    if (dot) show(dots.indexOf(dot));
  });
});


// ===== Форма подписки =====
// Сервера нет, поэтому только проверка email и сообщение. В реальном проекте здесь был бы fetch на API.

const form = document.querySelector('.newsletter__form');

if (form) {
  const input = form.querySelector('.newsletter__input');
  const message = form.querySelector('.newsletter__message');

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // не перезагружаем страницу

    // checkValidity() использует встроенную проверку браузера для type="email"
    const isValid = input.value.trim() !== '' && input.checkValidity();
    message.classList.toggle('is-error', !isValid);
    message.classList.toggle('is-success', isValid);

    if (!isValid) {
      message.textContent = 'Please enter a valid email address.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');
    message.textContent = 'Thank you! You are subscribed.';
    form.reset();
  });
}
