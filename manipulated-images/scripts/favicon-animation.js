// Favicon animation controller - loads SVG and toggles animation class
document.addEventListener('DOMContentLoaded', async () => {
    const faviconContainer = document.getElementById('faviconContainer');
    const animatedRadios = document.querySelectorAll('input[name="animated"]');
    
    if (!faviconContainer) return;
    
    // Load SVG from external file
    try {
        const response = await fetch('images/favicon-inline.svg');
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = svgDoc.querySelector('svg');
        
        // Set width attribute
        svg.setAttribute('width', '150');
        
        // Insert SVG into container
        faviconContainer.appendChild(svg);
        
        // Add event listeners to radio buttons
        animatedRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const animate = e.target.value === 'true';
                
                if (animate) {
                    svg.classList.add('animated');
                } else {
                    svg.classList.remove('animated');
                }
            });
        });
        
        // Initialize with current selection
        const checkedRadio = document.querySelector('input[name="animated"]:checked');
        if (checkedRadio && checkedRadio.value === 'true') {
            svg.classList.add('animated');
        }
    } catch (error) {
        console.error('Error loading favicon SVG:', error);
    }
});
