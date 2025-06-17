
document.addEventListener('DOMContentLoaded', function () {
    const pricingToggle = document.getElementById('pricing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');

    pricingToggle.addEventListener('change', function () {
        if (this.checked) {
            // Show annual prices
            monthlyPrices.forEach(price => price.classList.add('hidden'));
            annualPrices.forEach(price => price.classList.remove('hidden'));
        } else {
            // Show monthly prices
            monthlyPrices.forEach(price => price.classList.remove('hidden'));
            annualPrices.forEach(price => price.classList.add('hidden'));
        }
    });
});