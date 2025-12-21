// Add touch/long-press fallbacks for elements that only show tooltips on hover
(function(){
  function showTooltip(el) {
    const tip = el.querySelector('.tooltip');
    if (!tip) return;
    tip.classList.add('show-tooltip');
    setTimeout(() => tip.classList.remove('show-tooltip'), 2200);
  }

  function attach() {
    // Elements that have tooltip children
    const parents = document.querySelectorAll('.milestone-badge, .share-icon, .tooltip-wrapper, .nav a');
    parents.forEach(p => {
      p.addEventListener('touchstart', function (e) {
        showTooltip(p);
      }, { passive: true });

      // long press
      let pressTimer = null;
      p.addEventListener('touchstart', function(e) {
        pressTimer = setTimeout(() => showTooltip(p), 600);
      });
      p.addEventListener('touchend', function(e) {
        if (pressTimer) clearTimeout(pressTimer);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
