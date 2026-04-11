// Theme Toggle Functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  
  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  
  function updateToggleLabel() {
    const theme = html.getAttribute('data-theme');
    themeToggle.setAttribute('title', theme === 'dark' ? 'Turn globe to light mode' : 'Turn globe to dark mode');
  }

  themeToggle.addEventListener('click', () => {
    const themeGlobe = document.getElementById('themeGlobe');
    if (themeGlobe) {
      themeGlobe.classList.remove('turning');
      void themeGlobe.offsetWidth;
      themeGlobe.classList.add('turning');
      setTimeout(() => themeGlobe.classList.remove('turning'), 700);
    }

    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleLabel();
    
    // Add transition effect
    html.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      html.style.transition = '';
    }, 300);
  });

  updateToggleLabel();
}

function initNavMobile() {
  const nav = document.querySelector('nav.navbar');
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('navMenu');
  if (!nav || !burger || !menu) return;

  const mq = window.matchMedia('(min-width: 901px)');

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-menu-open', open);
  }

  burger.addEventListener('click', () => {
    setOpen(!nav.classList.contains('is-open'));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  mq.addEventListener('change', () => {
    if (mq.matches) setOpen(false);
  });
}

// Accent preset (Sunset Dev only)
function initAccentPresetSwitcher() {
  const html = document.documentElement;
  html.setAttribute('data-accent', 'sunset');
}

// Custom Cursor Effects
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const cursorTrail = document.getElementById('cursorTrail');
  if (!cursor || !cursorTrail) return;

  function trailEmojiForTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙';
  }

  // Earth follows pointer; trail is sun (light) or crescent moon (dark)
  cursor.innerHTML = '🌍';
  cursorTrail.innerHTML = trailEmojiForTheme();

  const themeObserver = new MutationObserver(() => {
    cursorTrail.innerHTML = trailEmojiForTheme();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  
  let mouseX = 0;
  let mouseY = 0;
  let trailX = 0;
  let trailY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateCursor() {
    // Smooth cursor movement
    const cursorX = mouseX + (cursor.offsetWidth / 2);
    const cursorY = mouseY + (cursor.offsetHeight / 2);
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    // Trail effect with rotation
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    
    // Gentle rotation on trail (sun / moon)
    const rotation = (Date.now() * 0.1) % 360;
    cursorTrail.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // Hide default cursor
  document.body.style.cursor = 'none';
  
  // Show custom cursor on hoverable elements
  const hoverableElements = document.querySelectorAll('a, button, .project-card, .skill-item, .light-switch-btn, .nav-burger');
  
  hoverableElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.3)';
      cursor.style.filter = 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))';
      cursor.innerHTML = '🌎'; // Different Earth view
    });
    
    element.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.filter = 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))';
      cursor.innerHTML = '🌍'; // Back to original Earth view
    });
  });
}

// Hero typing animation
function initHeroTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const fullLine = "I'm seeking Software Engineer Intern · Full-Stack Developer · Backend Developer";
  let charIndex = 0;
  const typeSpeed = 60;

  function type() {
    if (charIndex < fullLine.length) {
      el.textContent = fullLine.substring(0, charIndex + 1);
      charIndex++;
      setTimeout(type, typeSpeed);
    }
  }

  setTimeout(type, 500);
}

// Audio Player Widget
function initAudioPlayer() {
  const player = document.getElementById('audioPlayer');
  const audio = document.getElementById('audioSource');
  const playBtn = document.getElementById('audioPlay');
  const progressBar = document.getElementById('audioProgress');
  const progressFill = document.getElementById('audioProgressFill');
  const currentTimeEl = document.getElementById('audioCurrentTime');
  const durationEl = document.getElementById('audioDuration');
  const closeBtn = document.getElementById('audioPlayerClose');
  const volumeSlider = document.getElementById('audioVolume');
  const headerToggleBtn = document.getElementById('audioWidgetToggle');

  if (!player || !audio || !playBtn) return;

  const STORAGE_TIME = 'portfolioAudioTime';
  const STORAGE_PLAYING = 'portfolioAudioPlaying';
  const STORAGE_VOL = 'portfolioAudioVol';

  // Browsers often pause <audio> during full-page navigation before pagehide fires.
  // Persist explicit user intent instead of audio.paused so the next page can resume.
  let userWantsPlayback = sessionStorage.getItem(STORAGE_PLAYING) === '1';

  function persistAudioState() {
    try {
      if (audio.duration && !Number.isNaN(audio.currentTime)) {
        sessionStorage.setItem(STORAGE_TIME, String(audio.currentTime));
      }
      sessionStorage.setItem(STORAGE_PLAYING, userWantsPlayback ? '1' : '0');
      sessionStorage.setItem(STORAGE_VOL, String(audio.volume));
    } catch (_) {}
  }

  function applyPlayingUi(playing) {
    if (playing) {
      playBtn.classList.add('playing');
      playBtn.setAttribute('aria-label', 'Pause');
    } else {
      playBtn.classList.remove('playing');
      playBtn.setAttribute('aria-label', 'Play');
    }
  }

  function tryResumePlayback() {
    if (!userWantsPlayback) return Promise.resolve(false);
    return audio
      .play()
      .then(() => {
        applyPlayingUi(true);
        return true;
      })
      .catch(() => false);
  }

  let resumeOnGestureCleanup = null;
  function armResumeOnUserGesture() {
    if (resumeOnGestureCleanup) return;
    const once = () => {
      tryResumePlayback().then((ok) => {
        if (ok && resumeOnGestureCleanup) {
          resumeOnGestureCleanup();
          resumeOnGestureCleanup = null;
        }
      });
    };
    const opts = { capture: true, passive: true };
    document.addEventListener('pointerdown', once, opts);
    document.addEventListener('keydown', once, opts);
    resumeOnGestureCleanup = () => {
      document.removeEventListener('pointerdown', once, opts);
      document.removeEventListener('keydown', once, opts);
    };
  }

  audio.volume = 0.1;
  if (volumeSlider) volumeSlider.value = 20;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      userWantsPlayback = true;
      audio.play().catch(() => {});
      applyPlayingUi(true);
      persistAudioState();
    } else {
      userWantsPlayback = false;
      audio.pause();
      applyPlayingUi(false);
      persistAudioState();
    }
  });

  let lastPersistMs = 0;
  audio.addEventListener('timeupdate', () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressBar.value = percent;
    if (progressFill) progressFill.style.width = percent + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    const now = Date.now();
    if (now - lastPersistMs > 900) {
      lastPersistMs = now;
      persistAudioState();
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    try {
      const savedT = parseFloat(sessionStorage.getItem(STORAGE_TIME) || '');
      const savedVol = parseFloat(sessionStorage.getItem(STORAGE_VOL) || '');
      if (!Number.isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) {
        audio.volume = savedVol;
        if (volumeSlider) volumeSlider.value = Math.round(savedVol * 100);
      }
      if (!Number.isNaN(savedT) && savedT > 0 && audio.duration && savedT < audio.duration - 0.25) {
        audio.currentTime = savedT;
        const pct = (savedT / audio.duration) * 100;
        progressBar.value = pct;
        if (progressFill) progressFill.style.width = pct + '%';
        currentTimeEl.textContent = formatTime(savedT);
      }
      if (userWantsPlayback) {
        tryResumePlayback().then((ok) => {
          if (!ok) armResumeOnUserGesture();
        });
      }
    } catch (_) {}
  });

  window.addEventListener('pagehide', persistAudioState);
  window.addEventListener('beforeunload', persistAudioState);

  audio.addEventListener('ended', () => {
    userWantsPlayback = false;
    applyPlayingUi(false);
    progressBar.value = 0;
    if (progressFill) progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    try {
      sessionStorage.setItem(STORAGE_PLAYING, '0');
      sessionStorage.setItem(STORAGE_TIME, '0');
    } catch (_) {}
  });

  progressBar.addEventListener('input', (e) => {
    const percent = e.target.value;
    if (progressFill) progressFill.style.width = percent + '%';
    if (audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
    }
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value / 100;
      persistAudioState();
    });
  }

  const toggleBtn = document.getElementById('audioPlayerToggle');

  function closePlayer() {
    player.classList.add('collapsed');
    if (toggleBtn) toggleBtn.classList.add('visible');
  }

  function openPlayer() {
    player.classList.remove('collapsed');
    if (toggleBtn) toggleBtn.classList.remove('visible');
  }

  function togglePlayerVisibility() {
    const isCollapsed = player.classList.contains('collapsed');
    if (isCollapsed) openPlayer();
    else closePlayer();
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closePlayer);
  }

  if (headerToggleBtn) {
    headerToggleBtn.addEventListener('click', togglePlayerVisibility);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      togglePlayerVisibility();
    });
  }
}

const CONTACT_FORMSUBMIT_EMAIL = 'haanhhoangngoc@gmail.com';

function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  const statusEl = document.getElementById('portfolio-contact-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    if (window.location.protocol === 'file:') {
      return;
    }

    e.preventDefault();
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'text-sm mt-4 text-gray-400';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    // FormSubmit expects a literal @ in the path (encoding breaks routing).
    const url = `https://formsubmit.co/ajax/${CONTACT_FORMSUBMIT_EMAIL}`;

    function isFormSubmitSuccess(data) {
      const s = data && data.success;
      if (s === true) return true;
      if (typeof s === 'string') return s.toLowerCase() === 'true';
      return false;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (isFormSubmitSuccess(data)) {
        if (statusEl) {
          statusEl.textContent = 'Thanks — your message was sent.';
          statusEl.classList.add('text-green-400');
        }
        form.reset();
      } else {
        const serverMsg =
          typeof data.message === 'string' && data.message.trim() ? data.message.trim() : null;
        if (statusEl) {
          statusEl.textContent =
            serverMsg ||
            'Form could not be sent. Confirm your FormSubmit activation email, or try again from a published HTTPS site.';
          statusEl.classList.add('text-amber-400');
        }
      }
    } catch {
      if (statusEl) {
        statusEl.innerHTML =
          'Network error while sending. Open this site over <strong>http://localhost</strong> or HTTPS (not a raw file), or email <a href="mailto:haanhhoangngoc@gmail.com" class="text-purple-300 underline hover:text-white">haanhhoangngoc@gmail.com</a>.';
        statusEl.classList.add('text-red-400');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    }
  });
}

// Shooting Stars Animation
function initShootingStars() {
  const shootingStarsContainer = document.querySelector('.shooting-stars');
  if (!shootingStarsContainer) return;

  function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    // Random position
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 50 + '%';
    
    // Random delay
    star.style.animationDelay = Math.random() * 5 + 's';
    
    shootingStarsContainer.appendChild(star);
    
    // Remove star after animation
    setTimeout(() => {
      if (star.parentNode) {
        star.parentNode.removeChild(star);
      }
    }, 3000);
  }
  
  // Create shooting stars periodically
  setInterval(createShootingStar, 2000);
  
  // Create initial stars
  for (let i = 0; i < 3; i++) {
    setTimeout(createShootingStar, i * 500);
  }
}

// Solar System and Astronomer Effects
function initSolarSystem() {
  const astronomicalBg = document.querySelector('.astronomical-bg');
  if (!astronomicalBg) return;

  // Create multiple astronomers
  for (let i = 0; i < 3; i++) {
    const astronomer = document.createElement('div');
    astronomer.className = 'astronomer';
    astronomer.innerHTML = '👨‍🚀';
    astronomer.style.animationDelay = `${i * 5}s`;
    astronomer.style.animationDuration = `${15 + i * 2}s`;
    astronomicalBg.appendChild(astronomer);
  }
  
  // Add floating space debris
  for (let i = 0; i < 5; i++) {
    const debris = document.createElement('div');
    debris.innerHTML = ['🛰️', '🚀', '⭐', '💫', '🌌'][i];
    debris.style.position = 'absolute';
    debris.style.fontSize = '16px';
    debris.style.left = `${Math.random() * 100}%`;
    debris.style.top = `${Math.random() * 100}%`;
    debris.style.animation = `float ${8 + Math.random() * 4}s ease-in-out infinite`;
    debris.style.animationDelay = `${Math.random() * 5}s`;
    astronomicalBg.appendChild(debris);
  }
}

// Floating animation for space debris
const floatKeyframes = `
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}
`;

// Add keyframes to document
const floatStyle = document.createElement('style');
floatStyle.textContent = floatKeyframes;
document.head.appendChild(floatStyle);

// Enhanced Mouse Effects
function initEnhancedMouseEffects() {
  // Magnetic effect for project cards
  const projectCards = document.querySelectorAll('.index-project-card, .project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;
      
      // Add glow effect
      card.style.boxShadow = `
        0 20px 40px var(--shadow-color),
        0 0 20px rgba(135, 206, 235, 0.3)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.boxShadow = '0 20px 40px var(--shadow-color)';
    });
  });
  
  // Particle effect on click
  document.addEventListener('click', (e) => {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = e.clientX + 'px';
    particle.style.top = e.clientY + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = '#87CEEB';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.animation = 'particle-explosion 0.6s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 600);
  });
}

// Particle explosion animation
const particleExplosionKeyframes = `
@keyframes particle-explosion {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 0;
  }
}
`;

// Add keyframes to document
const style = document.createElement('style');
style.textContent = particleExplosionKeyframes;
document.head.appendChild(style);

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal, .project-section');

function revealOnScroll() {
  revealElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add('active');
      element.classList.add('visible');
    }
  });
}

// Back to Top Button (optional — many project pages omit #backToTop)
const backToTopButton = document.getElementById('backToTop');

function toggleBackToTop() {
  if (!backToTopButton) return;
  if (window.scrollY > 300) {
    backToTopButton.classList.add('visible');
  } else {
    backToTopButton.classList.remove('visible');
  }
}

if (backToTopButton) {
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

window.addEventListener('scroll', toggleBackToTop);
toggleBackToTop();

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add animation classes to elements
document.addEventListener('DOMContentLoaded', () => {
  // Initialize new features
  initThemeToggle();
  initNavMobile();
  initAccentPresetSwitcher();
  initCustomCursor();
  initShootingStars();
  initEnhancedMouseEffects();
  initSolarSystem();
  initHeroTyping();

  // Add float animation to hero image
  const heroImage = document.querySelector('.image-wrapper img:first-child');
  if (heroImage) {
    heroImage.classList.add('animate-float');
  }

  // Add fade-in animation to project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    card.classList.add('animate-fadeInUp');
    card.style.animationDelay = `${index * 0.2}s`;
  });

  // Add slide-in animations to skills
  const skillItems = document.querySelectorAll('.skill-item');
  skillItems.forEach((item, index) => {
    item.classList.add(index % 2 === 0 ? 'animate-slideInLeft' : 'animate-slideInRight');
    item.style.animationDelay = `${index * 0.1}s`;
  });

  // Add glow animation to contact links
  const contactLinks = document.querySelectorAll('.contact a');
  contactLinks.forEach(link => {
    link.classList.add('animate-glow');
  });

  initDesignProcess();
  initFinalSolution();
  initProjectOverview();
  initProjectsSection();
  initAudioPlayer();
  initContactForm();
});

// Event Listeners
window.addEventListener('scroll', () => {
  revealOnScroll();
  toggleBackToTop();
});

// Initial call to check visible elements
revealOnScroll();
toggleBackToTop();

// Parallax Effect for Hero Section
const hero = document.querySelector('.hero');
if (hero) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  });
}

// Mouse Move Effect for Project Cards
const projectCardsMouse = document.querySelectorAll('.project-card');
projectCardsMouse.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  });
});

// Gallery Tab Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    const subTabContents = document.querySelectorAll('.sub-tab-content');

    // Main tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Add animation
            const activeContent = document.getElementById(tabId);
            activeContent.style.opacity = '0';
            setTimeout(() => {
                activeContent.style.opacity = '1';
            }, 50);
        });
    });

    // Sub-tab switching
    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all sub-buttons and contents
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            subTabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const subTabId = button.getAttribute('data-subtab');
            document.getElementById(subTabId).classList.add('active');

            // Add animation
            const activeContent = document.getElementById(subTabId);
            activeContent.style.opacity = '0';
            setTimeout(() => {
                activeContent.style.opacity = '1';
            }, 50);
        });
    });

    // Carousel functionality
    const carousels = document.querySelectorAll('.carousel-container');
    
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const leftButton = carousel.querySelector('.carousel-arrow.left');
        const rightButton = carousel.querySelector('.carousel-arrow.right');
        const items = carousel.querySelectorAll('.carousel-item');
        
        let currentIndex = 0;
        const itemWidth = items[0].offsetWidth + 32; // Width + gap

        // Smooth scroll function
        const scrollToItem = (index) => {
            track.style.scrollBehavior = 'smooth';
            track.scrollLeft = index * itemWidth;
        };

        // Left button click
        leftButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                scrollToItem(currentIndex);
                addPulseAnimation(leftButton);
            }
        });

        // Right button click
        rightButton.addEventListener('click', () => {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                scrollToItem(currentIndex);
                addPulseAnimation(rightButton);
            }
        });

        // Touch/swipe support
        let isDown = false;
        let startX;
        let scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });

        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
    });

    // Add pulse animation to buttons
    function addPulseAnimation(button) {
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 300);
    }

    // Back to Top button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Add hover effect to gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px)';
            const caption = item.querySelector('.gallery-caption');
            if (caption) {
                caption.style.transform = 'translateY(0)';
            }
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
            const caption = item.querySelector('.gallery-caption');
            if (caption) {
                caption.style.transform = 'translateY(100%)';
            }
        });
    });

    // Add loading animation
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });
});

// Design Process Animations
function initDesignProcess() {
  const processPhases = document.querySelectorAll('.process-phase');
  const mediaItems = document.querySelectorAll('.media-item');
  const metrics = document.querySelectorAll('.metric');
  const userQuotes = document.querySelectorAll('.user-quote');

  // Phase hover animations
  processPhases.forEach(phase => {
    phase.addEventListener('mouseenter', () => {
      phase.style.transform = 'translateY(-5px)';
      phase.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    });

    phase.addEventListener('mouseleave', () => {
      phase.style.transform = 'translateY(0)';
      phase.style.boxShadow = 'none';
    });
  });

  // Media gallery animations
  mediaItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.media-caption');
      
      img.style.transform = 'scale(1.1)';
      caption.style.transform = 'translateY(0)';
    });

    item.addEventListener('mouseleave', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.media-caption');
      
      img.style.transform = 'scale(1)';
      caption.style.transform = 'translateY(100%)';
    });
  });

  // Metrics animations
  metrics.forEach(metric => {
    metric.addEventListener('mouseenter', () => {
      const value = metric.querySelector('.metric-value');
      value.style.transform = 'scale(1.1)';
      value.style.color = '#ff6b6b';
    });

    metric.addEventListener('mouseleave', () => {
      const value = metric.querySelector('.metric-value');
      value.style.transform = 'scale(1)';
      value.style.color = 'var(--accent-color)';
    });
  });

  // User quotes animations
  userQuotes.forEach(quote => {
    quote.addEventListener('mouseenter', () => {
      quote.style.transform = 'translateY(-5px) rotate(1deg)';
      quote.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
    });

    quote.addEventListener('mouseleave', () => {
      quote.style.transform = 'translateY(0) rotate(0)';
      quote.style.boxShadow = 'none';
    });
  });

  // Scroll reveal animation for process phases
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  processPhases.forEach((phase, index) => {
    phase.style.opacity = '0';
    phase.style.transform = `translateX(${index % 2 === 0 ? '-' : ''}50px)`;
    phase.style.transition = 'all 0.6s ease-out';
    observer.observe(phase);
  });
}

function initFinalSolution() {
  const features = document.querySelectorAll('.feature');
  const impactMetrics = document.querySelectorAll('.impact-metrics li');
  const solutionOverview = document.querySelector('.solution-overview');

  // Feature card animations
  features.forEach((feature, index) => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateY(20px)';
    feature.style.transition = `all 0.6s ease-out ${index * 0.2}s`;

    feature.addEventListener('mouseenter', () => {
      const img = feature.querySelector('.feature-img');
      if (img) {
        img.style.transform = 'scale(1.1)';
      }
    });

    feature.addEventListener('mouseleave', () => {
      const img = feature.querySelector('.feature-img');
      if (img) {
        img.style.transform = 'scale(1)';
      }
    });
  });

  // Impact metrics animations
  impactMetrics.forEach((metric, index) => {
    metric.style.opacity = '0';
    metric.style.transform = 'translateY(20px)';
    metric.style.transition = `all 0.6s ease-out ${index * 0.2}s`;

    metric.addEventListener('mouseenter', () => {
      metric.style.transform = 'translateY(-5px)';
      metric.style.background = 'rgba(173, 69, 153, 0.2)';
    });

    metric.addEventListener('mouseleave', () => {
      metric.style.transform = 'translateY(0)';
      metric.style.background = 'rgba(173, 69, 153, 0.1)';
    });
  });

  // Solution overview animation
  if (solutionOverview) {
    solutionOverview.style.opacity = '0';
    solutionOverview.style.transform = 'translateY(20px)';
    solutionOverview.style.transition = 'all 0.6s ease-out';
  }

  // Scroll reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  features.forEach(feature => observer.observe(feature));
  impactMetrics.forEach(metric => observer.observe(metric));
  if (solutionOverview) observer.observe(solutionOverview);
}

function initProjectOverview() {
  const metaItems = document.querySelectorAll('.meta-item');
  const overviewContent = document.querySelector('.overview-content');
  const projectOverview = document.querySelector('.project-overview');

  // Meta items animations
  metaItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `all 0.6s ease-out ${index * 0.1}s`;

    item.addEventListener('mouseenter', () => {
      const title = item.querySelector('h3');
      if (title) {
        title.style.color = '#ff6b6b';
      }
    });

    item.addEventListener('mouseleave', () => {
      const title = item.querySelector('h3');
      if (title) {
        title.style.color = 'var(--accent-color)';
      }
    });
  });

  // Overview content animation
  if (overviewContent) {
    overviewContent.style.opacity = '0';
    overviewContent.style.transform = 'translateY(20px)';
    overviewContent.style.transition = 'all 0.6s ease-out 0.3s';
  }

  // Project overview section animation
  if (projectOverview) {
    const heading = projectOverview.querySelector('h2');
    if (heading) {
      heading.style.opacity = '0';
      heading.style.transform = 'translateY(20px)';
      heading.style.transition = 'all 0.6s ease-out';
    }
  }

  // Scroll reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  metaItems.forEach(item => observer.observe(item));
  if (overviewContent) observer.observe(overviewContent);
  if (projectOverview) {
    const heading = projectOverview.querySelector('h2');
    if (heading) observer.observe(heading);
  }
}

// Project Navigation Enhancement
document.addEventListener('DOMContentLoaded', function() {
  const projectLinks = document.querySelectorAll('.project-navigation a');
  
  projectLinks.forEach(link => {
    // Click animation
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetUrl = this.getAttribute('href');
      
      // Add click animation
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
        window.location.href = targetUrl;
      }, 150);
    });

    // Hover animation
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });

    link.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
});

// Projects Section Animation
function initProjectsSection() {
  const projectCards = document.querySelectorAll('.index-project-card');
  
  // Initial styles
  projectCards.forEach((card, index) => {
    card.style.opacity = '0';
    const translateX = index % 2 === 0 ? '-100px' : '100px';
    card.style.transform = `translateX(${translateX}) scale(0.95)`;
  });

  // Intersection Observer for reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0) scale(1)';
      }
    });
  }, { 
    threshold: 0.2,
    rootMargin: '0px'
  });

  projectCards.forEach(card => observer.observe(card));

  // Enhanced hover effects for project cards
  projectCards.forEach(card => {
    const image = card.querySelector('.index-project-image');
    const text = card.querySelector('.index-project-text');
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;
      
      // Apply 3D rotation to the card
      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;
      
      // Parallax effect for the image
      if (image) {
        image.style.transform = `
          translateX(${rotateY * 2}px)
          translateY(${rotateX * 2}px)
        `;
      }
      
      // Subtle movement for text
      if (text) {
        text.style.transform = `
          translateX(${rotateY * -1}px)
          translateY(${rotateX * -1}px)
        `;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      if (image) image.style.transform = 'translateX(0) translateY(0)';
      if (text) text.style.transform = 'translateX(0) translateY(0)';
    });
  });

  // Add smooth scroll to project links
  document.querySelectorAll('.index-project-card a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// About Page Animations
document.addEventListener('DOMContentLoaded', () => {
  // Add delay to habit cards
  const habitCards = document.querySelectorAll('.habit-card');
  habitCards.forEach((card, index) => {
    card.style.setProperty('--delay', index);
  });

  // Parallax effect for about photo
  const aboutPhoto = document.querySelector('.about-photo');
  if (aboutPhoto) {
    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      
      aboutPhoto.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // Animate elements on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  document.querySelectorAll('.about-text, .about-photo, .favorites h3, .habit-card, .contact').forEach(el => {
    observer.observe(el);
  });

  // Smooth scroll for back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Add hover effect to habit cards
  habitCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px)';
      card.style.boxShadow = '0 20px 40px rgba(173, 69, 153, 0.2)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
  });

  // Add typing effect to about text
  const aboutText = document.querySelector('.about-text p');
  if (aboutText) {
    const text = aboutText.textContent;
    aboutText.textContent = '';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        aboutText.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 20);
      }
    }
    
    // Start typing effect when element is in view
    const textObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        typeWriter();
        textObserver.unobserve(aboutText);
      }
    }, { threshold: 0.5 });
    
    textObserver.observe(aboutText);
  }

  // Add particle effect to background
  const container = document.querySelector('.about-container');
  if (container) {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(particle);
    }
  }
});
