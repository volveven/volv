/**
 * KETADECOR — Immersive Fullscreen Swipeable Gallery Viewer
 * Supports:
 * - Edge-to-edge true fullscreen image view
 * - Fluid horizontal touch swiping with 1:1 finger tracking & momentum
 * - Drag-down-to-dismiss gesture (like iOS Photos & Instagram)
 * - Desktop mouse drag & keyboard navigation (Left, Right, Escape)
 * - Next/Previous image preloading for zero-latency swiping
 * - Filter synchronization (respects active gallery category)
 */

(function() {
  'use strict';

  // Inject Fullscreen Viewer DOM if not present
  function ensureViewerDOM() {
    if (document.getElementById('fullscreenViewer')) return;

    const viewer = document.createElement('div');
    viewer.id = 'fullscreenViewer';
    viewer.className = 'fs-viewer';
    viewer.setAttribute('aria-hidden', 'true');
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');

    viewer.innerHTML = `
      <div class="fs-topbar">
        <div class="fs-counter-wrap">
          <span class="fs-cat" id="fsCat">Setup</span>
          <span class="fs-counter" id="fsCounter">01 / 01</span>
        </div>
        <button class="fs-close-btn" id="fsCloseBtn" aria-label="Vollbild schließen" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <button class="fs-arrow fs-prev" id="fsPrevBtn" aria-label="Vorheriges Bild" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="fs-arrow fs-next" id="fsNextBtn" aria-label="Nächstes Bild" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div class="fs-stage" id="fsStage">
        <div class="fs-track" id="fsTrack">
          <img src="" alt="" id="fsImage" class="fs-image" draggable="false">
        </div>
      </div>

      <div class="fs-bottombar">
        <div class="fs-info">
          <h3 class="fs-title" id="fsTitle">Setup Titel</h3>
          <p class="fs-desc" id="fsDesc">Setup Beschreibung</p>
        </div>
        <div class="fs-actions">
          <a href="#" id="fsWaBtn" target="_blank" class="fs-btn-wa">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;margin-right:8px;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.952 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.3-.019-.462.131-.612.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.233-.244-.585-.492-.506-.677-.515l-.577-.01c-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508c0 1.48 1.078 2.908 1.228 3.109.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.895.12.578-.087 1.78-.727 2.031-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.2-.577-.35zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.174L2 22l4.981-1.405A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.644 0-3.17-.492-4.453-1.336l-.32-.209-2.956.833.847-2.882-.228-.337A8.134 8.134 0 013.833 12c0-4.502 3.665-8.167 8.167-8.167 4.502 0 8.167 3.665 8.167 8.167 0 4.502-3.665 8.167-8.167 8.167z"/></svg>
            <span>Dieses Setup anfragen</span>
          </a>
        </div>
      </div>
      <div class="fs-hint">&larr; Wischen zum Blättern &rarr;</div>
    `;

    document.body.appendChild(viewer);
  }

  function initViewer() {
    ensureViewerDOM();

    const viewer = document.getElementById('fullscreenViewer');
    const closeBtn = document.getElementById('fsCloseBtn');
    const prevBtn = document.getElementById('fsPrevBtn');
    const nextBtn = document.getElementById('fsNextBtn');
    const stage = document.getElementById('fsStage');
    const track = document.getElementById('fsTrack');
    const img = document.getElementById('fsImage');
    const catEl = document.getElementById('fsCat');
    const counterEl = document.getElementById('fsCounter');
    const titleEl = document.getElementById('fsTitle');
    const descEl = document.getElementById('fsDesc');
    const waBtn = document.getElementById('fsWaBtn');

    let items = [];
    let currentIndex = 0;
    let isAnimating = false;

    // Collect items currently visible in the active gallery or cards on page
    function getActiveItems() {
      // Priority 1: Masonry items on gallery.html
      const masonryItems = Array.from(document.querySelectorAll('.masonry-item'));
      if (masonryItems.length > 0) {
        return masonryItems.filter(el => {
          return el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none';
        }).map(el => ({
          img: el.getAttribute('data-img') || (el.querySelector('img') ? el.querySelector('img').getAttribute('src') : ''),
          cat: el.getAttribute('data-cat-disp') || (el.querySelector('.masonry-cat') ? el.querySelector('.masonry-cat').textContent : 'Setup'),
          title: el.getAttribute('data-title') || (el.querySelector('.masonry-title') ? el.querySelector('.masonry-title').textContent : ''),
          desc: el.getAttribute('data-desc') || (el.querySelector('p') ? el.querySelector('p').textContent : ''),
          wa: el.getAttribute('data-wa') || (el.querySelector('.btn-gold') ? el.querySelector('.btn-gold').getAttribute('href') : '#')
        }));
      }

      // Priority 2: Gallery items on index.html
      const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
      if (galleryItems.length > 0) {
        return galleryItems.map(el => ({
          img: el.getAttribute('data-img') || (el.querySelector('img') ? el.querySelector('img').getAttribute('src') : ''),
          cat: el.getAttribute('data-cat') || 'Kollektion',
          title: el.getAttribute('data-title') || (el.querySelector('img') ? el.querySelector('img').getAttribute('alt') : 'KETADECOR Setup'),
          desc: el.getAttribute('data-desc') || '',
          wa: el.getAttribute('data-wa') || 'https://wa.me/4917642055627'
        }));
      }

      // Priority 3: Setup cards on category pages (heiratsantrag, verlobung, etc.)
      const setupCards = Array.from(document.querySelectorAll('.setup-card'));
      if (setupCards.length > 0) {
        return setupCards.map(el => {
          const cardImg = el.querySelector('img');
          const cardTitle = el.querySelector('h3');
          const cardDesc = el.querySelector('p');
          const cardWa = el.querySelector('.btn-gold');
          const cardBadge = el.querySelector('div[style*="absolute"]');
          return {
            img: cardImg ? cardImg.getAttribute('src') : '',
            cat: cardBadge ? cardBadge.textContent.trim() : 'Setup',
            title: cardTitle ? cardTitle.textContent.trim() : 'KETADECOR Setup',
            desc: cardDesc ? cardDesc.textContent.trim() : '',
            wa: cardWa ? cardWa.getAttribute('href') : 'https://wa.me/4917642055627'
          };
        });
      }

      return [];
    }

    function renderSlide(index, direction = 0) {
      if (items.length === 0) return;

      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      currentIndex = index;

      const current = items[currentIndex];

      if (direction !== 0) {
        isAnimating = true;
        // Slide out
        track.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease';
        track.style.transform = direction > 0 ? 'translateX(-80px)' : 'translateX(80px)';
        track.style.opacity = '0';

        setTimeout(() => {
          img.src = current.img;
          img.alt = current.title;
          catEl.textContent = current.cat;
          counterEl.textContent = `${(currentIndex + 1).toString().padStart(2, '0')} / ${items.length.toString().padStart(2, '0')}`;
          titleEl.textContent = current.title;
          descEl.textContent = current.desc;
          waBtn.href = current.wa;

          // Prepare slide in
          track.style.transition = 'none';
          track.style.transform = direction > 0 ? 'translateX(80px)' : 'translateX(-80px)';
          track.style.opacity = '0';
          void track.offsetWidth; // Reflow

          track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
          track.style.transform = 'translateX(0)';
          track.style.opacity = '1';

          setTimeout(() => { isAnimating = false; }, 280);
        }, 220);
      } else {
        img.src = current.img;
        img.alt = current.title;
        catEl.textContent = current.cat;
        counterEl.textContent = `${(currentIndex + 1).toString().padStart(2, '0')} / ${items.length.toString().padStart(2, '0')}`;
        titleEl.textContent = current.title;
        descEl.textContent = current.desc;
        waBtn.href = current.wa;

        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        track.style.opacity = '1';
      }

      // Preload next and prev images
      if (items.length > 1) {
        const nextIdx = (currentIndex + 1) % items.length;
        const prevIdx = (currentIndex - 1 + items.length) % items.length;
        if (items[nextIdx].img) new Image().src = items[nextIdx].img;
        if (items[prevIdx].img) new Image().src = items[prevIdx].img;
      }
    }

    function openViewer(targetImgSrc) {
      items = getActiveItems();
      if (items.length === 0) return;

      let targetIdx = 0;
      if (targetImgSrc) {
        const found = items.findIndex(item => item.img === targetImgSrc || item.img.endsWith(targetImgSrc));
        if (found !== -1) targetIdx = found;
      }

      renderSlide(targetIdx, 0);
      viewer.classList.add('active');
      viewer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeViewer() {
      viewer.classList.remove('active');
      viewer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      track.style.transform = 'translateX(0)';
      track.style.opacity = '1';
      viewer.style.backgroundColor = '#080706';
    }

    function goNext() {
      if (isAnimating) return;
      renderSlide(currentIndex + 1, 1);
    }

    function goPrev() {
      if (isAnimating) return;
      renderSlide(currentIndex - 1, -1);
    }

    // Event Listeners for UI controls
    closeBtn.addEventListener('click', closeViewer);
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (!viewer.classList.contains('active')) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    });

    // ========================================================
    // BUTTERY SMOOTH TOUCH GESTURES (SWIPE L/R & SWIPE DOWN)
    // ========================================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let touchCurrentY = 0;
    let isDragging = false;
    let isHorizontal = null;
    let startTime = 0;

    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1 || isAnimating) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchCurrentX = touchStartX;
      touchCurrentY = touchStartY;
      isDragging = true;
      isHorizontal = null;
      startTime = Date.now();
      track.style.transition = 'none';
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      touchCurrentX = e.touches[0].clientX;
      touchCurrentY = e.touches[0].clientY;
      const deltaX = touchCurrentX - touchStartX;
      const deltaY = touchCurrentY - touchStartY;

      if (isHorizontal === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      if (isHorizontal) {
        if (e.cancelable) e.preventDefault();
        track.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.015}deg)`;
        track.style.opacity = Math.max(0.45, 1 - Math.abs(deltaX) / (window.innerWidth * 0.9));
      } else if (isHorizontal === false && deltaY > 0) {
        // Swipe down to dismiss
        if (e.cancelable) e.preventDefault();
        track.style.transform = `translateY(${deltaY}px) scale(${Math.max(0.75, 1 - deltaY / 900)})`;
        viewer.style.backgroundColor = `rgba(8, 7, 6, ${Math.max(0.2, 1 - deltaY / 400)})`;
      }
    }, { passive: false });

    stage.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const deltaX = touchCurrentX - touchStartX;
      const deltaY = touchCurrentY - touchStartY;
      const time = Date.now() - startTime;
      const velocityX = Math.abs(deltaX) / time;

      if (isHorizontal) {
        if (deltaX < -40 || (deltaX < -20 && velocityX > 0.35)) {
          goNext();
        } else if (deltaX > 40 || (deltaX > 20 && velocityX > 0.35)) {
          goPrev();
        } else {
          track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
          track.style.transform = 'translateX(0)';
          track.style.opacity = '1';
        }
      } else if (isHorizontal === false && deltaY > 80) {
        closeViewer();
      } else {
        track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
        track.style.transform = 'translate(0, 0) scale(1)';
        viewer.style.backgroundColor = '#080706';
      }
    }, { passive: true });

    // ========================================================
    // DESKTOP MOUSE DRAG SWIPE
    // ========================================================
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseCurrentX = 0;

    stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      isMouseDown = true;
      mouseStartX = e.clientX;
      mouseCurrentX = mouseStartX;
      track.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      mouseCurrentX = e.clientX;
      const diffX = mouseCurrentX - mouseStartX;
      track.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.01}deg)`;
      track.style.opacity = Math.max(0.5, 1 - Math.abs(diffX) / 800);
    });

    window.addEventListener('mouseup', () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const diffX = mouseCurrentX - mouseStartX;
      if (Math.abs(diffX) > 60) {
        if (diffX < 0) goNext();
        else goPrev();
      } else {
        track.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
        track.style.transform = 'translateX(0)';
        track.style.opacity = '1';
      }
    });

    // ========================================================
    // BIND CARD / IMAGE CLICK EVENTS (NO TOUCH DELAY / NO HOVER TRAP)
    // ========================================================
    function bindCardTriggers() {
      // 1. Masonry items (gallery.html)
      document.querySelectorAll('.masonry-item').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (e.target.closest('a') || e.target.closest('button')) return;
          const imgEl = card.querySelector('img');
          const src = card.getAttribute('data-img') || (imgEl ? imgEl.getAttribute('src') : '');
          openViewer(src);
        });
      });

      // 2. Gallery items (index.html)
      document.querySelectorAll('.gallery-item').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (e.target.closest('a') || e.target.closest('button')) return;
          const imgEl = card.querySelector('img');
          const src = card.getAttribute('data-img') || (imgEl ? imgEl.getAttribute('src') : '');
          openViewer(src);
        });
      });

      // 3. Setup cards (heiratsantrag, verlobung, etc.)
      document.querySelectorAll('.setup-card').forEach(card => {
        const imgEl = card.querySelector('img');
        if (imgEl) {
          imgEl.style.cursor = 'pointer';
          imgEl.parentElement.style.cursor = 'pointer';
          imgEl.parentElement.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            openViewer(imgEl.getAttribute('src'));
          });
        }
      });
    }

    bindCardTriggers();
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewer);
  } else {
    initViewer();
  }
})();
