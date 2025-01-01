document.addEventListener("DOMContentLoaded", () => {
  const backgroundCard = document.querySelector(".background-card");
  const heading = document.querySelector(".heading");
  const subheading = document.querySelector(".subheading");
  const recentTransactions = document.querySelector(".recent-transactions");
  const deals = document.querySelector(".deals");
  const dealElements = Array.from(document.querySelectorAll(".deal"));

  let scrollPosition = 0;
  const maxScroll = 100;
  let currentDealIndex = 0;
  const maxDeals = dealElements.length;

  const isMobile = () => window.innerWidth <= 767;

  // Animate headings on page load
  setTimeout(() => {
    heading.style.transform = "translateX(0)";
    subheading.style.transform = "translateX(0)";
  }, 500);

  const updateMobileDeals = () => {
    if (!isMobile()) return;

    dealElements.forEach((deal, index) => {
      if (index === currentDealIndex) {
        // Current deal - center it
        deal.style.opacity = "1";
        deal.style.transform = "translateX(-50%)"; // Center the active deal
      } else {
        // Hide other deals
        deal.style.opacity = "0";
        deal.style.transform = "translateX(-200%)"; // Off-screen to the left
      }
    });
  };

  const updateDesktopDeals = (progress) => {
    if (isMobile()) return;

    if (progress > 0.8) {
      deals.style.transform = "translateX(0)";
      deals.style.opacity = "1";
    } else {
      deals.style.transform = "translateX(-100%)";
      deals.style.opacity = "0";
    }
  };

  const updateScrollEffects = () => {
    const progress = Math.min(scrollPosition / maxScroll, 1);

    // Background card effect
    backgroundCard.style.transform = `translateY(${progress * -100}%)`;

    // Heading movement
    const headingTop = Math.max(5, 65 - progress * 85);
    heading.style.transform = `translateY(${headingTop - 65}vh)`;

    // Subheading animation
    subheading.style.transform = `translateX(${progress * 100}%)`;
    subheading.style.opacity = `${1 - progress}`;

    // Recent Transactions text
    if (progress > 0.8) {
      recentTransactions.style.opacity = `${progress}`;
      recentTransactions.style.transform = "translateX(0)";
    } else {
      recentTransactions.style.opacity = "0";
      recentTransactions.style.transform = "translateX(-100%)";
    }

    // Deals animation
    if (progress > 0.8) {
      deals.style.opacity = "1";
      if (isMobile()) {
        updateMobileDeals();
      } else {
        updateDesktopDeals(progress);
      }
    } else {
      deals.style.opacity = "0";
      // Reset deals position when scrolling back
      if (isMobile()) {
        dealElements.forEach((deal) => {
          deal.style.opacity = "0";
          deal.style.transform = "translateX(-200%)";
        });
      } else {
        deals.style.transform = "translateX(-100%)";
      }
    }
  };

  // Scroll handling
  const onWheel = (event) => {
    scrollPosition += event.deltaY * 0.095;
    scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
    updateScrollEffects();
  };

  let touchStartX = 0;
  let touchStartY = 0;
  const onTouchStart = (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;

    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    if (isMobile() && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      // Horizontal swipe for deals
      currentDealIndex = (currentDealIndex + 1) % maxDeals; // Always cycle forward
      updateMobileDeals();
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      // Vertical scroll for the rest of the page
      scrollPosition += deltaY * 0.5;
      scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
      updateScrollEffects();
    }

    touchStartX = touchEndX; // Reset touch start position
    touchStartY = touchEndY;
  };

  // Handle resize
  window.addEventListener("resize", updateScrollEffects);
  window.addEventListener("wheel", onWheel);
  window.addEventListener("touchstart", onTouchStart);
  window.addEventListener("touchmove", onTouchMove);
});
