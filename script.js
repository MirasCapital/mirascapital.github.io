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

  const isMobile = () => window.innerWidth <= 767;

  // Animate headings on page load
  setTimeout(() => {
    heading.style.transform = "translateX(0)";
    subheading.style.transform = "translateX(0)";
  }, 500);

  const updateMobileDeals = (progress) => {
    if (!isMobile()) return;

    // Calculate which deal should be shown based on scroll progress
    const dealsProgress = (progress - 0.8) * 5; // Spread the remaining 0.2 progress across deals
    currentDealIndex = Math.min(Math.floor(dealsProgress), dealElements.length - 1);

    dealElements.forEach((deal, index) => {
      if (index === currentDealIndex) {
        // Add the active class to the current deal
        deal.classList.add("active");
      } else {
        // Remove the active class from other deals
        deal.classList.remove("active");
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
      if (isMobile()) {
        updateMobileDeals(progress);
      } else {
        updateDesktopDeals(progress);
      }
    } else {
      if (isMobile()) {
        dealElements.forEach((deal) => deal.classList.remove("active"));
      } else {
        deals.style.transform = "translateX(-100%)";
        deals.style.opacity = "0";
      }
    }
  };

  // Scroll handling
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
    scrollPosition += deltaY * 0.5;
    scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
    updateScrollEffects();
    touchStartY = touchEndY;
  };

  // Handle resize
  window.addEventListener("resize", updateScrollEffects);
  window.addEventListener("wheel", onWheel);
  window.addEventListener("touchstart", onTouchStart);
  window.addEventListener("touchmove", onTouchMove);
});
