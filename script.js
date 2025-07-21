// Smooth scrolling for navigation
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Email signup functionality
function handleEmailSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const email = emailInput.value;
  
  // Basic email validation
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  
  // Send email notification to Jesse
  sendEmailNotification(email);
  
  // Show success message
  const successDiv = document.getElementById('signup-success');
  form.style.display = 'none';
  successDiv.style.display = 'block';
  
  // Store in localStorage for demo purposes
  const signups = JSON.parse(localStorage.getItem('pitchmoto-signups') || '[]');
  signups.push({
    email: email,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('pitchmoto-signups', JSON.stringify(signups));
}

// Send email notification to Jesse
function sendEmailNotification(userEmail) {
  const subject = encodeURIComponent('New PitchMoto Email Signup');
  const body = encodeURIComponent(`New email signup for PitchMoto website:

Email: ${userEmail}
Timestamp: ${new Date().toLocaleString()}
Page: ${window.location.href}

This person wants to be notified when PitchMoto launches!`);
  
  // Create mailto link to send notification
  const mailtoLink = `mailto:jdmoon@gmail.com?subject=${subject}&body=${body}`;
  
  // Try to open the mailto link
  try {
    window.open(mailtoLink, '_blank');
  } catch (error) {
    console.log('Could not open email client, but signup was recorded.');
  }
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Intersection Observer for animations
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
  
  // Observe sections
  document.querySelectorAll('.founder-section, .coming-soon').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeAnimations();
  
  // Add click handlers for navigation links
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      scrollToSection(targetId);
    });
  });
  
  // Add click handlers for CTA buttons
  document.querySelectorAll('button[onclick]').forEach(button => {
    const onclickValue = button.getAttribute('onclick');
    if (onclickValue && onclickValue.includes('scrollToSection')) {
      button.addEventListener('click', function() {
        eval(onclickValue);
      });
    }
  });
});

// Header scroll effect
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.backdropFilter = 'blur(10px)';
  } else {
    header.style.background = '#fff';
    header.style.backdropFilter = 'none';
  }
});

// Simple analytics tracking (placeholder)
function trackEvent(eventName, properties = {}) {
  console.log('Event tracked:', eventName, properties);
  // In a real app, this would send data to an analytics service
}

// Track button clicks
document.addEventListener('click', function(e) {
  if (e.target.matches('button') || e.target.matches('.cta-btn')) {
    trackEvent('button_click', {
      button_text: e.target.textContent,
      button_class: e.target.className
    });
  }
});

// Handle form submissions
document.addEventListener('submit', function(e) {
  if (e.target.matches('.email-signup')) {
    trackEvent('email_signup', {
      email: e.target.querySelector('input[type="email"]').value
    });
  }
});
