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
    loadOutputs()
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

  const svgMap = {
    agri: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v-1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />',
    water: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />',
    health: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />',
    energy: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v-1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />',
    dna: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />',
    urban: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />'
  };

  container.innerHTML = activities.map(act => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="activity-card">
        <div class="activity-card-header">
          <div class="activity-icon-wrapper">
             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${svgMap[act.icon] || ''}</svg>
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

  container.innerHTML = data.map(item => `
    <div class="collab-card">
      <div class="collab-logo"><i class="${item.icon}"></i></div>
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

  const filtered = filter === 'all' 
    ? window.allPublications 
    : window.allPublications.filter(p => p.type === filter);

  pubList.innerHTML = `
    <div class="pub-list-wrap">
      ${filtered.map(pub => `
        <div class="pub-card">
          <div class="pub-title">${pub.title}</div>
          <div class="pub-authors">${pub.authors}</div>
          <div class="pub-journal">${pub.journal}</div>
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