const THEME_KEY = 'portfolio-theme';
const THEME_ANIMATION_CLASS = 'is-animating';
const THEME_TRANSITION_CLASS = 'theme-transitioning';

function runThemeTransition() {
	document.body.classList.remove(THEME_TRANSITION_CLASS);
	void document.body.offsetWidth;
	document.body.classList.add(THEME_TRANSITION_CLASS);

	window.setTimeout(() => {
		document.body.classList.remove(THEME_TRANSITION_CLASS);
	}, 750);
}

function animateThemeIcons() {
	const themeIcons = document.querySelectorAll('.theme-icon');

	themeIcons.forEach((icon) => {
		icon.classList.remove(THEME_ANIMATION_CLASS);
		void icon.offsetWidth;
		icon.classList.add(THEME_ANIMATION_CLASS);
	});

	window.setTimeout(() => {
		themeIcons.forEach((icon) => icon.classList.remove(THEME_ANIMATION_CLASS));
	}, 540);
}

function applyTheme(mode) {
	const isDark = mode === 'dark';
	document.body.classList.toggle('dark-mode', isDark);
	document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

	// Update meta theme-color for mobile browser chrome
	const metaTheme = document.querySelector('meta[name="theme-color"]');
	if (metaTheme) {
		metaTheme.setAttribute('content', isDark ? '#000000' : '#fbfbfd');
	}

	const themedImages = document.querySelectorAll('[data-light][data-dark]');
	themedImages.forEach((image) => {
		image.src = isDark ? image.dataset.dark : image.dataset.light;
	});

	localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

function toggleTheme() {
	const isDarkNow = document.body.classList.contains('dark-mode');
	animateThemeIcons();
	runThemeTransition();
	applyTheme(isDarkNow ? 'light' : 'dark');
}

/* ── Scroll-Reveal via Intersection Observer ── */

function initScrollReveal() {
	const reveals = document.querySelectorAll('.reveal');
	if (!reveals.length) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('revealed');
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
	);

	reveals.forEach((el) => observer.observe(el));
}

/* ── Staggered children reveal for cards ── */

function initStaggerReveal() {
	const containers = document.querySelectorAll('.about-containers');
	containers.forEach((container) => {
		const cards = container.querySelectorAll('.details-container');
		cards.forEach((card, i) => {
			card.style.transitionDelay = `${i * 120}ms`;
		});
	});
}

/* ── Nav shadow on scroll ── */

function initNavShadow() {
	const nav = document.getElementById('desktop-nav');
	if (!nav) return;

	let ticking = false;
	window.addEventListener('scroll', () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				if (window.scrollY > 20) {
					nav.style.boxShadow = '0 4px 12px var(--surface-shadow-hover)';
				} else {
					nav.style.boxShadow = '0 1px 3px var(--surface-shadow)';
				}
				ticking = false;
			});
			ticking = true;
		}
	});
}

/* ── Contact Modal ── */

function openContactModal(e) {
	if (e) e.preventDefault();
	const modal = document.getElementById('contact-modal');
	modal.classList.add('open');
	document.body.classList.add('modal-open');
	// Focus the first input after animation
	setTimeout(() => {
		const firstInput = modal.querySelector('input');
		if (firstInput) firstInput.focus();
	}, 350);
}

function closeContactModal() {
	const modal = document.getElementById('contact-modal');
	modal.classList.remove('open');
	document.body.classList.remove('modal-open');
	// Reset form & status when closing
	const form = document.getElementById('contact-form');
	const formStatus = document.getElementById('form-status');
	if (form) form.reset();
	if (formStatus) {
		formStatus.className = 'form-status';
		formStatus.textContent = '';
	}
}

/* ── Contact Form Handling ── */

function initContactForm() {
	const form = document.getElementById('contact-form');
	if (!form) return;
	const submitBtn = form.querySelector('.submit-btn');
	const formStatus = document.getElementById('form-status');

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		// Disable submit button and show loading state
		submitBtn.disabled = true;
		submitBtn.classList.add('loading');

		// Hide any previous status messages
		formStatus.className = 'form-status';
		formStatus.textContent = '';

		try {
			const formData = new FormData(form);
			const response = await fetch(form.action, {
				method: 'POST',
				body: formData,
				headers: {
					'Accept': 'application/json'
				}
			});

			if (response.ok) {
				// Success
				formStatus.textContent = "Message sent successfully! I'll get back to you soon. 🎉";
				formStatus.classList.add('success', 'show');
				form.reset();

				// Auto-close modal after success
				setTimeout(() => {
					closeContactModal();
				}, 2500);
			} else {
				// Error from server
				throw new Error('Server error');
			}
		} catch (error) {
			// Error handling
			formStatus.textContent = 'Oops! Something went wrong. Please try again or email me directly.';
			formStatus.classList.add('error', 'show');

			// Auto-hide error message after 5 seconds
			setTimeout(() => {
				formStatus.classList.remove('show');
			}, 5000);
		} finally {
			// Re-enable submit button and remove loading state
			submitBtn.disabled = false;
			submitBtn.classList.remove('loading');
		}
	});

	// Close modal on backdrop click
	const modal = document.getElementById('contact-modal');
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeContactModal();
	});

	// Close modal on ESC key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.classList.contains('open')) {
			closeContactModal();
		}
	});
}

/* ── Projects Carousel ── */
function initProjectsCarousel() {
	const track = document.getElementById('projects-track');
	if (!track) return;

	const viewport = document.getElementById('projects-viewport');
	const slides = track.querySelectorAll('.carousel-slide');
	const dots = document.querySelectorAll('#projects-dots .carousel-dot');
	const prevBtn = document.getElementById('proj-prev');
	const nextBtn = document.getElementById('proj-next');
	const total = slides.length;
	let current = 0;

	function goTo(index) {
		current = ((index % total) + total) % total;
		track.style.transform = `translateX(-${current * 100}%)`;
		dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === current);
			dot.setAttribute('aria-selected', String(i === current));
		});
	}

	prevBtn.addEventListener('click', () => goTo(current - 1));
	nextBtn.addEventListener('click', () => goTo(current + 1));
	dots.forEach((dot) => {
		dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
	});

	// Touch & mouse-drag swipe
	let pointerStart = 0;
	let pointerDelta = 0;
	let pointerActive = false;

	function onPointerDown(x) {
		pointerActive = true;
		pointerStart = x;
		pointerDelta = 0;
		viewport.classList.add('is-dragging');
		track.style.transition = 'none';
	}
	function onPointerMove(x) {
		if (!pointerActive) return;
		pointerDelta = x - pointerStart;
	}
	function onPointerUp() {
		if (!pointerActive) return;
		pointerActive = false;
		viewport.classList.remove('is-dragging');
		track.style.transition = '';
		if (Math.abs(pointerDelta) > 50) {
			goTo(pointerDelta < 0 ? current + 1 : current - 1);
		} else {
			goTo(current); // snap back
		}
		pointerDelta = 0;
	}

	viewport.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
	window.addEventListener('mousemove', (e) => { if (pointerActive) onPointerMove(e.clientX); });
	window.addEventListener('mouseup', onPointerUp);

	viewport.addEventListener('touchstart', (e) => onPointerDown(e.touches[0].clientX), { passive: true });
	viewport.addEventListener('touchmove', (e) => { if (pointerActive) onPointerMove(e.touches[0].clientX); }, { passive: true });
	viewport.addEventListener('touchend', onPointerUp, { passive: true });

	// Keyboard navigation
	track.closest('.projects-carousel').addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
		if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const savedTheme = localStorage.getItem(THEME_KEY);
	applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
	initScrollReveal();
	initStaggerReveal();
	initNavShadow();
	initContactForm();
	initProjectsCarousel();
});