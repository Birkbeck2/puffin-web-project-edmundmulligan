function switchAnimatedWeb(restoreScroll = null) {
    const selectedFormat = document.querySelector('input[name="animation-format"]:checked').value;
    const animatedWeb = document.getElementById('animated-web');
    
    // Add timestamp to force reload for gif/webp
    const timestamp = new Date().getTime();
    
    if (selectedFormat === 'mp4') {
        animatedWeb.innerHTML = `<video id="animation-video" autoplay muted playsinline width="800">
            <source src="images/animated-web.${selectedFormat}?t=${timestamp}" type="video/mp4">
        </video>`;
    } else {
        // For webp and gif, use img tag with timestamp to force reload
        animatedWeb.innerHTML = `<img src="images/animated-web.${selectedFormat}?t=${timestamp}" alt="Promotional Montage Animation" width="800">`;
    }
    
    // Restore scroll if position was provided
    // this is to stop the page from jumping to the top when the image/video is reloaded
    if (restoreScroll) {
        const restore = () => window.scrollTo(restoreScroll.x, restoreScroll.y);
        restore();
        requestAnimationFrame(restore);
        setTimeout(restore, 0);
        setTimeout(restore, 10);
        setTimeout(restore, 50);
    }
}

function restartAnimation() {
    const selectedFormat = document.querySelector('input[name="animation-format"]:checked').value;
    const animatedWeb = document.getElementById('animated-web');
    
    if (selectedFormat === 'mp4') {
        // For MP4, find the video element and restart it
        const video = document.getElementById('animation-video');
        if (video) {
            video.currentTime = 0;
            video.play();
        }
    } else {
        // For gif/webp, reload by switching with scroll restoration
        const scrollPos = { x: window.scrollX, y: window.scrollY };
        switchAnimatedWeb(scrollPos);
    }
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="animation-format"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', switchAnimatedWeb);
    });
    
    // Add restart button listener
    const restartButton = document.getElementById('restart-animation');
    if (restartButton) {
        restartButton.addEventListener('click', function(event) {
            event.preventDefault();
            restartAnimation();
            return false;
        });
    }
    
    // Load the initial format on page load
    switchAnimatedWeb();
});