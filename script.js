/**
 * Destiney Stiles — Site Navigation
 * Handles scroll-based nav styling and mobile menu interactions.
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Configuration
     -------------------------------------------------------------------------- */

  const SCROLL_THRESHOLD = 75;

  /* --------------------------------------------------------------------------
     DOM References
     -------------------------------------------------------------------------- */

  const siteHeader = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  /** All links that should close the mobile menu on click */
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');

  /* --------------------------------------------------------------------------
     Scroll State — transparent → solid navigation
     -------------------------------------------------------------------------- */

  let ticking = false;

  /**
   * Updates the scrolled class on the header based on scroll position.
   */
  function updateScrollState() {
    const isScrolled = window.scrollY > SCROLL_THRESHOLD;
    siteHeader.classList.toggle('is-scrolled', isScrolled);
    ticking = false;
  }

  /**
   * Throttled scroll handler using requestAnimationFrame.
   */
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  /* --------------------------------------------------------------------------
     Mobile Menu
     -------------------------------------------------------------------------- */

  let isMenuOpen = false;
  let previouslyFocusedElement = null;

  /**
   * Opens the mobile navigation menu.
   */
  function openMenu() {
    if (isMenuOpen) return;

    isMenuOpen = true;
    previouslyFocusedElement = document.activeElement;

    siteHeader.classList.add('menu-active');
    document.body.classList.add('menu-open');
    mobileMenu.classList.add('is-open');
    mobileMenuOverlay.classList.add('is-visible');

    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuOverlay.setAttribute('aria-hidden', 'false');

    /* Focus first interactive element inside the menu */
    mobileMenuClose.focus();
  }

  /**
   * Closes the mobile navigation menu.
   */
  function closeMenu() {
    if (!isMenuOpen) return;

    isMenuOpen = false;

    siteHeader.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
    mobileMenu.classList.remove('is-open');
    mobileMenuOverlay.classList.remove('is-visible');

    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuOverlay.setAttribute('aria-hidden', 'true');

    /* Return focus to the element that opened the menu */
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    } else {
      navToggle.focus();
    }
  }

  /**
   * Toggles the mobile menu open/closed state.
   */
  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* --------------------------------------------------------------------------
     Event Listeners
     -------------------------------------------------------------------------- */

  /* Scroll */
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollState();

  /* Mobile menu toggle */
  navToggle.addEventListener('click', toggleMenu);
  mobileMenuClose.addEventListener('click', closeMenu);

  /* Close when clicking overlay (outside menu) */
  mobileMenuOverlay.addEventListener('click', closeMenu);

  /* Close when clicking any navigation link */
  mobileMenuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  /* Trap focus within mobile menu when open */
  mobileMenu.addEventListener('keydown', function (event) {
    if (!isMenuOpen || event.key !== 'Tab') return;

    const focusableElements = mobileMenu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  /* --------------------------------------------------------------------------
     Resize — close mobile menu if viewport exceeds breakpoint
     -------------------------------------------------------------------------- */

  const DESKTOP_BREAKPOINT = 960;

  window.addEventListener('resize', function () {
    if (window.innerWidth > DESKTOP_BREAKPOINT && isMenuOpen) {
      closeMenu();
    }
  });

})();
