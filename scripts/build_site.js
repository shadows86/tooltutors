import fs from 'fs';
import path from 'path';
import { articlesBatch1 } from './articles_data_1.js';
import { articlesBatch2 } from './articles_data_2.js';
import { articlesBatch3 } from './articles_data_3.js';
import { articlesBatch4 } from './articles_data_4.js';

const allArticles = [
  ...articlesBatch1,
  ...articlesBatch2,
  ...articlesBatch3,
  ...articlesBatch4
];

console.log(`Loaded ${allArticles.length} articles.`);

// Category mapping helper matching prompt exact tag pill colors
function getCategoryInfo(category) {
  const c = category.toLowerCase();
  if (c.includes('android')) {
    return { name: 'Android', class: 'tag-android', filterId: 'android', count: 10 };
  }
  if (c.includes('fix') || c.includes('troubleshoot')) {
    return { name: 'Fix It', class: 'tag-fix', filterId: 'fix-it', count: 8 };
  }
  if (c.includes('app')) {
    return { name: 'Apps', class: 'tag-apps', filterId: 'apps', count: 6 };
  }
  if (c.includes('beginner')) {
    return { name: 'Beginner', class: 'tag-beginner', filterId: 'beginner', count: 4 };
  }
  return { name: 'Tools', class: 'tag-tools', filterId: 'tools', count: 12 };
}

// Direct permanent CDN image URLs for all 40 articles
const articleImageBaseMap = {
  'how-to-speed-up-android-phone': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb',
  'how-to-clear-cache-android': 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0',
  'how-to-use-chatgpt-for-beginners': 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01',
  'how-to-use-google-sheets-basics': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  'how-to-use-canva-for-free': 'https://images.unsplash.com/photo-1626785774573-4b799315345d',
  'how-to-fix-android-not-connecting-to-wifi': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8',
  'how-to-transfer-files-android-to-pc': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
  'how-to-use-whatsapp-web': 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff',
  'how-to-take-screenshot-android': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
  'how-to-use-google-translate': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8',
  'how-to-fix-android-black-screen': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd',
  'how-to-update-android-apps': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
  'how-to-use-google-drive-free': 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd',
  'how-to-compress-images-free': 'https://images.unsplash.com/photo-1561736778-92e52a7769ef',
  'how-to-convert-pdf-to-word-free': 'https://images.unsplash.com/photo-1568667256549-094345857637',
  'how-to-remove-virus-from-android': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
  'how-to-use-zoom-for-beginners': 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b',
  'how-to-make-pdf-free': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07',
  'how-to-use-youtube-offline': 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
  'how-to-fix-android-battery-drain': 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960',
  'how-to-use-google-forms-free': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b',
  'how-to-backup-android-phone': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988',
  'how-to-use-microsoft-teams-free': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
  'how-to-block-ads-on-android': 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f',
  'how-to-use-gmail-tips-tricks': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2',
  'how-to-fix-slow-internet-android': 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7',
  'how-to-use-google-meet-free': 'https://images.unsplash.com/photo-1609743522653-52354461eb27',
  'how-to-reset-android-phone': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2',
  'how-to-use-trello-for-beginners': 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
  'how-to-download-youtube-videos-free': 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
  'how-to-fix-android-overheating': 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33',
  'how-to-use-notion-for-beginners': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
  'how-to-share-wifi-password-android': 'https://images.unsplash.com/photo-1562408590-e32931084e23',
  'how-to-use-google-calendar-free': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe',
  'how-to-fix-whatsapp-not-working': 'https://images.unsplash.com/photo-1633354931133-27ac1ee5d853',
  'how-to-use-chatgpt-for-writing': 'https://images.unsplash.com/photo-1686191128892-3b37add4c844',
  'how-to-increase-android-storage': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
  'how-to-use-canva-for-instagram': 'https://images.unsplash.com/photo-1611162616475-46b635cb6868',
  'how-to-fix-google-chrome-slow': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3',
  'how-to-use-ai-tools-for-free-2025': 'https://images.unsplash.com/photo-1676277791608-ac54525aa94d'
};

function getArticleCardImageUrl(slug) {
  const base = articleImageBaseMap[slug] || 'https://images.unsplash.com/photo-1518770660439-4636190af475';
  return `${base}?w=600&h=340&fit=crop`;
}

function getArticleFeaturedImageUrl(slug) {
  const base = articleImageBaseMap[slug] || 'https://images.unsplash.com/photo-1518770660439-4636190af475';
  return `${base}?w=800&h=450`;
}

// Popular articles list for sidebar
const popularArticles = [
  { title: 'How to Speed Up Android Phone', slug: 'how-to-speed-up-android-phone' },
  { title: 'How to Use ChatGPT for Beginners', slug: 'how-to-use-chatgpt-for-beginners' },
  { title: 'How to Use Canva for Free', slug: 'how-to-use-canva-for-free' },
  { title: 'How to Fix Android Not Connecting to Wi-Fi', slug: 'how-to-fix-android-not-connecting-to-wifi' },
  { title: 'How to Use WhatsApp Web on PC', slug: 'how-to-use-whatsapp-web' }
];

// Common Navigation Bar Component (NO icons anywhere)
function renderNavBar(isArticlePage = false) {
  const rootPrefix = isArticlePage ? '/' : '/';
  return `
  <!-- Navigation -->
  <nav class="site-nav" aria-label="Main Navigation">
    <div class="nav-container">
      <div class="nav-left">
        <a href="${rootPrefix}" class="site-logo">ToolTutors<span class="logo-badge">.online</span></a>
      </div>

      <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-right" id="nav-right">
        <ul class="nav-links">
          <li><a href="${rootPrefix}#android" class="nav-link">Android</a></li>
          <li><a href="${rootPrefix}#tools" class="nav-link">Tools</a></li>
          <li><a href="${rootPrefix}#fix-it" class="nav-link">Fix It</a></li>
          <li><a href="${rootPrefix}#apps" class="nav-link">Apps</a></li>
          <li><a href="${rootPrefix}about.html" class="nav-link">About</a></li>
        </ul>
        <a href="${rootPrefix}#all-articles" class="btn-explore">Explore</a>
      </div>
    </div>
  </nav>`;
}

// Common 4-Column Footer Component
function renderFooter(isArticlePage = false) {
  const rootPrefix = isArticlePage ? '/' : '/';
  return `
  <!-- Footer -->
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="${rootPrefix}" class="site-logo">ToolTutors<span class="logo-badge">.online</span></a>
        <p class="footer-tagline">Simple tech guides for everyone. Master smartphones, online tools, and solve everyday digital problems with clear step-by-step walkthroughs.</p>
        <div class="social-links">
          <a href="#">Twitter</a>
          <a href="#">YouTube</a>
          <a href="#">GitHub</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>

      <div class="footer-col">
        <h4 class="footer-col-title">Categories</h4>
        <ul class="footer-links">
          <li><a href="${rootPrefix}#android">Android Tips</a></li>
          <li><a href="${rootPrefix}#tools">Online Tools</a></li>
          <li><a href="${rootPrefix}#fix-it">Fix &amp; Troubleshoot</a></li>
          <li><a href="${rootPrefix}#apps">App Guides</a></li>
          <li><a href="${rootPrefix}#beginner">Beginner Basics</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-col-title">Quick Links</h4>
        <ul class="footer-links">
          <li><a href="${rootPrefix}">Home</a></li>
          <li><a href="${rootPrefix}about.html">About Us</a></li>
          <li><a href="${rootPrefix}contact.html">Contact Us</a></li>
          <li><a href="${rootPrefix}#all-articles">All 40 Tutorials</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-col-title">About ToolTutors</h4>
        <p class="footer-about-text">ToolTutors is an independent educational technology publication. We write jargon-free, tested how-to guides to help non-technical users navigate the modern web and mobile apps with confidence.</p>
      </div>
    </div>

    <div class="container footer-bottom-bar">
      <div>&copy; 2025 ToolTutors. All rights reserved.</div>
      <div>
        <a href="${rootPrefix}privacy-policy.html">Privacy Policy</a> &bull; 
        <a href="${rootPrefix}terms.html">Terms of Use</a> &bull; 
        <a href="${rootPrefix}disclaimer.html">Disclaimer</a>
      </div>
    </div>
  </footer>

  <!-- Back to Top Button -->
  <button id="back-to-top" aria-label="Back to top" title="Back to top">&uarr;</button>`;
}

// Ensure articles directory exists
const articlesDir = path.resolve('articles');
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

// ==========================================================================
// 1. GENERATE EACH OF THE 40 ARTICLE PAGES (2-COLUMN LAYOUT: 70% CONTENT + 30% SIDEBAR)
// ==========================================================================
allArticles.forEach((article, index) => {
  const canonicalUrl = `https://tooltutors.online/articles/${article.slug}.html`;
  const catInfo = getCategoryInfo(article.category);
  const featuredImageUrl = getArticleFeaturedImageUrl(article.slug);

  // Pick 3 related articles
  const related = allArticles
    .filter(a => a.slug !== article.slug)
    .slice(index % 35, (index % 35) + 3);

  // Schema LD+JSON
  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": featuredImageUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "datePublished": article.dateIso || "2025-01-15",
    "dateModified": article.dateIso || "2025-01-15",
    "author": {
      "@type": "Person",
      "name": "ToolTutors Team",
      "url": "https://tooltutors.online/about.html"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolTutors",
      "url": "https://tooltutors.online"
    }
  };

  const schemaFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": (article.faq || []).map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const schemaBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://tooltutors.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": catInfo.name,
        "item": `https://tooltutors.online/#${catInfo.filterId}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": canonicalUrl
      }
    ]
  };

  // Build Table of Contents links
  const tocHtml = (article.sections || []).map((sec, secIdx) => {
    const secId = sec.id || `section-${secIdx + 1}`;
    const secTitle = sec.title || sec.heading;
    return `<li><a href="#${secId}">${secTitle}</a></li>`;
  }).join('\n            ');

  // Build Sections Body with Ad Slot 2 in the middle
  const middleSectionIdx = Math.floor((article.sections || []).length / 2);
  let sectionsHtml = '';

  (article.sections || []).forEach((sec, secIdx) => {
    const secId = sec.id || `section-${secIdx + 1}`;
    const secTitle = sec.title || sec.heading;
    sectionsHtml += `
      <h2 id="${secId}">${secTitle}</h2>
      ${sec.content}
    `;

    // Insert Ad Slot 2 in middle
    if (secIdx === middleSectionIdx) {
      sectionsHtml += `
      <!-- Ad Slot Position 2 — Middle of Article -->
      <div class="ad-slot" style="background:#e8ebfc;border:1.5px dashed #c9cfe8;border-radius:8px;padding:18px;text-align:center;color:#888;font-size:12px;margin:32px auto;min-height:260px;max-width:320px;display:flex;align-items:center;justify-content:center;">
        Ad Space — 300&times;250
      </div>
      `;
    }
  });

  // Build FAQ HTML
  const faqHtml = (article.faq || []).map(item => `
        <div class="faq-item">
          <button type="button" class="faq-question" aria-expanded="false">${item.q}</button>
          <div class="faq-answer">
            <p>${item.a}</p>
          </div>
        </div>`).join('');

  // Build Related Articles HTML (3 cards with images)
  const relatedHtml = related.map(rel => {
    const relCat = getCategoryInfo(rel.category);
    return `
        <div class="article-card">
          <img src="${getArticleCardImageUrl(rel.slug)}" alt="${rel.title}" class="article-card-img" loading="lazy" width="600" height="340">
          <div class="article-card-body">
            <span class="category-tag ${relCat.class}">${relCat.name}</span>
            <h4 class="article-card-title"><a href="/articles/${rel.slug}.html">${rel.title}</a></h4>
            <p class="article-card-excerpt">${rel.description.slice(0, 105)}...</p>
            <div class="article-card-footer">
              <span class="read-time">${rel.readTime}</span>
              <a href="/articles/${rel.slug}.html" class="read-more-link">Read More &rarr;</a>
            </div>
          </div>
        </div>`;
  }).join('');

  // Popular Articles HTML for Sidebar
  const popularListHtml = popularArticles.map(pop => `
    <li><a href="/articles/${pop.slug}.html">${pop.title}</a></li>
  `).join('');

  const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | ToolTutors</title>
  <meta name="description" content="${article.description}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${article.title} | ToolTutors">
  <meta property="og:description" content="${article.description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${featuredImageUrl}">
  <meta property="og:site_name" content="ToolTutors">
  <meta property="article:published_time" content="${article.dateIso || '2025-01-15'}">
  <meta property="article:author" content="ToolTutors Team">
  <meta property="article:section" content="${catInfo.name}">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaArticle)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(schemaFaq)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(schemaBreadcrumbs)}
  </script>
</head>
<body>
  <!-- Reading Progress Bar -->
  <div id="reading-progress"></div>

  ${renderNavBar(true)}

  <!-- 400px Article Hero Section -->
  <header class="article-hero">
    <div class="container">
      <nav class="breadcrumb-white" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>&rsaquo;</span>
        <a href="/#${catInfo.filterId}">${catInfo.name}</a>
        <span>&rsaquo;</span>
        <span>${article.title}</span>
      </nav>
      <h1>${article.title}</h1>
      <div class="article-hero-meta">
        <span>By ToolTutors Editorial Team</span>
        <span>&bull;</span>
        <span>Updated: ${article.dateIso || '2025'}</span>
        <span>&bull;</span>
        <span>${article.readTime}</span>
      </div>
    </div>
  </header>

  <!-- Main 2-Column Container (70% Content + 30% Sidebar) -->
  <main class="container article-container">
    <div class="article-layout">
      <!-- LEFT COLUMN (70%) -->
      <article class="article-main-content">
        <!-- Featured Image -->
        <img src="${featuredImageUrl}" alt="${article.title}" class="article-featured-img" loading="lazy" width="800" height="450">

        <!-- Ad Slot Position 1 — Below Image / Title -->
        <div class="ad-slot" style="background:#e8ebfc;border:1.5px dashed #c9cfe8;border-radius:8px;padding:18px;text-align:center;color:#888;font-size:12px;margin:20px 0;min-height:90px;display:flex;align-items:center;justify-content:center;">
          Ad Space — 728&times;90
        </div>

        <!-- Short Intro Paragraph -->
        <div class="article-intro">
          <p><strong>${article.title}</strong> — ${article.intro}</p>
        </div>

        <!-- Table of Contents (Sticky) -->
        <div class="toc-card">
          <div class="toc-title">Table of Contents</div>
          <ul class="toc-list">
            ${tocHtml}
            <li><a href="#pro-tip">Pro Tip</a></li>
            <li><a href="#common-mistakes">Common Mistakes to Avoid</a></li>
            <li><a href="#faq">Frequently Asked Questions</a></li>
            <li><a href="#conclusion">Conclusion &amp; Next Steps</a></li>
          </ul>
        </div>

        <!-- Full Article Body -->
        ${sectionsHtml}

        <!-- Tip Box -->
        <div class="tip-box" id="pro-tip">
          <strong>Pro Tip</strong>
          <p>${article.tip}</p>
        </div>

        <!-- Warning Box -->
        <div class="warning-box">
          <strong>Important Warning</strong>
          <p>Always verify software permissions before granting root, accessibility, or full filesystem access to any third-party tool.</p>
        </div>

        <!-- Common Mistakes Section -->
        <div class="mistakes-box" id="common-mistakes">
          <strong>Common Mistakes to Avoid</strong>
          <p>${article.mistakes}</p>
        </div>

        <!-- FAQ Accordion -->
        <section class="faq-section" id="faq">
          <h2>Frequently Asked Questions</h2>
          ${faqHtml}
        </section>

        <!-- Conclusion + CTA -->
        <section class="conclusion-section" id="conclusion" style="margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border);">
          <h2>Conclusion</h2>
          <p>${article.summary}</p>
          <div style="background: #f0f2ff; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <h3 style="font-size: 16px; margin-bottom: 6px;">Was this guide helpful?</h3>
            <p style="font-size: 13px; color: #666; margin-bottom: 12px;">Explore more easy tutorials or check out our complete beginners library.</p>
            <a href="/#all-articles" class="btn-explore">Browse All 40 Guides</a>
          </div>
        </section>

        <!-- Ad Slot Position 3 — End of Article -->
        <div class="ad-slot" style="background:#e8ebfc;border:1.5px dashed #c9cfe8;border-radius:8px;padding:18px;text-align:center;color:#888;font-size:12px;margin:28px 0;min-height:90px;display:flex;align-items:center;justify-content:center;">
          Ad Space — 728&times;90
        </div>

        <!-- Related Articles -->
        <section class="related-articles">
          <h3>Related Tutorials</h3>
          <div class="articles-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            ${relatedHtml}
          </div>
        </section>
      </article>

      <!-- RIGHT COLUMN (30% SIDEBAR) -->
      <aside class="article-sidebar">
        <!-- Search Widget -->
        <div class="sidebar-widget">
          <h4 class="widget-title">Search Guides</h4>
          <form class="sidebar-search-form" action="/#all-articles" method="GET">
            <input type="text" class="sidebar-search-input" placeholder="Search guides..." aria-label="Search guides">
            <button type="submit" class="sidebar-search-btn">Go</button>
          </form>
        </div>

        <!-- Categories Widget with Counts -->
        <div class="sidebar-widget">
          <h4 class="widget-title">Categories</h4>
          <ul class="sidebar-cat-list">
            <li><a href="/#android"><span>Android</span> <span class="sidebar-cat-count">10</span></a></li>
            <li><a href="/#tools"><span>Online Tools</span> <span class="sidebar-cat-count">12</span></a></li>
            <li><a href="/#fix-it"><span>Fix It</span> <span class="sidebar-cat-count">8</span></a></li>
            <li><a href="/#apps"><span>Apps</span> <span class="sidebar-cat-count">6</span></a></li>
            <li><a href="/#beginner"><span>Beginner</span> <span class="sidebar-cat-count">4</span></a></li>
          </ul>
        </div>

        <!-- Popular Articles Widget (5 links) -->
        <div class="sidebar-widget">
          <h4 class="widget-title">Popular Tutorials</h4>
          <ul class="popular-posts-list">
            ${popularListHtml}
          </ul>
        </div>

        <!-- Sidebar Ad Slot (300x250) -->
        <div class="ad-slot" style="background:#e8ebfc;border:1.5px dashed #c9cfe8;border-radius:8px;padding:18px;text-align:center;color:#888;font-size:12px;min-height:250px;display:flex;align-items:center;justify-content:center;">
          Ad Space — 300&times;250
        </div>
      </aside>
    </div>
  </main>

  ${renderFooter(true)}

  <script src="/js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(articlesDir, `${article.slug}.html`), articleHtml, 'utf8');
});

console.log(`Generated all ${allArticles.length} article pages in /articles/`);

// ==========================================================================
// 2. GENERATE HOMEPAGE (index.html)
// ==========================================================================
// Featured articles: 6 popular guides
const featuredArticles = allArticles.slice(0, 6);

// Build featured HTML
const featuredCardsHtml = featuredArticles.map((art) => {
  const cat = getCategoryInfo(art.category);
  return `
      <div class="article-card" data-category="${cat.filterId}">
        <img src="${getArticleCardImageUrl(art.slug)}" alt="${art.title}" class="article-card-img" loading="lazy" width="600" height="340">
        <div class="article-card-body">
          <span class="category-tag ${cat.class}">${cat.name}</span>
          <h3 class="article-card-title"><a href="/articles/${art.slug}.html">${art.title}</a></h3>
          <p class="article-card-excerpt">${art.description}</p>
          <div class="article-card-footer">
            <span class="read-time">${art.readTime}</span>
            <a href="/articles/${art.slug}.html" class="read-more-link">Read More &rarr;</a>
          </div>
        </div>
      </div>`;
}).join('');

// Build all 40 articles HTML
const allCardsHtml = allArticles.map((art) => {
  const cat = getCategoryInfo(art.category);
  return `
      <div class="article-card" data-category="${cat.filterId}">
        <img src="${getArticleCardImageUrl(art.slug)}" alt="${art.title}" class="article-card-img" loading="lazy" width="600" height="340">
        <div class="article-card-body">
          <span class="category-tag ${cat.class}">${cat.name}</span>
          <h3 class="article-card-title"><a href="/articles/${art.slug}.html">${art.title}</a></h3>
          <p class="article-card-excerpt">${art.description}</p>
          <div class="article-card-footer">
            <span class="read-time">${art.readTime}</span>
            <a href="/articles/${art.slug}.html" class="read-more-link">Read More &rarr;</a>
          </div>
        </div>
      </div>`;
}).join('');

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ToolTutors | Simple Tech Guides for Everyone</title>
  <meta name="description" content="Simple, step-by-step tech tutorials for everyone. Learn Android tips, ChatGPT, Canva, Google Sheets, WhatsApp, and fix common software problems.">
  <link rel="canonical" href="https://tooltutors.online/">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="ToolTutors | Simple Tech Guides for Everyone">
  <meta property="og:description" content="Simple, step-by-step tech tutorials for everyone. Master smartphones, online tools, and solve everyday software issues with ease.">
  <meta property="og:url" content="https://tooltutors.online/">
  <meta property="og:site_name" content="ToolTutors">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">

  <!-- WebSite Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ToolTutors",
    "url": "https://tooltutors.online",
    "description": "Simple Tech Guides for Everyone",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tooltutors.online/#all-articles?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>
</head>
<body>
  <!-- Reading Progress Bar -->
  <div id="reading-progress"></div>

  ${renderNavBar(false)}

  <!-- Hero Section -->
  <header class="hero">
    <!-- 3 Floating Blurred Blob Shapes -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="hero-content">
      <!-- Badge Pill (NO icons) -->
      <div class="badge-pill">Simple Tech Guides for Everyone</div>
      
      <!-- H1 with wavy underline on "Tech Skill" -->
      <h1>Learn Any <span class="wavy-underline">Tech Skill</span> in Minutes</h1>
      
      <p class="hero-subtitle">Step-by-step tutorials for Android, apps &amp; online tools. No jargon. Just clear guides.</p>
      
      <!-- Two CTA buttons side by side -->
      <div class="hero-buttons">
        <a href="#all-articles" class="btn-hero-primary"><span>Browse Tutorials</span></a>
        <a href="/about.html" class="btn-hero-secondary">About Us</a>
      </div>

      <!-- Search bar below buttons (NO icons) -->
      <div class="search-bar-wrap">
        <form class="hero-search-bar" action="#all-articles" method="GET">
          <input type="text" id="search-input" placeholder="Search tutorials... e.g. How to use ChatGPT" aria-label="Search tutorials">
          <button type="submit">Search</button>
        </form>
      </div>
    </div>

    <!-- Scroll down bounce arrow at bottom center (SVG chevron) -->
    <a href="#stats-bar" class="scroll-indicator" aria-label="Scroll to stats">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </a>
  </header>

  <!-- Full Width Stats Bar (#0f0f2d) with simple inline white SVGs -->
  <section class="stats-bar" id="stats-bar">
    <!-- Stat 1: Book SVG -->
    <div class="stat-item">
      <div class="stat-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="stat-number">40+</div>
      <div class="stat-label">Tutorials Available</div>
    </div>

    <!-- Stat 2: Grid SVG -->
    <div class="stat-item">
      <div class="stat-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      </div>
      <div class="stat-number">5</div>
      <div class="stat-label">Core Categories</div>
    </div>

    <!-- Stat 3: Refresh SVG -->
    <div class="stat-item">
      <div class="stat-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </div>
      <div class="stat-number">Updated Weekly</div>
      <div class="stat-label">Tested for Accuracy</div>
    </div>

    <!-- Stat 4: Star SVG -->
    <div class="stat-item">
      <div class="stat-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div class="stat-number">100% Free</div>
      <div class="stat-label">No Paywall Ever</div>
    </div>
  </section>

  <!-- Leaderboard Ad Slot (Below Stats) -->
  <div class="container" style="padding-top: 24px; padding-bottom: 8px;">
    <div class="ad-slot" style="background:#e8ebfc;border:1.5px dashed #c9cfe8;border-radius:8px;padding:18px;text-align:center;color:#888;font-size:12px;margin:16px auto;max-width:728px;min-height:90px;display:flex;align-items:center;justify-content:center;">
      Ad Space — 728&times;90
    </div>
  </div>

  <!-- Browse by Category Section -->
  <section class="category-section" id="categories">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Browse by Category</h2>
        <p class="section-subtitle">Explore organized collections of clear step-by-step guides</p>
      </div>

      <!-- Category Filter Tabs (working JS) -->
      <div class="filter-tabs">
        <button type="button" class="filter-btn category-btn active" data-category="all">All Guides</button>
        <button type="button" class="filter-btn category-btn" data-category="android">Android</button>
        <button type="button" class="filter-btn category-btn" data-category="tools">Online Tools</button>
        <button type="button" class="filter-btn category-btn" data-category="fix-it">Fix It</button>
        <button type="button" class="filter-btn category-btn" data-category="apps">Apps</button>
        <button type="button" class="filter-btn category-btn" data-category="beginner">Beginner</button>
      </div>

      <!-- 5 Category Cards with permanent Unsplash images + colored bottom borders -->
      <div class="category-grid">
        <!-- 1. Android -->
        <div class="category-card category-btn cat-android" data-category="android">
          <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop" alt="Android Tutorials" class="category-card-img" loading="lazy" width="400" height="250">
          <div class="category-card-body">
            <div class="category-name">Android</div>
            <div class="category-count">10 Guides</div>
          </div>
        </div>

        <!-- 2. Tools -->
        <div class="category-card category-btn cat-tools" data-category="tools">
          <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop" alt="Online Tools" class="category-card-img" loading="lazy" width="400" height="250">
          <div class="category-card-body">
            <div class="category-name">Online Tools</div>
            <div class="category-count">12 Guides</div>
          </div>
        </div>

        <!-- 3. Fix It -->
        <div class="category-card category-btn cat-fix" data-category="fix-it">
          <img src="https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=250&fit=crop" alt="Fix It and Troubleshoot" class="category-card-img" loading="lazy" width="400" height="250">
          <div class="category-card-body">
            <div class="category-name">Fix It</div>
            <div class="category-count">8 Guides</div>
          </div>
        </div>

        <!-- 4. Apps -->
        <div class="category-card category-btn cat-apps" data-category="apps">
          <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop" alt="App Walkthroughs" class="category-card-img" loading="lazy" width="400" height="250">
          <div class="category-card-body">
            <div class="category-name">Apps</div>
            <div class="category-count">6 Guides</div>
          </div>
        </div>

        <!-- 5. Beginner -->
        <div class="category-card category-btn cat-beginner" data-category="beginner">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop" alt="Beginner Essentials" class="category-card-img" loading="lazy" width="400" height="250">
          <div class="category-card-body">
            <div class="category-name">Beginner</div>
            <div class="category-count">4 Guides</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Articles Section (6 Cards in 3-col grid) -->
  <section class="featured-section" id="featured-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Featured Guides</h2>
        <p class="section-subtitle">Our most popular and essential walkthroughs for beginners</p>
      </div>

      <div class="articles-grid">
        ${featuredCardsHtml}
      </div>
    </div>
  </section>

  <!-- All 40 Articles Grid -->
  <section class="all-articles-section" id="all-articles">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">All Tutorials (<span id="results-count">40</span>)</h2>
        <p class="section-subtitle">Search or filter through our complete index of step-by-step guides</p>
      </div>

      <!-- Secondary Filter Bar -->
      <div class="filter-tabs">
        <button type="button" class="filter-btn category-btn active" data-category="all">All</button>
        <button type="button" class="filter-btn category-btn" data-category="android">Android</button>
        <button type="button" class="filter-btn category-btn" data-category="tools">Online Tools</button>
        <button type="button" class="filter-btn category-btn" data-category="fix-it">Fix It</button>
        <button type="button" class="filter-btn category-btn" data-category="apps">Apps</button>
        <button type="button" class="filter-btn category-btn" data-category="beginner">Beginner</button>
      </div>

      <div id="no-results" style="display: none; text-align: center; padding: 40px; color: var(--text-muted); font-size: 15px;">
        No guides found matching your search. Try searching for "Android", "WiFi", "ChatGPT", "Canva", or "Battery".
      </div>

      <div class="all-articles-grid">
        ${allCardsHtml}
      </div>
    </div>
  </section>

  <!-- Why ToolTutors Section (Dark Gradient + 3 Columns + 40px SVGs) -->
  <section class="why-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Why ToolTutors?</h2>
        <p class="section-subtitle" style="color: rgba(255,255,255,0.7);">Built from the ground up to make learning technology completely painless.</p>
      </div>

      <div class="why-grid">
        <!-- Feature 1: Beginner Friendly -->
        <div class="why-col">
          <div class="why-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3 class="why-col-title">Beginner Friendly</h3>
          <p class="why-col-text">No tech jargon. Every guide is written in plain English that anyone can follow, step-by-step from start to finish.</p>
        </div>

        <!-- Feature 2: Always Up to Date -->
        <div class="why-col">
          <div class="why-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </div>
          <h3 class="why-col-title">Always Up to Date</h3>
          <p class="why-col-text">Our tutorials are reviewed and updated regularly to match the latest app releases, operating system versions, and UI redesigns.</p>
        </div>

        <!-- Feature 3: Completely Free -->
        <div class="why-col">
          <div class="why-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3 class="why-col-title">Completely Free</h3>
          <p class="why-col-text">All guides are 100% free. No required signups, no subscriptions, and no paywalls. Just honest, helpful tech knowledge.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Section (#f0f2ff, 50px 40px) -->
  <section class="newsletter-section">
    <div class="container">
      <h2 class="newsletter-title">Stay Updated</h2>
      <p class="newsletter-subtitle">Get new tutorials delivered straight to your inbox weekly</p>
      
      <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Thank you for subscribing to ToolTutors! We will keep you updated with new tutorials.'); this.reset();">
        <input type="email" class="newsletter-input" placeholder="Enter your email address" required aria-label="Email address">
        <button type="submit" class="newsletter-btn">Subscribe</button>
      </form>
      <p class="newsletter-note">No spam. Unsubscribe anytime with a single click.</p>
    </div>
  </section>

  ${renderFooter(false)}

  <script src="/js/main.js"></script>
</body>
</html>`;

fs.writeFileSync(path.resolve('index.html'), indexHtml, 'utf8');
console.log('Generated index.html successfully!');


// ==========================================================================
// 3. GENERATE ABOUT US PAGE (about.html)
// ==========================================================================
const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | ToolTutors</title>
  <meta name="description" content="About ToolTutors — Simple, jargon-free tech guides for everyone worldwide. Meet our mission and editorial standards.">
  <link rel="canonical" href="https://tooltutors.online/about.html">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="About Us | ToolTutors">
  <meta property="og:description" content="Simple, tested tech tutorials for beginners worldwide.">
  <meta property="og:url" content="https://tooltutors.online/about.html">
  <meta property="og:site_name" content="ToolTutors">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <!-- Reading Progress Bar -->
  <div id="reading-progress"></div>

  ${renderNavBar(false)}

  <!-- 400px Hero -->
  <header class="page-hero">
    <div class="container">
      <nav class="breadcrumb-white" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>&rsaquo;</span>
        <span>About Us</span>
      </nav>
      <h1>About Us</h1>
      <p class="page-hero-subtitle">Demystifying technology through simple, empathetic, step-by-step guides.</p>
    </div>
  </header>

  <!-- Main Content Card -->
  <main class="container">
    <div class="static-page-card">
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop" alt="ToolTutors Team and Workspace" style="width: 100%; max-height: 420px; object-fit: cover; border-radius: 8px; margin-bottom: 30px;" loading="lazy">

      <h2>Our Story: Technology Should Be Simple</h2>
      <p>ToolTutors was created out of a simple observation: modern technology moves at lightning speed, but most tutorials and user manuals are written by engineers for other engineers. When an everyday user searches for how to fix a slow Android device, how to craft a prompt in ChatGPT, or how to organize data in Google Sheets, they are frequently confronted with walls of acronyms, bloated pages, and confusing technical jargon.</p>
      
      <p>We believe that anyone, regardless of their background or comfort level with electronics, should be able to master digital tools. Whether you are using a smartphone for the first time, learning how to collaborate on a digital whiteboard, or trying to recover storage space on your device, technology should empower your daily life rather than cause frustration.</p>

      <p>That is why every single guide on ToolTutors is written in plain, friendly English with clear numbered steps, highlighted tip callouts, and real-world screenshots. We test each procedure ourselves before publishing, ensuring that what you see on your screen matches what we describe on ours.</p>

      <!-- 3 Value Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: 36px 0;">
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 24px;">
          <h3 style="font-size: 17px; margin-bottom: 8px; color: var(--primary);">1. Beginner Friendly</h3>
          <p style="font-size: 14px; color: var(--text-body); margin: 0;">We ban unnecessary jargon. Every concept is explained patiently with clear analogies and step-by-step actions.</p>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 24px;">
          <h3 style="font-size: 17px; margin-bottom: 8px; color: var(--primary-dark);">2. 100% Free</h3>
          <p style="font-size: 14px; color: var(--text-body); margin: 0;">No hidden subscriptions, no gated articles, and no paywalls. Useful digital knowledge should be openly accessible to everyone.</p>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 24px;">
          <h3 style="font-size: 17px; margin-bottom: 8px; color: #d4445c;">3. Always Updated</h3>
          <p style="font-size: 14px; color: var(--text-body); margin: 0;">Operating systems update and web applications redesign their menus. We regularly review our tutorials so steps remain accurate.</p>
        </div>
      </div>

      <!-- Contact CTA Section -->
      <div style="background: #f0f2ff; border-radius: 8px; padding: 32px; text-align: center; margin-top: 40px;">
        <h3 style="font-size: 20px; margin-bottom: 8px;">Have a Question or Tutorial Request?</h3>
        <p style="font-size: 14px; color: #666; max-width: 520px; margin: 0 auto 18px;">We love hearing from our readers. If there is a tool or smartphone problem you would like us to cover, reach out to our team!</p>
        <a href="/contact.html" class="btn-explore" style="padding: 10px 24px; font-size: 14px;">Contact Our Team</a>
      </div>
    </div>
  </main>

  ${renderFooter(false)}

  <script src="/js/main.js"></script>
</body>
</html>`;

fs.writeFileSync(path.resolve('about.html'), aboutHtml, 'utf8');
console.log('Generated about.html successfully!');


// ==========================================================================
// 4. GENERATE CONTACT US PAGE (contact.html)
// ==========================================================================
const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us | ToolTutors</title>
  <meta name="description" content="Contact ToolTutors — Have a question, tutorial suggestion, or feedback? Send us a message or reach us directly at admin@tooltutors.online.">
  <link rel="canonical" href="https://tooltutors.online/contact.html">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Contact Us | ToolTutors">
  <meta property="og:description" content="Reach out to the ToolTutors team with feedback, tutorial requests, or questions.">
  <meta property="og:url" content="https://tooltutors.online/contact.html">
  <meta property="og:site_name" content="ToolTutors">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <!-- Reading Progress Bar -->
  <div id="reading-progress"></div>

  ${renderNavBar(false)}

  <!-- 400px Hero -->
  <header class="page-hero">
    <div class="container">
      <nav class="breadcrumb-white" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>&rsaquo;</span>
        <span>Contact Us</span>
      </nav>
      <h1>Contact Us</h1>
      <p class="page-hero-subtitle">We would love to hear from you. Send us your feedback, questions, or guide requests.</p>
    </div>
  </header>

  <!-- Contact Form in White Card with Shadow -->
  <main class="container">
    <div class="contact-card">
      <form class="contact-form" onsubmit="event.preventDefault(); document.getElementById('contact-success').style.display='block'; this.reset();">
        <div id="contact-success" style="display:none; background:#d4edda; color:#155724; border:1px solid #c3e6cb; border-radius:6px; padding:16px; margin-bottom:12px; font-size:14px;">
          Thank you! Your message has been received. Our editorial team will get back to you within 24 to 48 hours.
        </div>

        <div class="form-group">
          <label for="name" class="form-label">Your Name</label>
          <input type="text" id="name" class="form-input" placeholder="e.g. Alex Johnson" required>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Your Email</label>
          <input type="email" id="email" class="form-input" placeholder="e.g. alex@example.com" required>
        </div>

        <div class="form-group">
          <label for="subject" class="form-label">Subject</label>
          <input type="text" id="subject" class="form-input" placeholder="e.g. Question about Canva tutorial" required>
        </div>

        <div class="form-group">
          <label for="message" class="form-label">Your Message</label>
          <textarea id="message" class="form-textarea" placeholder="Describe your question or tutorial recommendation here..." required></textarea>
        </div>

        <button type="submit" class="btn-submit">Send Message</button>
      </form>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border); text-align: center; font-size: 13px; color: var(--text-muted);">
        Direct Editorial Email: <a href="mailto:admin@tooltutors.online" style="color: var(--primary); font-weight: 600;">admin@tooltutors.online</a>
      </div>
    </div>
  </main>

  ${renderFooter(false)}

  <script src="/js/main.js"></script>
</body>
</html>`;

fs.writeFileSync(path.resolve('contact.html'), contactHtml, 'utf8');
console.log('Generated contact.html successfully!');


// ==========================================================================
// 5. GENERATE LEGAL PAGES (privacy-policy.html, disclaimer.html, terms.html)
// ==========================================================================
const privacyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy | ToolTutors</title>
  <meta name="description" content="Privacy Policy for ToolTutors. Learn how we collect, handle, and safeguard user data and advertising privacy.">
  <link rel="canonical" href="https://tooltutors.online/privacy-policy.html">
  <meta name="robots" content="index, follow">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  ${renderNavBar(false)}
  <main class="container">
    <div class="static-page-card">
      <h1>Privacy Policy</h1>
      <p class="page-subtitle">Last updated: January 2025</p>

      <p>At ToolTutors (tooltutors.online), your privacy is of utmost importance to us. This Privacy Policy outlines the types of information we collect when you visit our website, how we utilize that information, and the steps we take to protect your data.</p>

      <h2>1. Information We Collect</h2>
      <p>When you visit ToolTutors, we may collect standard internet log information and visitor behavior patterns through analytics and advertising networks. This includes your IP address, browser type, referring pages, time spent on pages, and general geographic location.</p>

      <h2>2. Cookies and Web Beacons</h2>
      <p>ToolTutors and our third-party advertising partners (such as RevBid and Google AdSense) may utilize cookies to store information about your preferences, record user-specific information on which pages you access, and customize content based on browser type or other data.</p>

      <h2>3. Third-Party Advertising</h2>
      <p>Third-party advertising networks serve advertisements on ToolTutors. These vendors may automatically receive your IP address when ad requests occur. They may also use cookies, JavaScript, or Web Beacons to gauge the effectiveness of their campaigns and personalize advertising content.</p>

      <h2>4. Contact Us</h2>
      <p>If you have any questions regarding this Privacy Policy, you may contact us anytime at <a href="mailto:admin@tooltutors.online">admin@tooltutors.online</a>.</p>
    </div>
  </main>
  ${renderFooter(false)}
  <script src="/js/main.js"></script>
</body>
</html>`;
fs.writeFileSync(path.resolve('privacy-policy.html'), privacyHtml, 'utf8');

const disclaimerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Disclaimer | ToolTutors</title>
  <meta name="description" content="Editorial and affiliate disclaimer for ToolTutors.">
  <link rel="canonical" href="https://tooltutors.online/disclaimer.html">
  <meta name="robots" content="index, follow">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  ${renderNavBar(false)}
  <main class="container">
    <div class="static-page-card">
      <h1>Disclaimer</h1>
      <p class="page-subtitle">Last updated: January 2025</p>

      <h2>1. Educational and Informational Purposes</h2>
      <p>All content provided on ToolTutors (tooltutors.online) is published in good faith and strictly for general educational and informational purposes. While our editorial team makes every reasonable effort to test software steps, we make no representations or warranties of any kind regarding accuracy or completeness.</p>

      <h2>2. User Responsibility</h2>
      <p>Any action you take based on information found on this website is taken strictly at your own risk. ToolTutors will not be liable for any data loss, hardware malfunctions, software glitches, or unintended consequences resulting from tutorials.</p>

      <h2>3. Contact</h2>
      <p>For questions regarding our editorial disclosures, please email <a href="mailto:admin@tooltutors.online">admin@tooltutors.online</a>.</p>
    </div>
  </main>
  ${renderFooter(false)}
  <script src="/js/main.js"></script>
</body>
</html>`;
fs.writeFileSync(path.resolve('disclaimer.html'), disclaimerHtml, 'utf8');

const termsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Use | ToolTutors</title>
  <meta name="description" content="Terms of Use for accessing and browsing ToolTutors.">
  <link rel="canonical" href="https://tooltutors.online/terms.html">
  <meta name="robots" content="index, follow">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  ${renderNavBar(false)}
  <main class="container">
    <div class="static-page-card">
      <h1>Terms of Use</h1>
      <p class="page-subtitle">Last updated: January 2025</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or utilizing ToolTutors (tooltutors.online), you signify your agreement to abide by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use our website.</p>

      <h2>2. Intellectual Property</h2>
      <p>All written articles, tutorials, branding, and layouts on ToolTutors are the exclusive intellectual property of ToolTutors, unless otherwise credited. You may not republish, duplicate, or scrape complete tutorial texts without explicit written permission.</p>

      <h2>3. Modifications</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of the website following any changes constitutes acceptance of the new terms.</p>
    </div>
  </main>
  ${renderFooter(false)}
  <script src="/js/main.js"></script>
</body>
</html>`;
fs.writeFileSync(path.resolve('terms.html'), termsHtml, 'utf8');


// ==========================================================================
// 6. GENERATE SITEMAP.XML, ROBOTS.TXT, AND ADS.TXT
// ==========================================================================
const todayIso = new Date().toISOString().split('T')[0];

const sitemapUrls = [
  { loc: 'https://tooltutors.online/', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://tooltutors.online/about.html', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://tooltutors.online/contact.html', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://tooltutors.online/privacy-policy.html', priority: '0.3', changefreq: 'yearly' },
  { loc: 'https://tooltutors.online/disclaimer.html', priority: '0.3', changefreq: 'yearly' },
  { loc: 'https://tooltutors.online/terms.html', priority: '0.3', changefreq: 'yearly' },
  ...allArticles.map(a => ({
    loc: `https://tooltutors.online/articles/${a.slug}.html`,
    priority: '0.8',
    changefreq: 'weekly'
  }))
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.resolve('sitemap.xml'), sitemapXml, 'utf8');
console.log(`Generated sitemap.xml with ${sitemapUrls.length} URLs.`);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://tooltutors.online/sitemap.xml
`;
fs.writeFileSync(path.resolve('robots.txt'), robotsTxt, 'utf8');

const adsTxt = `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
revbid.com, rev-XXXXXXXXXXXXXXXX, DIRECT, 9283471029384710
`;
fs.writeFileSync(path.resolve('ads.txt'), adsTxt, 'utf8');

console.log('Site generation completed successfully!');
