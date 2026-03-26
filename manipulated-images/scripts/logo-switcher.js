function switchLogo() {
    const selectedColour = document.querySelector('input[name="logoColour"]:checked').value;
    const logoImage = document.getElementById('logoImage');
    logoImage.src = `images/logo-embodied-mind-with-name-${selectedColour}.svg`;
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="logoColour"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', switchLogo);
    });
});