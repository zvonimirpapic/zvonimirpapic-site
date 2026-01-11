// Theme Toggle Functionality
(function() {
  'use strict';
  
  // Initialize theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Theme toggle button
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
    
    // Set initial icon
    updateThemeIcon(savedTheme);
  }
  
  function updateThemeIcon(theme) {
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav');
  
  if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!nav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        nav.classList.remove('active');
      }
    });
  }
  
  // Form submissions (prevent default, show message)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple success message (you can enhance this later)
      const submitButton = form.querySelector('button[type="submit"], .btn');
      if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitted! ✓';
        submitButton.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.style.backgroundColor = '';
        }, 2000);
      }
    });
  });
})();
