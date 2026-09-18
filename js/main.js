/**
 * ToolTutors — Vanilla JavaScript (Production Ready)
 * Fast, responsive, accessible interactivity without external libraries.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Sticky Nav Shadow on Scroll ---
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --- 2. Mobile Hamburger Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navRight = document.getElementById('nav-right');

  if (mobileToggle && navRight) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navRight.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!navRight.contains(e.target) && !mobileToggle.contains(e.target) && navRight.classList.contains('open')) {
        navRight.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- 3. Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        if (navRight && navRight.classList.contains('open')) {
          navRight.classList.remove('open');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // --- 4. Working Category Filter ---
  const categoryBtns = document.querySelectorAll('.category-btn');
  const articleCards = document.querySelectorAll('.article-card');

  if (categoryBtns.length > 0) {
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Also sync corresponding button if there are multiple filter bars
        const cat = btn.dataset.category;
        categoryBtns.forEach(b => {
          if (b.dataset.category === cat) {
            b.classList.add('active');
          }
        });

        let visibleCount = 0;
        articleCards.forEach(card => {
          // If card is inside featured section, don't hide unless requested
          if (card.closest('#featured-section')) {
            return;
          }
          const cardCat = card.dataset.category;
          const match = (cat === 'all' || cardCat === cat);
          card.style.display = match ? 'flex' : 'none';
          if (match) visibleCount++;
        });

        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
          resultsCount.innerText = visibleCount;
        }

        const noResults = document.getElementById('no-results');
        if (noResults) {
          noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });
    });
  }

  // --- 5. Homepage Real-Time Search Filter ---
  const searchInput = document.getElementById('search-input');
  const resultsCount = document.getElementById('results-count');
  const noResults = document.getElementById('no-results');

  if (searchInput && articleCards.length > 0) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      let matchCount = 0;

      articleCards.forEach(card => {
        if (card.closest('#featured-section')) return;

        const title = (card.querySelector('.article-card-title') || {}).innerText || '';
        const excerpt = (card.querySelector('.article-card-excerpt') || {}).innerText || '';
        const tag = (card.querySelector('.category-tag') || {}).innerText || '';

        const matches = !query ||
          title.toLowerCase().includes(query) ||
          excerpt.toLowerCase().includes(query) ||
          tag.toLowerCase().includes(query);

        if (matches) {
          card.style.display = 'flex';
          matchCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (resultsCount) resultsCount.innerText = matchCount;
      if (noResults) noResults.style.display = matchCount === 0 ? 'block' : 'none';
    });

    const searchForm = searchInput.closest('form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const articlesSection = document.getElementById('all-articles');
        if (articlesSection) {
          articlesSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // --- 6. Reading Progress Bar on Article Pages ---
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const scrolled = (scrollTop / docHeight) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
      }
    }, { passive: true });
  }

  // --- 7. Table of Contents Active Highlight on Scroll ---
  const tocLinks = document.querySelectorAll('.toc-list a');
  const headings = document.querySelectorAll('.article-main-content h2[id], .article-main-content h3[id]');

  if (tocLinks.length > 0 && headings.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tocLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '0px 0px -65% 0px',
      threshold: 0
    });

    headings.forEach(h => observer.observe(h));
  }

  // --- 8. FAQ Accordion Open / Close ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active', !isOpen);
      });
    }
  });

  // --- 9. Back to Top Button ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 10. Scroll Reveal Animation for Cards ---
  const revealElements = document.querySelectorAll('.article-card, .category-card, .why-col');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- 11. Hero Parallax Effect ---
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        const offset = window.scrollY * 0.3;
        hero.style.backgroundPositionY = `calc(50% + ${offset}px)`;
      }
    }, { passive: true });
  }
});
