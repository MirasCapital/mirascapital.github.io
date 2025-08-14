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
  let isAnimating = false;
  let isDealSwiping = false;
  let isAnimatingSection = false;
  const animationDuration = 900; // ms, should match your CSS/scroll duration

  // Form handling
  contactForm.addEventListener('submit', async (e) => {
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
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 3000);
  }

  const isMobile = () => window.innerWidth <= 767;

  // Initial animation
  setTimeout(() => {
    heading.style.transform = "translateX(0)";
    subheading.style.transform = "translateX(0)";
  }, 500);

  const updateMobileDeals = (direction = 'next') => {
    if (!isMobile()) return;
  
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
    currentDealIndex = 0; // Always reset to the first deal
  
    // Reset each deal
    dealElements.forEach((deal, index) => {
      deal.style.transition = "none"; // Disable transitions temporarily
  
      if (index === 0) {
        // First deal: visible and centered
        deal.style.opacity = "1";
        deal.style.transform = "translateX(-50%)";
      } else {
        // Other deals: hidden and offscreen
        deal.style.opacity = "0";
        deal.style.transform = "translateX(100%)";
      }
    });
  
    // Re-enable transitions after resetting
    setTimeout(() => {
      dealElements.forEach((deal) => {
        deal.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
      });
    }, 50);
  };
  
  const updateSection = () => {
    // This function remains the same, but is called more reliably.
    switch(currentSection) {
      case 0:
        // Home section
        heading.style.transform = "translateX(0)";
        heading.style.top = "auto";
        subheading.style.transform = "translateX(0)";
        subheading.style.opacity = "1";
        backgroundCard.style.transform = "translateY(0)";
        
        // Reset other sections
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
            resetDeals(); // Reset the deals for mobile
          } else {
            deals.style.transform = "translateX(0)";
            deals.style.opacity = "1"; // Show all deals for desktop
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
          
            if (isMobile()) {
            recentTransactions.style.transform = "translateX(-100%)";
            deals.style.transform = "translateX(-100%)"; // Move deals offscreen
            recentTransactions.style.opacity = "0";
            deals.style.opacity = "0";
          } else {
            recentTransactions.style.transform = "translateX(200%)";
            deals.style.transform = "translateX(200%)"; // Move deals offscreen
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
          
            // Explicitly reset deal transitions for mobile when transitioning back
            if (isMobile()) {
              dealElements.forEach((deal) => {
                deal.style.transition = "none";
              });
            }
            break;
    }
  };

  // --- REPLACEMENT CODE STARTS HERE ---

  let lastAnimationTime = 0;
  const animationCooldown = 1200; // Cooldown in ms, must be > animation duration

  const scrollToSection = (sectionIndex) => {
    const targetPosition = window.innerHeight * sectionIndex;
    isAnimatingSection = true;

    // Animate scroll
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    updateSection();

    // Release lock after animation
    setTimeout(() => {
      isAnimatingSection = false;
    }, animationDuration);
  };

  const handleSectionChange = (direction) => {
    if (isAnimatingSection) return;

    let nextSection = currentSection + (direction === 'next' ? 1 : -1);
    if (nextSection < 0 || nextSection >= totalSections) return;

    currentSection = nextSection;
    scrollToSection(currentSection);
  };

  const onWheel = (event) => {
    event.preventDefault();
    if (isAnimatingSection) return;

    const direction = event.deltaY > 0 ? 'next' : 'prev';
    handleSectionChange(direction);
  };

  // --- Touch Controls ---
  let touchStartY = 0;

  const onTouchStart = (event) => {
    touchStartY = event.touches[0].clientY;
  };

  const onTouchEnd = (event) => {
    if (isAnimatingSection) return;

    const touchEndY = event.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaY) > 50) {
      const direction = deltaY > 0 ? 'prev' : 'next';
      handleSectionChange(direction);
    }
  };

  // Add passive: false to allow preventDefault in the wheel listener
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("resize", updateSection);
});