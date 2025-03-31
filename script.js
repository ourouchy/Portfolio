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

// Show project details with animation
function showProjectDetails(projectId) {
  // First hide the details to set up animation
  const detailsContainer = document.getElementById('projectDetails');
  detailsContainer.classList.remove('active');
  
  // Add a slight delay before showing new details
  setTimeout(() => {
    // Update active states for cards
    document.querySelectorAll('.project-card').forEach(card => {
      if (card.dataset.project === projectId) {
        card.classList.remove('inactive');
      } else {
        card.classList.add('inactive');
      }
    });

    // Special handling for SliceMyPDF project (project3)
    if (projectId === 'project3') {
      loadEnhancedProjectDetails(projectId);
    } else {
      // Regular handling for other projects
      loadStandardProjectDetails(projectId);
    }
    
    // Show with animation
    detailsContainer.classList.add('active');
    
    // Scroll into view on mobile
    if (window.innerWidth < 768) {
      detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 300);
}

// Load standard project details from translations
function loadStandardProjectDetails(projectId) {
  const detailsContainer = document.getElementById('projectDetails');
  const title = currentTranslations[`${projectId}Title`] || '';
  const desc = currentTranslations[`${projectId}Details`] || '';
  const tech = currentTranslations[`${projectId}Tech`] || '';
  
  // Create HTML with more structure
  detailsContainer.innerHTML = `
    <h2>${title}</h2>
    <div class="project-content">
      <p>${desc}</p>
      ${tech ? `<div class="tech-stack"><strong>${currentTranslations.techStackLabel || 'Technologies'}:</strong> ${tech}</div>` : ''}
    </div>
  `;
}

// Load enhanced project details for SliceMyPDF
function loadEnhancedProjectDetails(projectId) {
  const detailsContainer = document.getElementById('projectDetails');
  
  // Create the enhanced UI dynamically
  detailsContainer.innerHTML = createEnhancedProjectHTML(projectId);
  
  // Initialize image modal functionality
  initImageModalFunctionality();
}

// Create enhanced project HTML for SliceMyPDF
function createEnhancedProjectHTML(projectId) {
  // Get the title and description from translations
  const title = currentTranslations[`${projectId}Title`] || 'SliceMyPDF';
  const desc = currentTranslations[`${projectId}Description`] || '';
  const details = currentTranslations[`${projectId}Details`] || '';
  const tech = currentTranslations[`${projectId}Tech`] || '';
  
  // Get GitHub and website URLs from translations (if available)
  // Fallback to project-specific hardcoded values if not in translations
  let githubUrl = '';
  let websiteUrl = '';
  
  // You can add logic here to set specific URLs based on projectId
  // For example:
  if (projectId === 'project3') { // SliceMyPDF
    githubUrl = 'https://github.com/yourusername/SliceMyPDF';
    websiteUrl = 'https://slicemypdf.yourdomain.com';
  }
  
  // Check if we have URLs in translations (these would override the hardcoded values)
  if (currentTranslations[`${projectId}GithubUrl`]) {
    githubUrl = currentTranslations[`${projectId}GithubUrl`];
  }
  
  if (currentTranslations[`${projectId}WebsiteUrl`]) {
    websiteUrl = currentTranslations[`${projectId}WebsiteUrl`];
  }
  
  // Create links section if URLs are available
  let linksHTML = '';
  if (githubUrl || websiteUrl) {
    linksHTML = '<div class="project-links">';
    if (githubUrl) {
      linksHTML += `<a href="${githubUrl}" target="_blank" class="github-link"><i class="fa fa-github"></i> ${currentTranslations.githubLabel || 'GitHub'}</a>`;
    }
    if (websiteUrl) {
      linksHTML += `<a href="${websiteUrl}" target="_blank" class="website-link"><i class="fa fa-external-link"></i> ${currentTranslations.websiteLabel || 'Website'}</a>`;
    }
    linksHTML += '</div>';
  }
  
  return `
    <div class="project-full-details">
      <h2>${title}</h2>
      
      ${linksHTML}
      
      <div class="project-intro">
        <p>${desc}</p>
      </div>
      
      <div class="project-screenshots">
        <h3>${currentTranslations.screenshotsLabel || 'Application Screenshots'}</h3>
        <div class="screenshots-container">
          <div class="screenshot-group">
            <h4>${currentTranslations.desktopLabel || 'Desktop Interface'}</h4>
            <div class="desktop-screenshots">
              <div class="screenshot">
                <img src="images/desktop-upload.jpg" alt="Desktop Upload Interface" class="screenshot-img">
                <p class="caption">${currentTranslations.desktopUploadCaption || 'PDF Upload and Preview (Desktop)'}</p>
              </div>
              <div class="screenshot">
                <img src="images/desktop-selection.jpg" alt="Desktop Page Selection" class="screenshot-img">
                <p class="caption">${currentTranslations.desktopSelectionCaption || 'Page Selection Interface (Desktop)'}</p>
              </div>
            </div>
          </div>
          
          <div class="screenshot-group">
            <h4>${currentTranslations.mobileLabel || 'Mobile Experience'}</h4>
            <div class="mobile-screenshots">
              <div class="screenshot">
                <img src="images/mobile-upload.jpg" alt="Mobile Upload Interface" class="screenshot-img">
                <p class="caption">${currentTranslations.mobileUploadCaption || 'PDF Upload (Mobile)'}</p>
              </div>
              <div class="screenshot">
                <img src="images/mobile-selection.jpg" alt="Mobile Page Selection" class="screenshot-img">
                <p class="caption">${currentTranslations.mobileSelectionCaption || 'Page Selection (Mobile)'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="details-content">
        <p>${details}</p>
      </div>
      
      ${tech ? `<div class="tech-stack"><strong>${currentTranslations.techStackLabel || 'Technologies'}:</strong> ${tech}</div>` : ''}
    </div>
  `;
}

// Initialize image modal functionality
function initImageModalFunctionality() {
  // Remove any existing event listeners
  const existingScreenshots = document.querySelectorAll('.screenshot-img');
  existingScreenshots.forEach(img => {
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
  });
  
  // Add click event listeners for screenshots
  document.querySelectorAll('.screenshot-img').forEach(img => {
    img.addEventListener('click', function() {
      const modal = document.createElement('div');
      modal.classList.add('image-modal');
      
      const modalImg = document.createElement('img');
      modalImg.src = this.src;
      
      const closeButton = document.createElement('span');
      closeButton.classList.add('close-modal');
      closeButton.innerHTML = '&times;';
      closeButton.onclick = function() {
        document.body.removeChild(modal);
      };
      
      modal.appendChild(closeButton);
      modal.appendChild(modalImg);
      document.body.appendChild(modal);
      
      // Close modal when clicking outside the image
      modal.onclick = function(e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      };
    });
  });
  
  // Add modal style if not already present
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