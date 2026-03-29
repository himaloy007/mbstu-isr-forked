document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("app");
  
  // Define sections in order
  const sections = [
    "header",
    "hero",
    "activities",
    "facilities",
    "grants",
    "collaborators",
    "funding",
    "output",
    "gallery",
    "footer"
  ];

  // Load all components
  for (const name of sections) {
    try {
      const res = await fetch(`components/${name}.html`);
      if (res.ok) {
        const html = await res.text();
        const div = document.createElement("div");
        div.innerHTML = html;
        while (div.firstChild) {
          container.appendChild(div.firstChild);
        }
      } else {
        console.error(`Failed to load ${name}`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Once UI is injected, fetch data and populate
  await populateData();
  initMobileNav();

  // Hide loader and initialize animations
  const loader = document.getElementById("app-loader");
  if(loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      initAnimations();
      initFundingBars(); // trigger bars when loaded
    }, 600);
  }
});

// Initialize simple scroll observer for fade-in animations
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = entry.target.dataset.transform || "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up, .fade-in-down').forEach(el => {
    el.style.opacity = "0";
    if(el.classList.contains('fade-in-up')){
      el.dataset.transform = "translateY(0)";
      el.style.transform = "translateY(30px)";
    } else {
      el.dataset.transform = "translateY(0)";
      el.style.transform = "translateY(-30px)";
    }
    observer.observe(el);
  });
}

function initFundingBars() {
  setTimeout(() => {
    document.querySelectorAll('.funding-bar-fill').forEach(bar => {
      const width = bar.getAttribute('data-width');
      if (width) {
        bar.style.width = width + '%';
      }
    });
  }, 1000); // little delay for better UX
}

function initMobileNav() {
  const header = document.querySelector('.premium-header');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.getElementById('primary-navigation');

  if (!header || !toggle || !nav) return;

  const closeNav = () => {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      closeNav();
    }
  });
}

async function populateData() {
  await Promise.all([
    loadStats(),
    loadActivities(),
    loadFacilities(),
    loadGrants(),
    loadCollaborators(),
    loadFunding(),
    loadOutputs(),
    loadGallery()
  ]);
}

async function loadStats() {
  const res = await fetch('assets/data/stats.json');
  const stats = await res.json();
  const container = document.getElementById('hero-stats-container');
  if(!container) return;

  container.innerHTML = stats.map(st => `
    <div class="stat-box">
      <div class="stat-num">${st.num}</div>
      <div class="stat-lbl">${st.label}</div>
    </div>
  `).join('');
}

async function loadActivities() {
  const res = await fetch('assets/data/activities.json');
  const activities = await res.json();
  const container = document.getElementById('activities-grid');
  if(!container) return;

  container.innerHTML = activities.map(act => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="activity-card">
        <div class="activity-card-header">
          <div class="activity-icon-wrapper">
             <img src="${act.icon}" alt="${act.title} icon" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;" />
          </div>
        </div>
        <div class="activity-card-body">
          <h5>${act.title}</h5>
          <p>${act.description}</p>
          <div class="activity-tags">
            ${act.tags.map(t => `<span class="activity-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadFacilities() {
  const res = await fetch('assets/data/facilities.json');
  const data = await res.json();
  const container = document.getElementById('facilities-grid');
  if(!container) return;

  container.innerHTML = data.map(item => `
    <div class="col-12 col-lg-6">
      <div class="facility-card">
        <div class="facility-icon">
          <i class="${item.icon}"></i>
        </div>
        <div class="facility-content">
          <h5>${item.title}</h5>
          <p>${item.description}</p>
          <div class="facility-meta">
            ${item.meta.map(m => `<span>${m}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadGrants() {
  const res = await fetch('assets/data/grants.json');
  const data = await res.json();
  const container = document.getElementById('grants-grid');
  if(!container) return;

  container.innerHTML = data.map(item => `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="grant-card">
        <div class="grant-header">
          <span class="badge-amount">${item.amount}</span>
          <h5>${item.title}</h5>
        </div>
        <div class="grant-body">
          <p>${item.description}</p>
          <div class="grant-footer">
            <span class="grant-status ${item.statusClass}">${item.status}</span>
            <div class="grant-meta">
              <span class="pi"><i class="fas fa-user-tie"></i> ${item.pi}</span>
              <span class="yr">${item.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadCollaborators() {
  const res = await fetch('assets/data/collaborators.json');
  const data = await res.json();
  const container = document.getElementById('collaborators-grid');
  if(!container) return;

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  container.innerHTML = data.map(item => `
    <div class="collab-card">
      <div class="collab-logo">
        ${/\.(png|jpe?g|webp|gif|svg)$/i.test(String(item.icon || ''))
          ? `<img src="${encodeURI(item.icon)}" alt="${escapeHtml(item.name)} flag" loading="lazy" />`
          : `<i class="${escapeHtml(item.icon)}"></i>`}
      </div>
      <h6>${item.name}</h6>
      <p>${item.location}</p>
      <span class="collab-type">${item.type}</span>
    </div>
  `).join('');
}

async function loadFunding() {
  const res = await fetch('assets/data/funding.json');
  const data = await res.json();
  
  const chartBox = document.getElementById('funding-chart');
  if(chartBox) {
    chartBox.innerHTML += data.breakdown.map(item => `
      <div class="funding-bar-wrap">
        <div class="funding-label">
          <span>${item.source}</span>
          <span class="pct">${item.percentage}%</span>
        </div>
        <div class="funding-bar-track">
          <div class="funding-bar-fill" data-width="${item.percentage}"></div>
        </div>
      </div>
    `).join('');
  }

  const cardsBox = document.getElementById('funding-cards');
  if(cardsBox) {
    cardsBox.innerHTML = data.cards.map(item => `
      <div class="col-12 col-sm-6">
        <div class="funding-source-card">
          <div class="funding-source-icon" style="background:${item.bg}; color:${item.color};">
            <i class="${item.icon}"></i>
          </div>
          <div class="funding-source-content">
            <h6>${item.title}</h6>
            <p>${item.description}</p>
          </div>
        </div>
      </div>
    `).join('');
  }
}

async function loadOutputs() {
  const res = await fetch('assets/data/outputs.json');
  const data = await res.json();
  
  // Render Stats
  const statBox = document.getElementById('output-stats-container');
  if(statBox) {
    statBox.innerHTML = data.stats.map(st => `
      <div class="out-stat">
        <div class="n">${st.count}</div>
        <div class="l">${st.label}</div>
      </div>
    `).join('');
  }

  window.allPublications = data.publications;
  renderPublications('all');

  // Attach event listeners to tabs
  document.querySelectorAll('.output-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      renderPublications(e.target.getAttribute('data-filter'));
    });
  });
}

function renderPublications(filter) {
  const pubList = document.getElementById('pub-list');
  if(!pubList || !window.allPublications) return;

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const renderJournalField = (journalValue) => {
    const text = String(journalValue ?? '').trim();
    const isUrl = /^(https?:\/\/|www\.)/i.test(text);

    if (!isUrl) {
      return escapeHtml(text);
    }

    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
  };

  const filtered = filter === 'all' 
    ? window.allPublications 
    : window.allPublications.filter(p => p.type === filter);

  pubList.innerHTML = `
    <div class="pub-list-wrap">
      ${filtered.map(pub => `
        <div class="pub-card">
          <div class="pub-title">${pub.title}</div>
          <div class="pub-authors">${pub.authors}</div>
          <div class="pub-journal">${renderJournalField(pub.journal)}</div>
          <div class="pub-meta">
            <span class="pub-year">${pub.year}</span>
            ${pub.badge1 ? `<span class="pub-badge ${pub.badge1Class || ''}" style="${pub.badge1Style || ''}">${pub.badge1}</span>` : ''}
            ${pub.badge2 ? `<span class="pub-badge ${pub.badge2Class || ''}">${pub.badge2}</span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function loadGallery() {
  const res = await fetch('assets/data/gallery.json');
  const photos = await res.json();

  const grid = document.getElementById('gallery-grid');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const pageIndicator = document.getElementById('gallery-page-indicator');
  const controls = document.getElementById('gallery-controls');

  if (!grid || !prevBtn || !nextBtn || !pageIndicator) return;

  if (!Array.isArray(photos) || photos.length === 0) {
    grid.innerHTML = '<p class="section-sub">No gallery photos available yet.</p>';
    if (controls) controls.style.display = 'none';
    return;
  }

  const itemsPerPage = 6;
  let currentPage = 1;
  const totalPages = Math.ceil(photos.length / itemsPerPage);

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const renderPage = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const visible = photos.slice(start, start + itemsPerPage);

    grid.innerHTML = visible.map((photo, idx) => {
      const absoluteIndex = start + idx + 1;
      const altText = photo.alt || `Gallery image ${absoluteIndex}`;
      const caption = photo.caption || '';
      const safeSrc = encodeURI(String(photo.src || ''));

      return `
        <figure class="gallery-card">
          <div class="gallery-image-wrap">
            <img src="${safeSrc}" alt="${escapeHtml(altText)}" loading="lazy" />
          </div>
          <figcaption class="gallery-caption">${escapeHtml(caption)}</figcaption>
        </figure>
      `;
    }).join('');

    pageIndicator.textContent = `Page ${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  };

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderPage();
      grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderPage();
      grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  renderPage();
}