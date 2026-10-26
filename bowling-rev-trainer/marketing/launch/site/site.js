(function () {
  var L = window.RR_LINKS || {};
  var els = document.querySelectorAll('[data-link]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i], key = el.getAttribute('data-link'), url = L[key];
    if (url) {
      el.setAttribute('href', url);
      el.setAttribute('rel', 'noopener');
      el.setAttribute('target', '_blank');
    } else if (el.classList.contains('btn')) {
      el.classList.add('soon');
      el.removeAttribute('href');
      el.textContent = el.getAttribute('data-soon') || 'Shop opens this week';
    } else if (el.parentNode && el.parentNode.tagName === 'LI') {
      el.parentNode.parentNode.removeChild(el.parentNode);
    } else {
      el.parentNode.removeChild(el);
    }
  }
})();
