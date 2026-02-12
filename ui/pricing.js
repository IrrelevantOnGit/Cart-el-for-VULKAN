document.addEventListener('DOMContentLoaded', function() {
    // ===== PRICING TOGGLE =====
    const toggle = document.getElementById('pricingToggle');
    const prices = document.querySelectorAll('.price-amount');
    const periods = document.querySelectorAll('.plan-period');
    
    // Prices configuration
    const pricingData = {
        monthly: ['999', '2999', 'Custom'],
        yearly: ['9,999', '29,999', 'Custom']
    };

    if (toggle) {
        toggle.addEventListener('change', function() {
            const isYearly = this.checked;
            
            prices.forEach((price, index) => {
                // Add fade out effect
                price.style.opacity = '0';
                
                setTimeout(() => {
                    if (isYearly) {
                        price.textContent = pricingData.yearly[index];
                        if (periods[index]) periods[index].textContent = '/yr';
                    } else {
                        price.textContent = pricingData.monthly[index];
                        if (periods[index]) periods[index].textContent = '/mo';
                    }
                    // Fade in
                    price.style.opacity = '1';
                }, 200);
            });
        });
    }

    // ===== FAQ ACCORDION =====
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current
            item.classList.toggle('active');
        });
    });
});