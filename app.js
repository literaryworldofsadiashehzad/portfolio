// Main UI Logic & Orchestrator
import { SLIDES_DATA, BOOKS_DATA, ANNOUNCEMENTS_DATA, BIO_PAGES } from './data.js';
import { 
  getBookStats, 
  incrementBookStat, 
  getBookRating, 
  submitBookRating, 
  listenToComments, 
  addComment 
} from './firebase.js';

// DOM Elements
let currentTab = 'home';
let currentSlideIndex = 0;
let carouselTimer = null;
let currentBioPageState = 0; // 0, 1, 2
const totalBioPageStates = 3;

// Session cache to prevent rating spam
const ratedBooks = new Set();

window.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // 1. WELCOME INTRO SCREEN ANIMATION
  initIntroScreen();

  // 2. TAB ROUTING & NAVIGATION
  initNavigation();

  // 3. HOMEPAGE BANNER SLIDER
  initCarousel();

  // 4. ABOUT PAGE 3D PAGE-FLIP
  initAboutBook();

  // 5. PORTFOLIO & DYNAMIC 3D BOOK CARDS
  initPortfolio();

  // 6. ANNOUNCEMENTS & DYNAMIC COMMENTS
  initAnnouncements();

  // 7. CONTACT FORM & WHATSAPP REDIRECT
  initContactForm();

  // Check initial location hash
  handleUrlHash();
});

// ==========================================
// 1. WELCOME INTRO SCREEN ANIMATION
// ==========================================
function initIntroScreen() {
  const introScreen = document.getElementById('intro-screen');
  const introContent = document.getElementById('intro-content');

  // Fade text in
  setTimeout(() => {
    introContent.classList.add('show');
    
    // Animate title letters with GSAP
    gsap.fromTo('.intro-title', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.2 }
    );
    gsap.fromTo('.intro-subtitle',
      { opacity: 0 },
      { opacity: 0.8, duration: 1, delay: 0.8 }
    );
    gsap.fromTo('.intro-divider',
      { width: 0 },
      { width: 80, duration: 1.5, ease: 'power2.inOut', delay: 0.4 }
    );

    // Hold, then fade screen out
    setTimeout(() => {
      // Smooth fade-out transitions
      introScreen.classList.add('fade-out');
      
      // Crossfade transition to home page components using GSAP
      gsap.fromTo('#home-section', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.2 }
      );

      // Clean up DOM node once opacity is zero
      setTimeout(() => {
        introScreen.style.display = 'none';
      }, 1000);
    }, 2800);
  }, 300);
}

// ==========================================
// 2. TAB ROUTING & NAVIGATION
// ==========================================
function initNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const sidebar = document.getElementById('sidebar');
  const hamburgerBtn = document.getElementById('hamburger-btn');

  // Sidebar Tabs Click Listener
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      navigateTo(tabId);
    });
  });

  // Mobile Hamburger Trigger
  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    const icon = hamburgerBtn.querySelector('i');
    
    if (sidebar.classList.contains('open')) {
      icon.setAttribute('data-lucide', 'x');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  });

  // Close sidebar on outer content click (on mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        hamburgerBtn.querySelector('i').setAttribute('data-lucide', 'menu');
        lucide.createIcons();
      }
    }
  });

  // Window Resize Watcher for Navigation Sidebar bounds
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
      hamburgerBtn.querySelector('i').setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    }
  });

  // Explore button links
  document.getElementById('bio-explore-btn').addEventListener('click', () => {
    navigateTo('portfolio');
  });
}

function handleUrlHash() {
  const hash = window.location.hash.substring(1);
  if (['home', 'portfolio', 'announcements', 'contact'].includes(hash)) {
    navigateTo(hash);
  }
}

function navigateTo(tabId) {
  if (tabId === currentTab) return;
  
  const currentSection = document.getElementById(`${currentTab}-section`);
  const targetSection = document.getElementById(`${tabId}-section`);

  if (!targetSection) return;

  // Slide/Fade Old section out
  gsap.to(currentSection, {
    opacity: 0,
    y: -15,
    duration: 0.3,
    onComplete: () => {
      currentSection.classList.remove('active');
      targetSection.classList.add('active');
      
      // Update Tab Sidebar Highlight active state
      document.querySelectorAll('.sidebar-item').forEach(li => {
        if (li.getAttribute('data-tab') === tabId) {
          li.classList.add('active');
        } else {
          li.classList.remove('active');
        }
      });

      // Update URL hash
      window.history.pushState(null, null, `#${tabId}`);
      currentTab = tabId;

      // Slide/Fade New section in
      gsap.fromTo(targetSection,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      // Re-trigger scroll observer bindings
      triggerScrollObserver();
    }
  });

  // Mobile Drawer Auto-close
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    document.getElementById('hamburger-btn').querySelector('i').setAttribute('data-lucide', 'menu');
    lucide.createIcons();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 3. HOMEPAGE BANNER SLIDER
// ==========================================
function initCarousel() {
  const wrapper = document.getElementById('slides-wrapper');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  wrapper.innerHTML = '';
  dotsContainer.innerHTML = '';

  // Render Slides and Navigation Indicators
  SLIDES_DATA.forEach((slide, index) => {
    const slideDiv = document.createElement('div');
    slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
    slideDiv.style.backgroundImage = `url('${slide.image}')`;
    slideDiv.innerHTML = `
      <div class="slide-content">
        <h2 class="slide-title">${slide.title}</h2>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <button class="slide-btn" data-target-tab="${slide.tab}" data-book-id="${slide.bookId || ''}">${slide.cta}</button>
      </div>
    `;
    wrapper.appendChild(slideDiv);

    const dot = document.createElement('button');
    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
    dot.ariaLabel = `Slide index ${index + 1}`;
    dot.addEventListener('click', () => {
      showSlide(index);
      restartCarouselTimer();
    });
    dotsContainer.appendChild(dot);
  });

  // Slide CTA click handler
  wrapper.querySelectorAll('.slide-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.getAttribute('data-target-tab');
      const bookId = e.target.getAttribute('data-book-id');
      
      navigateTo(tab);
      if (tab === 'portfolio' && bookId) {
        // Go straight to details page
        const book = BOOKS_DATA.find(b => b.id === bookId);
        if (book) {
          showCategoryDetails(book.category);
          // Wait briefly for details rendering, then scroll to specific book
          setTimeout(() => {
            const el = document.getElementById(`book-${bookId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    });
  });

  prevBtn.addEventListener('click', () => {
    changeSlide(-1);
    restartCarouselTimer();
  });

  nextBtn.addEventListener('click', () => {
    changeSlide(1);
    restartCarouselTimer();
  });

  startCarouselTimer();
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;

  slides[currentSlideIndex].classList.remove('active');
  dots[currentSlideIndex].classList.remove('active');

  currentSlideIndex = (index + slides.length) % slides.length;

  slides[currentSlideIndex].classList.add('active');
  dots[currentSlideIndex].classList.add('active');
}

function changeSlide(direction) {
  showSlide(currentSlideIndex + direction);
}

function startCarouselTimer() {
  carouselTimer = setInterval(() => {
    changeSlide(1);
  }, 6000);
}

function restartCarouselTimer() {
  clearInterval(carouselTimer);
  startCarouselTimer();
}

// ==========================================
// 4. ABOUT PAGE 3D PAGE-FLIP
// ==========================================
function initAboutBook() {
  const prevBtn = document.getElementById('book-prev');
  const nextBtn = document.getElementById('book-next');
  const sheets = document.querySelectorAll('#about-book .turning-sheet');

  prevBtn.addEventListener('click', () => {
    if (currentBioPageState > 0) {
      currentBioPageState--;
      renderBioFlip();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentBioPageState < totalBioPageStates - 1) {
      currentBioPageState++;
      renderBioFlip();
    }
  });

  // Direct sheet clicks (micro-interaction)
  sheets.forEach((sheet, idx) => {
    sheet.addEventListener('click', () => {
      // If clicking sheet front side, turn page forward
      if (currentBioPageState === idx) {
        currentBioPageState++;
        renderBioFlip();
      } 
      // If clicking sheet back side, turn page backward
      else if (currentBioPageState === idx + 1) {
        currentBioPageState--;
        renderBioFlip();
      }
    });
  });
}

function renderBioFlip() {
  const prevBtn = document.getElementById('book-prev');
  const nextBtn = document.getElementById('book-next');
  const indicator = document.getElementById('book-page-indicator');
  const sheet0 = document.getElementById('sheet-0');
  const sheet1 = document.getElementById('sheet-1');

  // State calculations
  if (currentBioPageState === 0) {
    sheet0.classList.remove('flipped');
    sheet1.classList.remove('flipped');
    
    // Set proper overlapping stack indexes
    sheet0.style.zIndex = '3';
    sheet1.style.zIndex = '2';
    
    prevBtn.disabled = true;
    nextBtn.disabled = false;
  } 
  else if (currentBioPageState === 1) {
    sheet0.classList.add('flipped');
    sheet1.classList.remove('flipped');
    
    // Sheet0 flipped to the left, sheet1 sits on top on the right
    sheet0.style.zIndex = '2';
    sheet1.style.zIndex = '3';
    
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  } 
  else if (currentBioPageState === 2) {
    sheet0.classList.add('flipped');
    sheet1.classList.add('flipped');
    
    sheet0.style.zIndex = '2';
    sheet1.style.zIndex = '3'; // Sheet1 flipped to the left on top of Sheet0
    
    prevBtn.disabled = false;
    nextBtn.disabled = true;
  }

  indicator.textContent = `Page ${currentBioPageState + 1} of ${totalBioPageStates}`;
}

// ==========================================
// 5. PORTFOLIO & DYNAMIC 3D BOOK CARDS
// ==========================================
function initPortfolio() {
  const categoryCards = document.querySelectorAll('.category-card');
  const backBtn = document.getElementById('back-to-categories-btn');

  // Category Selector Cards
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.getAttribute('data-category');
      showCategoryDetails(category);
    });
  });

  // Back navigation button
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const booksView = document.getElementById('portfolio-books-view');
    const categoriesView = document.getElementById('portfolio-categories-view');
    
    gsap.to(booksView, {
      opacity: 0,
      y: 15,
      duration: 0.3,
      onComplete: () => {
        booksView.classList.remove('active');
        categoriesView.classList.add('active');
        gsap.fromTo(categoriesView, 
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.4 }
        );
      }
    });
  });

  // Dynamic listener for stats/ratings updates (from firebase)
  window.addEventListener('statsUpdated', (e) => {
    const { bookId, stats } = e.detail;
    const book = BOOKS_DATA.find(b => b.id === bookId);
    if (book) {
      const combinedStats = {
        views: book.defaultViews + (stats.views || 0),
        reads: book.defaultReads + (stats.reads || 0) + (stats.downloads || 0)
      };
      updateBookStatsUI(bookId, combinedStats);
    }
  });

  window.addEventListener('ratingUpdated', (e) => {
    const { bookId, ratings } = e.detail;
    const book = BOOKS_DATA.find(b => b.id === bookId);
    if (book) {
      const combinedRatings = {
        ratingSum: book.defaultRatingSum + (ratings.ratingSum || 0),
        ratingCount: book.defaultRatingCount + (ratings.ratingCount || 0)
      };
      updateBookRatingsUI(bookId, combinedRatings);
    }
  });
}

async function showCategoryDetails(categoryName) {
  const booksView = document.getElementById('portfolio-books-view');
  const categoriesView = document.getElementById('portfolio-categories-view');
  const titleEl = document.getElementById('current-category-title');
  const gridContainer = document.getElementById('books-grid-container');

  titleEl.textContent = `${categoryName} Collection`;
  gridContainer.innerHTML = '';

  // Filter book items
  const books = BOOKS_DATA.filter(b => b.category === categoryName);

  if (books.length === 0) {
    gridContainer.innerHTML = `<p class="comments-empty-message">No works published in this category yet. Check back soon!</p>`;
  } else {
    // Generate Cards
    books.forEach(book => {
      const card = createBookCardElement(book);
      gridContainer.appendChild(card);

      // Async fetch ratings/stats and update UI
      fetchAndSyncBookLiveMeta(book.id, book);
    });
  }

  // Handle Tab Switch transition
  gsap.to(categoriesView, {
    opacity: 0,
    y: 15,
    duration: 0.3,
    onComplete: () => {
      categoriesView.classList.remove('active');
      booksView.classList.add('active');
      gsap.fromTo(booksView,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
      // Initialize icons in the grid
      lucide.createIcons();
    }
  });
}

function createBookCardElement(book) {
  const div = document.createElement('article');
  div.className = 'book-entry';
  div.id = `book-${book.id}`;

  // Cover image block or custom styled 3D leather block
  let coverHtml = '';
  if (book.coverImage) {
    coverHtml = `<div class="book-3d-cover" style="background-image: url('${book.coverImage}')">
      <div class="book-3d-cover-spine-crease"></div>
    </div>`;
  } else {
    coverHtml = `
      <div class="book-3d-cover style-${book.coverStyle}">
        <div class="book-3d-cover-spine-crease"></div>
        <div class="book-cover-ornament">
          <div class="author">Sadia Shahzad</div>
          <div class="title">${book.title}</div>
          <i data-lucide="feather"></i>
        </div>
      </div>
    `;
  }

  // Form average ratings
  const initialAvg = (book.defaultRatingSum / book.defaultRatingCount).toFixed(1);
  const starsBarHtml = getStarsBarHtml(initialAvg, false);

  div.innerHTML = `
    <div class="book-3d-wrapper">
      <div class="book-3d">
        ${coverHtml}
      </div>
    </div>
    
    <h3 class="book-title">${book.title}</h3>
    
    <div class="rating-bar" id="rating-bar-${book.id}">
      <span class="rating-value" id="rating-value-avg-${book.id}">${initialAvg} / 5</span>
      <div class="rating-stars" id="rating-stars-container-${book.id}">
        ${starsBarHtml}
      </div>
      <span class="rating-value" id="rating-count-${book.id}">(${book.defaultRatingCount} reviews)</span>
    </div>

    <div class="book-stats" id="book-stats-${book.id}">
      <span title="Views count"><i data-lucide="eye" style="width: 13px; height: 13px; vertical-align: middle;"></i> <span class="val">${book.defaultViews}</span></span>
      <span title="Reads / Downloads count"><i data-lucide="book-open" style="width: 13px; height: 13px; vertical-align: middle;"></i> <span class="val">${book.defaultReads}</span></span>
    </div>
    
    <p class="book-synopsis">${book.synopsis}</p>
    
    <div class="book-actions">
      <button class="book-btn read" data-id="${book.id}" data-url="${book.pdfUrl}">
        <i data-lucide="book-open" style="width: 12px; height: 12px;"></i>
        <span>Read</span>
      </button>
      <button class="book-btn download" data-id="${book.id}" data-url="${book.pdfUrl}">
        <i data-lucide="download" style="width: 12px; height: 12px;"></i>
        <span>Download</span>
      </button>
    </div>
  `;

  // Attach button triggers
  const readBtn = div.querySelector('.book-btn.read');
  const downloadBtn = div.querySelector('.book-btn.download');

  readBtn.addEventListener('click', async () => {
    // Open novel preview window/tab
    window.open(book.pdfUrl, '_blank');
    // Increment Firebase reads count
    incrementBookStat(book.id, 'reads');
  });

  downloadBtn.addEventListener('click', async () => {
    // Trigger download
    const link = document.createElement('a');
    link.href = book.pdfUrl;
    link.download = `${book.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increment Firebase downloads count
    incrementBookStat(book.id, 'downloads');
  });

  // Track page view event immediately as it scrolls into user layout
  incrementBookStat(book.id, 'views');

  return div;
}

function getStarsBarHtml(ratingVal, interactive = false) {
  const rating = parseFloat(ratingVal) || 0;
  let starsHtml = '';
  
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= Math.round(rating);
    const starClass = isFilled ? 'filled' : '';
    
    if (interactive) {
      starsHtml += `<button class="star-btn ${starClass}" data-rating="${i}"><i data-lucide="star"></i></button>`;
    } else {
      starsHtml += `<span class="star-btn ${starClass}"><i data-lucide="star"></i></span>`;
    }
  }
  return starsHtml;
}

async function fetchAndSyncBookLiveMeta(bookId, localData) {
  try {
    // 1. Fetch ratings
    const dbRatings = await getBookRating(bookId);
    let totalSum = localData.defaultRatingSum;
    let totalCount = localData.defaultRatingCount;

    if (dbRatings && dbRatings.ratingCount > 0) {
      // Add up local metadata overrides with database dynamic values
      totalSum = localData.defaultRatingSum + dbRatings.ratingSum;
      totalCount = localData.defaultRatingCount + dbRatings.ratingCount;
    }
    
    updateBookRatingsUI(bookId, { ratingSum: totalSum, ratingCount: totalCount });

    // 2. Fetch view/read stats
    const dbStats = await getBookStats(bookId);
    const combinedStats = {
      views: localData.defaultViews + (dbStats.views || 0),
      reads: localData.defaultReads + (dbStats.reads || 0) + (dbStats.downloads || 0)
    };
    updateBookStatsUI(bookId, combinedStats);

  } catch (error) {
    console.error(`Error syncing database metrics for book ${bookId}:`, error);
  }
}

function updateBookStatsUI(bookId, stats) {
  const container = document.getElementById(`book-stats-${bookId}`);
  if (!container) return;

  const countElements = container.querySelectorAll('.val');
  if (countElements.length >= 2) {
    // Views is index 0
    countElements[0].textContent = stats.views;
    // Reads + Downloads is index 1
    countElements[1].textContent = stats.reads;
  }
}

function updateBookRatingsUI(bookId, ratings) {
  const ratingBar = document.getElementById(`rating-bar-${bookId}`);
  if (!ratingBar) return;

  const totalSum = ratings.ratingSum;
  const totalCount = ratings.ratingCount;
  const avg = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : "0.0";

  const avgValEl = document.getElementById(`rating-value-avg-${bookId}`);
  const starsContainer = document.getElementById(`rating-stars-container-${bookId}`);
  const reviewCountEl = document.getElementById(`rating-count-${bookId}`);

  if (avgValEl) avgValEl.textContent = `${avg} / 5`;
  if (reviewCountEl) reviewCountEl.textContent = `(${totalCount} reviews)`;

  // Check if reader has already rated in this session
  const isInteractive = !ratedBooks.has(bookId);
  
  if (starsContainer) {
    starsContainer.className = `rating-stars ${isInteractive ? 'interactive' : ''}`;
    starsContainer.innerHTML = getStarsBarHtml(avg, isInteractive);
    lucide.createIcons({ attrs: { class: 'lucide-star-custom' } });

    // Hook up star hover/clicks if interactive
    if (isInteractive) {
      const starBtns = starsContainer.querySelectorAll('.star-btn');
      
      starBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
          const starsChosen = parseInt(btn.getAttribute('data-rating'));
          ratedBooks.add(bookId); // Block further reviews this session
          
          // Submit rating to Firebase
          await submitBookRating(bookId, starsChosen);
        });
      });
    }
  }
}

// ==========================================
// 6. ANNOUNCEMENTS & DYNAMIC COMMENTS
// ==========================================
function initAnnouncements() {
  const container = document.getElementById('announcements-container');
  container.innerHTML = '';

  // Announcements array renders in reverse chronological order
  ANNOUNCEMENTS_DATA.forEach(ann => {
    const card = document.createElement('article');
    card.className = 'announcement-card';
    card.id = `announcement-${ann.id}`;

    // Render announcement body
    card.innerHTML = `
      ${ann.image ? `<img src="${ann.image}" alt="Feature Announcement Banner" class="announcement-img">` : ''}
      
      <div class="announcement-header">
        <h3 class="announcement-title">${ann.title}</h3>
        <div class="announcement-date">
          <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
          <span>${ann.date}</span>
        </div>
      </div>
      
      <div class="announcement-body">
        <p>${ann.content}</p>
      </div>

      <!-- Live Dynamic Comment Board -->
      <div class="announcement-comments-section">
        <h4 class="comments-section-title">
          <i data-lucide="message-square" style="width: 16px; height: 16px;"></i>
          <span>Comments</span>
        </h4>
        
        <!-- Comment submission form -->
        <form class="comment-form" data-ann-id="${ann.id}">
          <div class="comment-form-row">
            <input type="text" class="comment-input author-name" placeholder="Your Name" required maxlength="50">
          </div>
          <textarea class="comment-input comment-text-val" placeholder="Add to the discussion..." required maxlength="300"></textarea>
          <button type="submit" class="comment-submit-btn">
            <span>Post Comment</span>
            <i data-lucide="send" style="width: 12px; height: 12px;"></i>
          </button>
        </form>

        <!-- Live Comments feed -->
        <div class="comments-list" id="comments-list-${ann.id}">
          <p class="comments-empty-message">Loading comments...</p>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Form submit listener
    const form = card.querySelector('.comment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = form.querySelector('.author-name');
      const textInput = form.querySelector('.comment-text-val');
      const submitBtn = form.querySelector('.comment-submit-btn');

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      try {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Posting...';
        
        await addComment(ann.id, name, text);
        
        // Reset fields
        textInput.value = '';
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Post Comment';
      } catch (err) {
        console.error("Error creating comment:", err);
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Post Comment';
      }
    });

    // Register active Firebase real-time listeners for comments on this card
    listenToComments(ann.id, (comments) => {
      renderCommentsList(ann.id, comments);
    });
  });

  triggerScrollObserver();
}

function renderCommentsList(announcementId, comments) {
  const container = document.getElementById(`comments-list-${announcementId}`);
  if (!container) return;

  if (comments.length === 0) {
    container.innerHTML = `<p class="comments-empty-message">Be the first to share your thoughts on this update!</p>`;
    return;
  }

  container.innerHTML = '';
  comments.forEach(comment => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    
    // Nice dates formatting
    const dateStr = new Date(comment.timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    item.innerHTML = `
      <div class="comment-item-header">
        <span class="comment-author">${escapeHtml(comment.name)}</span>
        <span class="comment-time">${dateStr}</span>
      </div>
      <p class="comment-text">${escapeHtml(comment.text)}</p>
    `;
    container.appendChild(item);
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// ==========================================
// 7. CONTACT FORM & WHATSAPP REDIRECT
// ==========================================
function initContactForm() {
  const form = document.getElementById('whatsapp-message-form');
  const alertBox = document.getElementById('form-success-alert');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Reset validations outline state
    nameInput.style.borderColor = '';
    messageInput.style.borderColor = '';

    let hasErrors = false;

    if (!name) {
      nameInput.style.borderColor = 'red';
      hasErrors = true;
    }
    if (!message) {
      messageInput.style.borderColor = 'red';
      hasErrors = true;
    }

    if (hasErrors) return;

    // Build the pre-filled Whatsapp text message
    let messageBody = `Hello Sadia Shahzad,\n\n`;
    messageBody += `My name is: ${name}\n`;
    if (email) {
      messageBody += `Email address: ${email}\n`;
    }
    messageBody += `\nMessage:\n${message}`;

    // Show redirection feedback banner
    alertBox.style.display = 'block';

    setTimeout(() => {
      // Format URL for wa.me API redirect (Sadia's phone number = +92 343 2901998)
      const encodedMsg = encodeURIComponent(messageBody);
      const waUrl = `https://wa.me/923432901998?text=${encodedMsg}`;
      
      // Redirect in new tab
      window.open(waUrl, '_blank');

      // Reset form controls
      form.reset();
      alertBox.style.display = 'none';
    }, 1500);
  });
}

// ==========================================
// 8. GENERAL SCROLL TRIGGER ANIMATIONS
// ==========================================
function triggerScrollObserver() {
  const cards = document.querySelectorAll('.announcement-card');
  
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach(card => {
    cardObserver.observe(card);
  });
}
