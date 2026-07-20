/* Main Interactive Features */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMobileNav();
  initHeaderScroll();
  initActiveLinks();
  initContactForm();
  initHeroSlider();
});

/**
 * 0. Scroll Progress Bar Fallback (Runs on browsers lacking native scroll timelines)
 */
function initScrollProgress() {
  const progress = document.getElementById('scrollProgress');
  if (!progress) return;

  // Use JS fallback if CSS scroll timelines are unsupported
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progressPercentage = scrollable > 0 ? (scrolled / scrollable) : 0;
      progress.style.transform = `scaleX(${progressPercentage})`;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

/**
 * 1. Mobile Navigation Menu Toggle, Accordions and ARIA Accessibility States
 */
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  
  if (!navToggle || !mainNav) return;

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open');
    
    // Sync ARIA states
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Mobile submenu accordion toggling
  const submenuLinks = mainNav.querySelectorAll('.nav-link.has-submenu');
  submenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        link.classList.toggle('submenu-active');
        const parentItem = link.closest('.nav-item');
        const panel = parentItem.querySelector('.mega-menu-panel') || parentItem.querySelector('.standard-dropdown');
        if (panel) {
          panel.classList.toggle('mobile-open');
        }
      }
    });
  });

  // Close mobile navigation drawer if clicking outside of it
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('open') && 
        !mainNav.contains(e.target) && 
        !navToggle.contains(e.target)) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      
      // Close all submenus
      submenuLinks.forEach(link => {
        link.classList.remove('submenu-active');
        const parentItem = link.closest('.nav-item');
        const panel = parentItem.querySelector('.mega-menu-panel') || parentItem.querySelector('.standard-dropdown');
        if (panel) {
          panel.classList.remove('mobile-open');
        }
      });
    }
  });
}

/**
 * 2. Header Scroll Effect (Transitions navigation background on scroll)
 */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const toggleHeaderState = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Run immediately on page load and attach listener
  toggleHeaderState();
  window.addEventListener('scroll', toggleHeaderState, { passive: true });
}

/**
 * 3. Highlights Active Navigation Menu Item based on URL
 */
function initActiveLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    
    // Check if path matches or if at base root
    if (currentPath.endsWith(linkHref) || 
        (currentPath === '/' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * 4. Client-side Form Validation & Submission Effects
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  
  if (!form || !formSuccess) return;

  const fields = {
    name: {
      input: document.getElementById('clientName'),
      error: document.getElementById('nameError')
    },
    email: {
      input: document.getElementById('clientEmail'),
      error: document.getElementById('emailError'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    message: {
      input: document.getElementById('clientMessage'),
      error: document.getElementById('messageError')
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    Object.values(fields).forEach(f => {
      if (f.error) f.error.style.display = 'none';
      f.input.style.borderColor = '';
    });

    // Validate fields
    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const val = field.input.value.trim();

      if (!val) {
        isValid = false;
        showError(field);
      } else if (field.validate && !field.validate(val)) {
        isValid = false;
        showError(field);
      }
    });

    if (isValid) {
      // Simulate form submission effect
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Transmitting...';
      
      setTimeout(() => {
        // Animate out form, animate in success card
        form.style.transition = 'opacity 0.4s ease';
        form.style.opacity = '0';
        
        setTimeout(() => {
          form.style.display = 'none';
          formSuccess.style.display = 'block';
          formSuccess.style.opacity = '0';
          formSuccess.style.transition = 'opacity 0.4s ease';
          
          // Force layout reflow
          formSuccess.offsetHeight;
          formSuccess.style.opacity = '1';
        }, 400);
      }, 1200);
    }
  });

  function showError(field) {
    if (field.error) {
      field.error.style.display = 'block';
    }
    field.input.style.borderColor = 'var(--accent-tertiary)';
  }
}

/**
 * 5. Hero Carousel/Slider behavior
 */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.arrow-left');
  const nextBtn = document.querySelector('.arrow-right');
  const dotsContainer = document.querySelector('.slider-dots');

  if (!slider || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoPlayTimer;

  // Create dot indicators dynamically if slider dots container is empty
  if (dotsContainer && dotsContainer.children.length === 0) {
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  const dots = document.querySelectorAll('.slider-dot');

  function updateDots() {
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    // Bounds check
    if (currentIndex >= totalSlides) currentIndex = 0;
    if (currentIndex < 0) currentIndex = totalSlides - 1;

    // Apply translation to the slider container
    slider.style.transform = `translateX(-${currentIndex * 33.333}%)`;
    updateDots();
    resetAutoPlay();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Auto-play feature
  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, 6000); // changes every 6s
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  startAutoPlay();
}
