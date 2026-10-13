class ImageSlider {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    this.track = this.container.querySelector('.slider__track');
    this.slides = Array.from(this.track.children);
    this.total = this.slides.length;
    this.autoplay = options.autoplay ?? false;
    this.interval = options.interval ?? 4000;
    this.index = 1;            // position in the track (clones included)
    this.isAnimating = false;
    this.timer = null;

    this.buildClones();
    this.buildControls();
    this.bindEvents();
    this.moveTo(this.index, false);
    if (this.autoplay) this.startAutoplay();
  }

  // Clone last slide to the front and first slide to the end for infinite looping
  buildClones() {
    const firstClone = this.slides[0].cloneNode(true);
    const lastClone = this.slides[this.total - 1].cloneNode(true);
    this.track.prepend(lastClone);
    this.track.append(firstClone);
  }

  // Create arrows and one dot per slide dynamically
  buildControls() {
    this.prevBtn = this.createButton('slider_btn slider_btn--prev', '\u2039', 'Previous slide');
    this.nextBtn = this.createButton('slider_btn slider_btn--next', '\u203A', 'Next slide');

    this.dotsWrap = document.createElement('div');
    this.dotsWrap.className = 'slider__dots';

    this.dots = this.slides.map((_, i) => {
      const dot = this.createButton('slider__dot', '', Go to slide ${i + 1});
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsWrap.append(dot);
      return dot;
    });

    this.container.append(this.prevBtn, this.nextBtn, this.dotsWrap);
  }

  createButton(className, text, label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = text;
    btn.setAttribute('aria-label', label);
    return btn;
  }

  bindEvents() {
    this.nextBtn.addEventListener('click', () => this.next());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

    if (this.autoplay) {
      this.container.addEventListener('mouseenter', () => this.stopAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
  }

  // Layout maths: shift the track by index * 100% of one slide width
  moveTo(index, animate = true) {
    this.track.style.transition = animate ? '' : 'none';
    this.track.style.transform = translateX(${-index * 100}%);
    this.index = index;
    this.updateDots();
    if (!animate) {
      void this.track.offsetWidth;   // force reflow so the jump is instant
      this.track.style.transition = '';
    }
  }

  next() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.moveTo(this.index + 1);
  }

  prev() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.moveTo(this.index - 1);
  }

  goTo(realIndex) {
    if (this.isAnimating || realIndex === this.realIndex()) return;
    this.isAnimating = true;
    this.moveTo(realIndex + 1);
  }

  // After sliding onto a clone, jump silently to the matching real slide
  handleTransitionEnd() {
    if (this.index === 0) this.moveTo(this.total, false);
    else if (this.index === this.total + 1) this.moveTo(1, false);
    this.isAnimating = false;
  }

  // Index of the visible real slide (0 to total - 1)
  realIndex() {
    return (this.index - 1 + this.total) % this.total;
  }

  updateDots() {
    const active = this.realIndex();
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.toggleAttribute('aria-current', i === active);
    });
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.interval);
  }

  stopAutoplay() {
    clearInterval(this.timer);
    this.timer = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ImageSlider('#mySlider', { autoplay: true, interval: 4000 });
});