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

document.addEventListener('DOMContentLoaded', () => {
	const savedTheme = localStorage.getItem(THEME_KEY);
	applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
	initScrollReveal();
	initStaggerReveal();
	initNavShadow();
});