document.addEventListener("DOMContentLoaded", () => {
  const backgroundCard = document.querySelector(".background-card");
  const heading = document.querySelector(".heading");
  const subheading = document.querySelector(".subheading");
  const aboutHeading = document.querySelector(".about-heading");
  const aboutContent = document.querySelector(".about-content");
  const recentTransactions = document.querySelector(".recent-transactions");
  const deals = document.querySelector(".deals");
  const contactHeading = document.querySelector(".contact-heading");
  const contactContainer = document.querySelector(".contact-container");
  const contactIntro = document.querySelector(".contact-intro");
  const dealElements = Array.from(document.querySelectorAll(".deal"));
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  let currentSection = 0;
  let currentDealIndex = 0;
  const totalSections = 4;
  const maxDeals = dealElements.length;
  let isDealSwiping = false;
  let isInitialized = false; // Track initialization state
  
  // Improved scroll control variables
  let isScrolling = false;
  let scrollAccumulator = 0;
  let lastScrollTime = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  
  const SCROLL_THRESHOLD = 50; // Minimum delta to trigger scroll
  const SCROLL_COOLDOWN = 1200; // Time to wait between scrolls (ms)
  const TOUCH_THRESHOLD = 30; // Minimum swipe distance
  const ANIMATION_DURATION = 1000; // Match CSS animation duration

  // Form handling
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[\d\s+()-]{8,}$/;
    
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!mobileRegex.test(mobile)) {
        showMessage('Please enter a valid mobile number', 'error');
        return;
    }

    try {
        showMessage('Sending message...', 'info');
        
        const formData = new FormData(contactForm);
        
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Message sent!', 'success');
            contactForm.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        showMessage('Failed to send. Please try again.', 'error');
    }
  });

  function showMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 3000);
  }

  const isMobile = () => window.innerWidth <= 767;

  // Fixed initial animation - wait for proper initialization
  const initializeAnimations = () => {
    // Ensure all elements start in their initial positions
    updateSection();
    
    // Wait a bit longer and add a check to ensure elements are ready
    setTimeout(() => {
      if (heading && subheading && isInitialized) {
        heading.style.transform = "translateX(0)";
        subheading.style.transform = "translateX(0)";
      }
    }, 800); // Increased delay to ensure proper initialization
  };

  const updateMobileDeals = (direction = 'next') => {
    if (!isMobile() || isDealSwiping) return;
  
    isDealSwiping = true;
  
    // Hide the current deal
    dealElements[currentDealIndex].style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    dealElements[currentDealIndex].style.transform = `translateX(${direction === 'next' ? '-200%' : '100%'})`;
    dealElements[currentDealIndex].style.opacity = "0";
  
    // Update the index for the next deal
    if (direction === 'next') {
      currentDealIndex = (currentDealIndex + 1) % maxDeals;
    } else {
      currentDealIndex = currentDealIndex === 0 ? maxDeals - 1 : currentDealIndex - 1;
    }
  
    // Position the next deal offscreen
    dealElements[currentDealIndex].style.transition = 'none';
    dealElements[currentDealIndex].style.transform = `translateX(${direction === 'next' ? '100%' : '-200%'})`;
    dealElements[currentDealIndex].style.opacity = "0";
  
    // Force a reflow
    dealElements[currentDealIndex].offsetHeight;
  
    // Bring the next deal into view
    dealElements[currentDealIndex].style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    dealElements[currentDealIndex].style.transform = 'translateX(-50%)';
    dealElements[currentDealIndex].style.opacity = "1";
  
    setTimeout(() => {
      isDealSwiping = false;
    }, 300);
  };  

  const resetDeals = () => {
    currentDealIndex = 0;
  
    dealElements.forEach((deal, index) => {
      deal.style.transition = "none";
  
      if (index === 0) {
        deal.style.opacity = "1";
        deal.style.transform = "translateX(-50%)";
      } else {
        deal.style.opacity = "0";
        deal.style.transform = "translateX(100%)";
      }
    });
  
    setTimeout(() => {
      dealElements.forEach((deal) => {
        deal.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
      });
    }, 50);
  };
  
  const updateSection = () => {
    switch(currentSection) {
      case 0:
        // Home section
        heading.style.transform = "translateX(0)";
        heading.style.top = "auto";
        subheading.style.transform = "translateX(0)";
        subheading.style.opacity = "1";
        backgroundCard.style.transform = "translateY(0)";
        
        aboutHeading.style.transform = "translateX(-100%)";
        aboutContent.style.transform = "translateX(-100%)";
        aboutHeading.style.opacity = "0";
        aboutContent.style.opacity = "0";
        
        recentTransactions.style.transform = "translateX(-100%)";
        deals.style.transform = "translateX(-100%)";
        recentTransactions.style.opacity = "0";
        deals.style.opacity = "0";
        
        contactHeading.style.transform = "translateX(-100%)";
        contactContainer.style.transform = "translateX(-100%)";
        contactHeading.style.opacity = "0";
        contactContainer.style.opacity = "0";
        break;  

      case 1:
        // About section
        heading.style.transform = "translateY(-60vh)";
        subheading.style.transform = "translateX(200%)";
        subheading.style.opacity = "0";
        backgroundCard.style.transform = "translateY(-100%)";
        
        aboutHeading.style.transform = "translateX(0)";
        aboutContent.style.transform = "translateX(0)";
        aboutHeading.style.opacity = "1";
        aboutContent.style.opacity = "1";
        
        recentTransactions.style.transform = "translateX(-100%)";
        deals.style.transform = "translateX(-100%)";
        recentTransactions.style.opacity = "0";
        deals.style.opacity = "0";
        
        contactHeading.style.transform = "translateX(-100%)";
        contactContainer.style.transform = "translateX(-100%)";
        contactHeading.style.opacity = "0";
        contactContainer.style.opacity = "0";
        break;

      case 2:
        // Transactions section
        heading.style.transform = "translateY(-60vh)";
        subheading.style.transform = "translateX(200%)";
        subheading.style.opacity = "0";
        
        aboutHeading.style.transform = "translateX(200%)";
        aboutContent.style.transform = "translateX(200%)";
        aboutHeading.style.opacity = "0";
        aboutContent.style.opacity = "0";
        
        recentTransactions.style.transform = "translateX(0)";
        recentTransactions.style.opacity = "1";
        
        deals.style.opacity = "1";
        
        if (isMobile()) {
          resetDeals();
        } else {
          deals.style.transform = "translateX(0)";
          deals.style.opacity = "1";
        }
        
        contactHeading.style.transform = "translateX(-100%)";
        contactContainer.style.transform = "translateX(-100%)";
        contactHeading.style.opacity = "0";
        contactContainer.style.opacity = "0";
        break;
        
      case 3:
        // Contact section
        heading.style.transform = "translateY(-60vh)";
        subheading.style.transform = "translateX(200%)";
        subheading.style.opacity = "0";
        
        aboutHeading.style.transform = "translateX(200%)";
        aboutContent.style.transform = "translateX(200%)";
        aboutHeading.style.opacity = "0";
        aboutContent.style.opacity = "0";
        
        // Hide deals in section 3 since swiping is only for section 2
        if (isMobile()) {
          recentTransactions.style.transform = "translateX(-100%)";
          deals.style.transform = "translateX(-100%)";
          recentTransactions.style.opacity = "0";
          deals.style.opacity = "0";
        } else {
          recentTransactions.style.transform = "translateX(200%)";
          deals.style.transform = "translateX(200%)";
          recentTransactions.style.opacity = "0";
          deals.style.opacity = "0";
        }

        contactHeading.style.transform = "translateX(0)";
        contactHeading.style.opacity = "1";
        contactContainer.style.transform = "translateX(0)";
        contactContainer.style.opacity = "1";
        
        if (contactIntro) {
          contactIntro.style.transform = "translateX(0)";
          contactIntro.style.opacity = "1";
        }
        break;
    }
  };

  // Improved scroll handling
  const navigateToSection = (targetSection) => {
    if (targetSection < 0 || targetSection >= totalSections) return;
    if (targetSection === currentSection) return;
    
    currentSection = targetSection;
    isScrolling = true;
    
    // Update visual state
    updateSection();
    
    // Programmatically scroll to the section
    const targetPosition = window.innerHeight * currentSection;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Reset scroll lock after animation
    setTimeout(() => {
      isScrolling = false;
      scrollAccumulator = 0;
    }, ANIMATION_DURATION);
  };

  // Debounced wheel handler with accumulator
  const handleWheel = (event) => {
    event.preventDefault();
    
    const now = Date.now();
    const timeSinceLastScroll = now - lastScrollTime;
    
    // If we're in cooldown or actively scrolling, accumulate but don't trigger
    if (isScrolling || timeSinceLastScroll < SCROLL_COOLDOWN) {
      scrollAccumulator += event.deltaY;
      return;
    }
    
    // Add current scroll to accumulator
    scrollAccumulator += event.deltaY;
    
    // Check if accumulated scroll exceeds threshold
    if (Math.abs(scrollAccumulator) > SCROLL_THRESHOLD) {
      const direction = scrollAccumulator > 0 ? 1 : -1;
      const targetSection = currentSection + direction;
      
      navigateToSection(targetSection);
      lastScrollTime = now;
      scrollAccumulator = 0;
    }
  };

  // Enhanced touch handling for deal swiping AND section navigation
  let touchStartX = 0;
  
  const handleTouchStart = (event) => {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
    touchStartTime = Date.now();
  };

  const handleTouchMove = (event) => {
    // Prevent default scrolling on touch devices
    if (currentSection >= 0 && currentSection < totalSections) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = (event) => {
    if (isScrolling || isDealSwiping) return;
    
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndTime = Date.now();
    
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;
    const deltaTime = touchEndTime - touchStartTime;
    const velocityY = Math.abs(deltaY) / deltaTime;
    const velocityX = Math.abs(deltaX) / deltaTime;
    
    // Debug logging (remove in production)
    console.log('Touch:', { deltaX, deltaY, section: currentSection, isMobile: isMobile() });
    
    // Check if we're in section 2 (transactions) on mobile where deals are swipeable
    if (currentSection === 2 && isMobile()) {
      // Check for horizontal swipe first (for deals)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > TOUCH_THRESHOLD) {
        // Horizontal swipe detected - handle deal navigation
        console.log('Horizontal swipe detected:', deltaX > 0 ? 'left' : 'right');
        const direction = deltaX > 0 ? 'prev' : 'next';
        updateMobileDeals(direction);
        return;
      }
    }
    
    // Check for vertical swipe (section navigation)
    if (Math.abs(deltaY) > TOUCH_THRESHOLD) {
      // Quick swipe or long swipe
      if (velocityY > 0.3 || Math.abs(deltaY) > 100) {
        const direction = deltaY > 0 ? 1 : -1;
        const targetSection = currentSection + direction;
        
        navigateToSection(targetSection);
      }
    }
  };

  // Keyboard navigation
  const handleKeydown = (event) => {
    if (isScrolling) return;
    
    // Handle deal navigation in section 2 on mobile
    if (currentSection === 2 && isMobile()) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateMobileDeals('prev');
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateMobileDeals('next');
        return;
      }
    }
    
    switch(event.key) {
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        navigateToSection(currentSection + 1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        navigateToSection(currentSection - 1);
        break;
      case 'Home':
        event.preventDefault();
        navigateToSection(0);
        break;
      case 'End':
        event.preventDefault();
        navigateToSection(totalSections - 1);
        break;
    }
  };

  // Prevent native scroll
  const preventNativeScroll = (event) => {
    if (currentSection >= 0 && currentSection < totalSections) {
      window.scrollTo(0, currentSection * window.innerHeight);
    }
  };

  // Event listeners
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('scroll', preventNativeScroll, { passive: true });
  
  // Handle resize
  window.addEventListener('resize', () => {
    // Maintain position on resize
    const targetPosition = window.innerHeight * currentSection;
    window.scrollTo(0, targetPosition);
    updateSection();
  });
  
  // FIXED: Better initialization sequence
  window.scrollTo(0, 0);
  isInitialized = true;
  updateSection();
  initializeAnimations();
});