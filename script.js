document.addEventListener("DOMContentLoaded", () => {
  const backgroundCard = document.querySelector(".background-card");
  const heading = document.querySelector(".heading");
  const subheading = document.querySelector(".subheading");
  const aboutHeading = document.querySelector(".about-heading");
  const aboutContent = document.querySelector(".about-content");
  const recentTransactions = document.querySelector(".recent-transactions");
  const deals = document.querySelector(".deals");
  const dealElements = Array.from(document.querySelectorAll(".deal"));

  let currentSection = 0;
  let currentDealIndex = 0;
  const totalSections = 3;
  const maxDeals = dealElements.length;
  let isAnimating = false;
  let isDealSwiping = false;

  const isMobile = () => window.innerWidth <= 767;

  // Initial animation
  setTimeout(() => {
    heading.style.transform = "translateX(0)";
    subheading.style.transform = "translateX(0)";
  }, 500);

  const updateMobileDeals = (direction = 'next') => {
    if (!isMobile()) return;
    
    isDealSwiping = true;

    // Current deal exits
    dealElements[currentDealIndex].style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    dealElements[currentDealIndex].style.transform = `translateX(${direction === 'next' ? '-200%' : '100%'})`;
    dealElements[currentDealIndex].style.opacity = "0";

    // Update index
    if (direction === 'next') {
      currentDealIndex = (currentDealIndex + 1) % maxDeals;
    } else {
      currentDealIndex = currentDealIndex === 0 ? maxDeals - 1 : currentDealIndex - 1;
    }

    // Position new deal off-screen
    dealElements[currentDealIndex].style.transition = 'none';
    dealElements[currentDealIndex].style.transform = `translateX(${direction === 'next' ? '100%' : '-200%'})`;
    dealElements[currentDealIndex].style.opacity = "0";

    // Force reflow
    dealElements[currentDealIndex].offsetHeight;

    // Bring in new deal
    dealElements[currentDealIndex].style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    dealElements[currentDealIndex].style.transform = 'translateX(-50%)';
    dealElements[currentDealIndex].style.opacity = "1";

    // Reset flag after animation
    setTimeout(() => {
      isDealSwiping = false;
    }, 300);
  };

  const updateSection = () => {
    isAnimating = true;
    
    switch(currentSection) {
      case 0:
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
        break;

      case 1:
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
        break;

      case 2:
        heading.style.transform = "translateY(-60vh)";
        subheading.style.transform = "translateX(200%)";
        subheading.style.opacity = "0";
        
        aboutHeading.style.transform = "translateX(200%)";
        aboutContent.style.transform = "translateX(200%)";
        aboutHeading.style.opacity = "0";
        aboutContent.style.opacity = "0";
        
        recentTransactions.style.transform = "translateX(0)";
        recentTransactions.style.opacity = "1";
        
        if (!isMobile()) {
          deals.style.transform = "translateX(0)";
          deals.style.opacity = "1";
        } else {
          deals.style.opacity = "1";
          // Initialize the first deal
          dealElements.forEach((deal, index) => {
            deal.style.opacity = index === 0 ? "1" : "0";
            deal.style.transform = index === 0 ? "translateX(-50%)" : "translateX(100%)";
          });
        }
        break;
    }

    setTimeout(() => {
      isAnimating = false;
    }, 1000);
  };

  const handleSectionChange = (direction) => {
    if (isAnimating) return;

    if (direction === 'next' && currentSection < totalSections - 1) {
      currentSection++;
      updateSection();
    } else if (direction === 'prev' && currentSection > 0) {
      currentSection--;
      updateSection();
    }
  };

  const onWheel = (event) => {
    if (isAnimating) return;
    handleSectionChange(event.deltaY > 0 ? 'next' : 'prev');
  };

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  
  const onTouchStart = (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
  };

  const onTouchMove = (event) => {
    if (isAnimating || isDealSwiping) return;

    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    const touchDuration = Date.now() - touchStartTime;

    // Only process if touch duration is short enough (for better responsiveness)
    if (touchDuration > 300) return;

    if (isMobile() && currentSection === 2 && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      // Horizontal swipe for deals
      updateMobileDeals(deltaX > 0 ? 'next' : 'prev');
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      // Vertical swipe for section changes
      handleSectionChange(deltaY > 0 ? 'next' : 'prev');
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
  };

  window.addEventListener("resize", updateSection);
  window.addEventListener("wheel", onWheel);
  window.addEventListener("touchstart", onTouchStart);
  window.addEventListener("touchmove", onTouchMove);
});