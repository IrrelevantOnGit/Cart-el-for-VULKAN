(function () {
    function createFallbackText(sourceImage) {
        var fallback = document.createElement('span');
        fallback.className = 'logo-fallback-text';
        fallback.textContent = 'CART-EL';
        if (sourceImage.classList.contains('footer-logo')) {
            fallback.style.fontSize = '1rem';
        }
        return fallback;
    }

    function attachLogoFallback() {
        var logos = document.querySelectorAll('img.main-logo');
        logos.forEach(function (logo) {
            logo.addEventListener('error', function () {
                var fallback = createFallbackText(logo);
                logo.replaceWith(fallback);
            }, { once: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachLogoFallback);
    } else {
        attachLogoFallback();
    }
})();
