/**
 * Visual Mega Menu Builder — Frontend Interactive Script
 *
 * Handles tab switching (hover & click) and mobile accordions for standalone usage.
 *
 * @package visual-mega-menu-builder
 */

(function () {
	'use strict';

	function initMegaMenus() {
		const wrappers = document.querySelectorAll('.visual-mega-menu-wrapper');
		if (!wrappers.length) return;

		wrappers.forEach(function (wrapper) {
			if (wrapper._visualMegaInit) return;
			wrapper._visualMegaInit = true;

			// Desktop tab switching
			const tabBtns = wrapper.querySelectorAll('.visual-mega-tab-btn');
			const panels = wrapper.querySelectorAll('.visual-mega-panel');

			function activateTab(key) {
				tabBtns.forEach(function (btn) {
					if (btn.getAttribute('data-tab') === key) {
						btn.classList.add('is-active');
						btn.setAttribute('aria-selected', 'true');
					} else {
						btn.classList.remove('is-active');
						btn.setAttribute('aria-selected', 'false');
					}
				});

				panels.forEach(function (panel) {
					if (panel.getAttribute('data-panel') === key) {
						panel.classList.add('is-active');
					} else {
						panel.classList.remove('is-active');
					}
				});
			}

			tabBtns.forEach(function (btn) {
				const key = btn.getAttribute('data-tab');
				const enableHover = btn.getAttribute('data-hover') !== '0';

				if (enableHover) {
					btn.addEventListener('mouseenter', function () {
						activateTab(key);
					});
				}

				btn.addEventListener('click', function () {
					activateTab(key);
				});
			});

			// Mobile Accordion toggle
			const mobileToggles = wrapper.querySelectorAll('.visual-mega-mobile-toggle, .visual-mega-mobile-header');
			mobileToggles.forEach(function (toggle) {
				toggle.addEventListener('click', function () {
					const item = toggle.closest('.visual-mega-mobile-item');
					if (!item) return;

					const isOpen = item.classList.contains('is-open');
					// Close other accordions in same menu
					const siblings = wrapper.querySelectorAll('.visual-mega-mobile-item');
					siblings.forEach(function (sib) {
						sib.classList.remove('is-open');
						const btn = sib.querySelector('.visual-mega-mobile-toggle');
						if (btn) btn.setAttribute('aria-expanded', 'false');
					});

					if (!isOpen) {
						item.classList.add('is-open');
						const btn = item.querySelector('.visual-mega-mobile-toggle');
						if (btn) btn.setAttribute('aria-expanded', 'true');
					}
				});
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initMegaMenus);
	} else {
		initMegaMenus();
	}
})();
