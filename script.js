/**
 * Destiney Stiles — Site Scripts
 * Navigation scroll state, mobile menu, active nav links, and scroll reveal.
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Configuration
     -------------------------------------------------------------------------- */

  const SCROLL_THRESHOLD = 75;
  const DESKTOP_BREAKPOINT = 960;
  const NAV_SECTION_IDS = ['home', 'about', 'listings', 'testimonials', 'contact'];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     DOM References
     -------------------------------------------------------------------------- */

  const siteHeader = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .mobile-menu__link[href^="#"]');
  const revealElements = document.querySelectorAll('.reveal');

  /* --------------------------------------------------------------------------
     Scroll State — transparent → solid navigation
     -------------------------------------------------------------------------- */

  let ticking = false;

  function updateScrollState() {
    const isScrolled = window.scrollY > SCROLL_THRESHOLD;
    siteHeader.classList.toggle('is-scrolled', isScrolled);

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;

    if (nearBottom) {
      setActiveNav('contact');
    }

    ticking = false;
  }

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

    mobileMenuClose.focus();
  }

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

    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    } else {
      navToggle.focus();
    }
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* --------------------------------------------------------------------------
     Active Navigation — highlights current section while scrolling
     -------------------------------------------------------------------------- */

  const visibleSections = new Map();
  let activeSectionId = 'home';

  function setActiveNav(sectionId) {
    if (activeSectionId === sectionId) return;
    activeSectionId = sectionId;

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute('href') === '#' + sectionId;
      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function initActiveNav() {
    const sections = NAV_SECTION_IDS
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (sections.length === 0) return;

    setActiveNav('home');

    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        if (visibleSections.size === 0) return;

        let bestId = activeSectionId;
        let bestRatio = 0;

        visibleSections.forEach(function (ratio, id) {
          if (ratio >= bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        setActiveNav(bestId);
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: [0, 0.15, 0.3, 0.45, 0.6]
      }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* --------------------------------------------------------------------------
     Scroll Reveal — subtle fade/slide-in for section content
     -------------------------------------------------------------------------- */

  function initScrollReveal() {
    if (revealElements.length === 0) return;

    if (prefersReducedMotion) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px'
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
     Event Listeners
     -------------------------------------------------------------------------- */

  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollState();

  navToggle.addEventListener('click', toggleMenu);
  mobileMenuClose.addEventListener('click', closeMenu);
  mobileMenuOverlay.addEventListener('click', closeMenu);

  mobileMenuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

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

  window.addEventListener('resize', function () {
    if (window.innerWidth > DESKTOP_BREAKPOINT && isMenuOpen) {
      closeMenu();
    }
  });

  /* --------------------------------------------------------------------------
     About Slideshow — slow crossfade between client photos
     -------------------------------------------------------------------------- */

  const SLIDE_INTERVAL = 7000;

  function initAboutSlideshow() {
    const slideshow = document.querySelector('.about__visual--slideshow');
    if (!slideshow) return;

    const slides = slideshow.querySelectorAll('.about__image');
    if (slides.length < 2 || prefersReducedMotion) return;

    let currentIndex = 0;

    setInterval(function () {
      slides[currentIndex].classList.remove('is-active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('is-active');
    }, SLIDE_INTERVAL);
  }

  /* --------------------------------------------------------------------------
     Initialize enhancements
     -------------------------------------------------------------------------- */

  initActiveNav();
  initScrollReveal();
  initAboutSlideshow();

})();
