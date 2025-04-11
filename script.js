let currentLanguage = 'en';
let currentTranslations = {};

// Load translations asynchronously
async function loadTranslations(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error(`Failed to load language file (Status: ${res.status})`);
    
    currentTranslations = await res.json();
    applyTranslations();
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update the dropdown to reflect the current language
    document.getElementById('languageSelector').value = lang;
  } catch (err) {
    console.error(`❌ Failed to load language file for "${lang}"`, err);
    // Fallback to English if translation fails
    if (lang !== 'en') loadTranslations('en');
  }
}

// Apply translations to DOM elements
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (currentTranslations[key]) {
      // Handle HTML content if needed
      if (key.endsWith('HTML')) {
        el.innerHTML = currentTranslations[key];
      } else {
        el.textContent = currentTranslations[key];
      }
    }
  });

  // Update active project if one is open
  const activeProject = document.querySelector('.project-card:not(.inactive)');
  if (activeProject) {
    showProjectDetails(activeProject.dataset.project);
  }
}
function renderProjectDetails(projectId) {
  const project = currentTranslations.projects?.[projectId];
  const detailsContainer = document.getElementById('projectDetails');

  if (!project) {
    // Fallback if there's no data for this project
    detailsContainer.innerHTML = `<p>Project data not found.</p>`;
    return;
  }

  const {
    title = '',
    description = '',
    details = '',
    tech = '',
    githubUrl = '',
    websiteUrl = '',
    screenshots
  } = project;

  // Build up the HTML
  let html = `
    <div class="project-full-details">
      <h2>${title}</h2>
      ${renderProjectLinks(githubUrl, websiteUrl)}
      <div class="project-intro">
        <p>${description}</p>
      </div>
  `;

  // If there's a screenshots object, render "enhanced" layout
  if (screenshots && (screenshots.desktop || screenshots.mobile)) {
    html += `
      <div class="project-screenshots">
        <h3>${currentTranslations.screenshotsLabel || 'Application Screenshots'}</h3>
        <div class="screenshots-container ${screenshots.desktop && !screenshots.mobile ? 'single-column' : ''}">
          ${screenshots.desktop ? renderScreenshotsGroup('desktop', screenshots.desktop) : ''}
          ${screenshots.mobile ? renderScreenshotsGroup('mobile', screenshots.mobile) : ''}
        </div>
      </div>
    `;
  }

  // Add the details
  if (details) {
    html += `
      <div class="details-content">
        <p>${details}</p>
      </div>
    `;
  }

  // Add the tech stack
  if (tech) {
    html += `
      <div class="tech-stack">
        <strong>${currentTranslations.techStackLabel || 'Technologies'}:</strong> ${tech}
      </div>
    `;
  }

  // Close the container
  html += `</div>`;

  detailsContainer.innerHTML = html;

  // Initialize image modal if there are screenshots
  if (screenshots && (screenshots.desktop || screenshots.mobile)) {
    initImageModalFunctionality();
  }
}
function renderProjectLinks(githubUrl, websiteUrl) {
  // If neither link is present, return an empty string
  if (!githubUrl && !websiteUrl) return '';

  let linksHTML = '';

// Only show .project-links if at least one thing should be displayed
if (githubUrl || websiteUrl) {
  linksHTML += `<div class="project-links">`;

  if (githubUrl) {
    linksHTML += `
      <a href="${githubUrl}" target="_blank" class="github-link" title="GitHub" aria-label="GitHub">
        <i class="fab fa-github"></i>
      </a>
    `;
  } else {
    // GitHub not available → Private use
    linksHTML += `
      <span class="private-repo" title="Private – Commercial Use" aria-label="Private Repository">
        <i class="fas fa-lock"></i>
      </span>
    `;
  }

  if (websiteUrl) {
    linksHTML += `
      <a href="${websiteUrl}" target="_blank" class="website-link" title="Website" aria-label="Website">
        <i class="fas fa-external-link-alt"></i>
      </a>
    `;
  }

  linksHTML += `</div>`;
}

  return linksHTML;
}
function renderScreenshotsGroup(type, screenshotsArray) {
  if (!screenshotsArray || !Array.isArray(screenshotsArray) || !screenshotsArray.length) {
    return '';
  }

  const label = (type === 'desktop')
    ? currentTranslations.desktopLabel || 'Desktop Interface'
    : currentTranslations.mobileLabel || 'Mobile Experience';

  // Build the screenshots HTML
  let groupHTML = `
    <div class="screenshot-group">
      <h4>${label}</h4>
      <div class="${type}-screenshots">
  `;

  screenshotsArray.forEach(screenshot => {
    groupHTML += `
      <div class="screenshot">
        <img src="${screenshot.src}" alt="${screenshot.alt}" class="screenshot-img">
        <p class="caption">${screenshot.caption}</p>
      </div>
    `;
  });

  groupHTML += `</div></div>`;
  return groupHTML;
}

// Show project details with animation
function showProjectDetails(projectId) {
  const detailsContainer = document.getElementById('projectDetails');
  detailsContainer.classList.remove('active');

  setTimeout(() => {
    // Update which card is active
    document.querySelectorAll('.project-card').forEach(card => {
      card.dataset.project === projectId
        ? card.classList.remove('inactive')
        : card.classList.add('inactive');
    });

    // Render details in a single function
    renderProjectDetails(projectId);

    // Show with animation
    detailsContainer.classList.add('active');

    // Scroll into view on mobile
    if (window.innerWidth < 768) {
      detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 300);
}


function initImageModalFunctionality() {
  const screenshots = document.querySelectorAll('.screenshot-img');
  const images = Array.from(screenshots);

  // Clean up any old event listeners
  images.forEach(img => {
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
  });

  // Add new click listeners
  document.querySelectorAll('.screenshot-img').forEach((img, index) => {
    img.addEventListener('click', function () {
      let currentIndex = index;

      const modal = document.createElement('div');
      modal.classList.add('image-modal');

      const modalImg = document.createElement('img');
      modalImg.src = images[currentIndex].src;

      const closeButton = document.createElement('span');
      closeButton.classList.add('close-modal');
      closeButton.innerHTML = '&times;';
      closeButton.onclick = () => {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', keyListener);
      };

      const prevButton = document.createElement('span');
      prevButton.classList.add('modal-nav', 'prev');
      prevButton.innerHTML = '&#10094;';
      prevButton.onclick = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        modalImg.src = images[currentIndex].src;
      };

      const nextButton = document.createElement('span');
      nextButton.classList.add('modal-nav', 'next');
      nextButton.innerHTML = '&#10095;';
      nextButton.onclick = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        modalImg.src = images[currentIndex].src;
      };

      modal.appendChild(closeButton);
      modal.appendChild(prevButton);
      modal.appendChild(modalImg);
      modal.appendChild(nextButton);
      document.body.appendChild(modal);

      modal.onclick = function (e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', keyListener);
        }
      };

      // Keyboard navigation
      const keyListener = (e) => {
        if (e.key === 'ArrowLeft') prevButton.click();
        if (e.key === 'ArrowRight') nextButton.click();
        if (e.key === 'Escape') {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', keyListener);
        }
      };
      document.addEventListener('keydown', keyListener);
    });
  });

  // Add styles if not already added
  if (!document.getElementById('modal-style')) {
    const style = document.createElement('style');
    style.id = 'modal-style';
    style.textContent = `
      .image-modal {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
      }

      .image-modal img {
        max-width: 90%;
        max-height: 90%;
      }

      .close-modal {
        position: absolute;
        top: 15px;
        right: 25px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: bold;
        cursor: pointer;
      }

      .modal-nav {
        position: absolute;
        top: 50%;
        font-size: 3rem;
        color: white;
        padding: 0 15px;
        cursor: pointer;
        user-select: none;
        transform: translateY(-50%);
        z-index: 1001;
        transition: 0.3s;
      }

      .modal-nav:hover {
        color: #ccc;
      }

      .modal-nav.prev {
        left: 0;
      }

      .modal-nav.next {
        right: 0;
      }
    `;
    document.head.appendChild(style);
  }
}


// Switch between sections with smooth transitions
function switchContent(sectionId) {
  // Only switch if not already active
  if (document.getElementById(sectionId).classList.contains('active')) return;
  
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show target section
  document.getElementById(sectionId).classList.add('active');
  
  // Update active state in navigation
  updateNavigation(sectionId);
  
  // Close contact dropdown if open
  document.getElementById('contactDropdown').style.display = 'none';
}

// Update navigation active states
function updateNavigation(activeSectionId) {
  // Desktop navigation
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.id === `${activeSectionId.replace('Section', '')}Link`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Mobile navigation
  document.querySelectorAll('.mobile-nav a').forEach(link => {
    if (link.id === `mobile${activeSectionId.replace('Section', '')}Link`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Toggle contact dropdown with animation
function toggleContactDropdown() {
  const dropdown = document.getElementById('contactDropdown');
  if (dropdown.style.display === 'none' || !dropdown.style.display) {
    dropdown.style.display = 'block';
    setTimeout(() => dropdown.classList.add('visible'), 10);
    
    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', closeContactDropdownOnClickOutside);
    }, 10);
  } else {
    dropdown.classList.remove('visible');
    setTimeout(() => dropdown.style.display = 'none', 300);
    
    // Remove click outside listener
    document.removeEventListener('click', closeContactDropdownOnClickOutside);
  }
}

// Close dropdown when clicking outside
function closeContactDropdownOnClickOutside(e) {
  const dropdown = document.getElementById('contactDropdown');
  const contactLinks = document.querySelectorAll('[id$="ContactLink"]');
  let isClickInsideContact = false;
  
  contactLinks.forEach(link => {
    if (link.contains(e.target)) isClickInsideContact = true;
  });
  
  if (!dropdown.contains(e.target) && !isClickInsideContact) {
    dropdown.classList.remove('visible');
    setTimeout(() => dropdown.style.display = 'none', 300);
    document.removeEventListener('click', closeContactDropdownOnClickOutside);
  }
}

// Initialize event listeners
function initEventListeners() {
  // Language selector
  document.getElementById('languageSelector').addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    loadTranslations(currentLanguage);
  });

  // Desktop navigation
  document.getElementById('homeLink').addEventListener('click', () => switchContent('homeSection'));
  document.getElementById('projectsLink').addEventListener('click', () => switchContent('projectsSection'));
  document.getElementById('contactLink').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleContactDropdown();
  });

  // Mobile navigation
  document.getElementById('mobileHomeLink').addEventListener('click', () => switchContent('homeSection'));
  document.getElementById('mobileProjectsLink').addEventListener('click', () => switchContent('projectsSection'));
  document.getElementById('mobileContactLink').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleContactDropdown();
  });

  // Project cards
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      showProjectDetails(card.dataset.project);
    });
  });

  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('contactDropdown');
      if (dropdown.style.display !== 'none') {
        dropdown.classList.remove('visible');
        setTimeout(() => dropdown.style.display = 'none', 300);
      }
      
      // Also close image modal if open
      const modal = document.querySelector('.image-modal');
      if (modal) {
        document.body.removeChild(modal);
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved language preference
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
  currentLanguage = savedLanguage;
  
  // Initialize UI
  loadTranslations(currentLanguage);
  initEventListeners();
  
  // Add CSS class for initial section
  updateNavigation('homeSection');
});