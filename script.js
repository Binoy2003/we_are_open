/**
 * Portfolio JavaScript - Kapil Singha Ethun
 * Pure Vanilla JavaScript implementation with no external framework dependencies.
 */

(function () {
  'use strict';

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
  const floatingTopBtn = document.getElementById('floatingTopBtn');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyToast = document.getElementById('copyToast');
  const currentYearSpan = document.getElementById('currentYear');

  // Dynamic Year in Footer
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     01. Mobile Navigation Drawer Handling
     ========================================================================== */
  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      const isOpen = mobileNav && mobileNav.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileNav();
    });
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileNav);
  }

  // Close mobile drawer on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  /* ==========================================================================
     02. Smooth Navigation & Link Click Handling
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();

        // Close mobile drawer if open
        if (mobileNav && mobileNav.classList.contains('open')) {
          closeMobileNav();
        }

        // Smooth scroll to target
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });

        // Set URL hash without jumping
        if (history.pushState) {
          history.pushState(null, '', targetId);
        }
      }
    });
  });

  /* ==========================================================================
     03. Header Scroll Styling & Floating Back-to-Top Button
     ========================================================================== */
  function handleScroll() {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;

    // Header blur/compact state
    if (header) {
      if (scrollPos > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Floating back to top button visibility
    if (floatingTopBtn) {
      if (scrollPos > 400) {
        floatingTopBtn.classList.add('visible');
      } else {
        floatingTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial check on page load
  handleScroll();

  /* ==========================================================================
     04. Back to Top Buttons
     ========================================================================== */
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  if (floatingTopBtn) {
    floatingTopBtn.addEventListener('click', scrollToTop);
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', scrollToTop);
  }

  /* ==========================================================================
     05. Active Section Scrollspy (IntersectionObserver)
     ========================================================================== */
  const trackedSections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const sectionObserverOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          updateActiveNavLinks(currentId);
        }
      });
    }, sectionObserverOptions);

    trackedSections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function updateActiveNavLinks(activeSectionId) {
    navLinks.forEach(function (link) {
      const navTarget = link.getAttribute('data-nav') || link.getAttribute('href').replace('#', '');
      if (navTarget === activeSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     06. Scroll Reveal Animations (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-item');

  if (prefersReducedMotion) {
    // If reduced motion is preferred, reveal all items immediately
    revealElements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  } else if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Once revealed, unobserve to free resources
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /* ==========================================================================
     07. Copy Email Interaction with Feedback
     ========================================================================== */
  if (copyEmailBtn) {
    let toastTimeout = null;

    copyEmailBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const email = this.getAttribute('data-email') || 'kapilsingha556@gmail.com';
      const btnText = this.querySelector('.btn-text');
      const originalText = btnText ? btnText.textContent : 'Copy';

      function onCopySuccess() {
        // Change button label
        if (btnText) {
          btnText.textContent = 'Copied!';
        }
        copyEmailBtn.style.backgroundColor = 'var(--accent-olive)';
        copyEmailBtn.style.color = 'var(--text-light)';

        // Show toast
        if (copyToast) {
          copyToast.classList.add('show');
          if (toastTimeout) clearTimeout(toastTimeout);
          toastTimeout = setTimeout(function () {
            copyToast.classList.remove('show');
            if (btnText) btnText.textContent = originalText;
            copyEmailBtn.style.backgroundColor = '';
            copyEmailBtn.style.color = '';
          }, 2800);
        } else {
          setTimeout(function () {
            if (btnText) btnText.textContent = originalText;
            copyEmailBtn.style.backgroundColor = '';
            copyEmailBtn.style.color = '';
          }, 2800);
        }
      }

      // Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(onCopySuccess).catch(function () {
          fallbackCopyText(email, onCopySuccess);
        });
      } else {
        fallbackCopyText(email, onCopySuccess);
      }
    });
  }

  function fallbackCopyText(text, callback) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      if (typeof callback === 'function') callback();
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    document.body.removeChild(tempInput);
  }

})();

