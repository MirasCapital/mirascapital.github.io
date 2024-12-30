document.addEventListener("DOMContentLoaded", () => {
    const backgroundCard = document.querySelector(".background-card");
    const heading = document.querySelector(".heading");
    const subheading = document.querySelector(".subheading");
    const recentTransactions = document.querySelector(".recent-transactions");
    const deals = document.querySelector(".deals");
  
    let scrollPosition = 0;
    const maxScroll = 100;
  
    // Animate the headings in from the left on page load
    setTimeout(() => {
      heading.style.transform = "translateX(0)";
      subheading.style.transform = "translateX(0)";
    }, 500);
  
    /**
     * Update animations based on scroll progress.
     */
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
  
      // Animate deals in from the left
      if (progress > 0.8) {
        deals.style.transform = "translateX(0)";
        deals.style.opacity = "1";
      } else {
        deals.style.transform = "translateX(-100%)";
        deals.style.opacity = "0";
      }
    };
  
    /**
     * Handle scroll events to update the animation progress.
     */
    const onWheel = (event) => {
      scrollPosition += event.deltaY * 0.095;
      scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
      updateScrollEffects();
    };
  
    window.addEventListener("wheel", onWheel);
  });
  