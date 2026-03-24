function switchLogo() {
    const selectedColor = document.querySelector('input[name="logoColor"]:checked').value;
    const logoImage = document.getElementById('logoImage');
    logoImage.src = `images/logo-embodied-mind-with-name-${selectedColor}.svg`;
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="logoColor"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', switchLogo);
    });
});