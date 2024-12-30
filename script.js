document.addEventListener("DOMContentLoaded", () => {
  const backgroundCard = document.querySelector(".background-card");
  const heading = document.querySelector(".heading");
  const subheading = document.querySelector(".subheading");
  const recentTransactions = document.querySelector(".recent-transactions");
  const deals = document.querySelector(".deals");
  const dealElements = document.querySelectorAll(".deal");
  
  let scrollPosition = 0;
  const maxScroll = 100;
  let currentDealIndex = 0;
  const isMobile = window.innerWidth <= 600;

  // Force a complete page reload when the refresh button is clicked
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    window.location.href = window.location.href;
  }

  // Animate the headings in from the left on page load
  setTimeout(() => {
    heading.style.transform = "translateX(0)";
    subheading.style.transform = "translateX(0)";
  }, 500);

  const updateDealPositions = (progress) => {
    if (!isMobile) return;

    const dealProgress = (progress - 0.8) * 5; // Scale progress to deal transitions
    currentDealIndex = Math.floor(dealProgress);
    
    dealElements.forEach((deal, index) => {
      if (index === currentDealIndex) {
        const transitionProgress = dealProgress - currentDealIndex;
        deal.style.transform = `translateX(${(1 - transitionProgress) * -100}%)`;
        deal.style.opacity = "1";
      } else if (index === currentDealIndex - 1) {
        deal.style.transform = `translateX(100%)`;
        deal.style.opacity = "0";
      } else if (index === currentDealIndex + 1) {
        deal.style.transform = `translateX(-100%)`;
        deal.style.opacity = "0";
      } else {
        deal.style.transform = `translateX(-100%)`;
        deal.style.opacity = "0";
      }
    });
  };

  const updateScrollEffects = () => {
    const progress = Math.min(scrollPosition / maxScroll, 1);

    // Background card swipe effect
    backgroundCard.style.transform = `translateY(${progress * -100}%)`;

    // Move heading to the top
    const headingTop = Math.max(5, 65 - progress * 85);
    heading.style.transform = `translateY(${headingTop - 65}vh)`;

    // Move subheading to the right and fade it out
    subheading.style.transform = `translateX(${progress * 100}%)`;
    subheading.style.opacity = `${1 - progress}`;

    // Animate Recent Transactions subheading
    if (progress > 0.8) {
      recentTransactions.style.opacity = `${progress}`;
      recentTransactions.style.transform = `translateX(0)`;
    } else {
      recentTransactions.style.opacity = "0";
      recentTransactions.style.transform = `translateX(-100%)`;
    }

    // Handle deals animation differently for mobile and desktop
    if (isMobile) {
      if (progress > 0.8) {
        deals.style.opacity = "1";
        updateDealPositions(progress);
      } else {
        deals.style.opacity = "0";
      }
    } else {
      if (progress > 0.8) {
        deals.style.transform = "translateX(0)";
        deals.style.opacity = "1";
      } else {
        deals.style.transform = "translateX(-100%)";
        deals.style.opacity = "0";
      }
    }
  };

  const onWheel = (event) => {
    scrollPosition += event.deltaY * 0.095;
    scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
    updateScrollEffects();
  };

  let touchStartY = 0;

  const onTouchStart = (event) => {
    touchStartY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    const touchEndY = event.touches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    scrollPosition += deltaY * 1;
    scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
    updateScrollEffects();
    touchStartY = touchEndY;
  };

  window.addEventListener("wheel", onWheel);
  window.addEventListener("touchstart", onTouchStart);
  window.addEventListener("touchmove", onTouchMove);
  window.addEventListener("resize", () => {
    isMobile = window.innerWidth <= 600;
  });
});