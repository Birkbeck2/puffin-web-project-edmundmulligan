function switchBackground() {
    const selectedTheme = document.querySelector('input[name="backgroundTheme"]:checked').value;
    const selectedOrientation = document.querySelector('input[name="backgroundOrientation"]:checked').value;
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src = `images/background-web-${selectedOrientation}-${selectedTheme}.svg`;
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="backgroundTheme"], input[name="backgroundOrientation"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', switchBackground);
    });
});