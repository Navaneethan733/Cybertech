

document.addEventListener('DOMContentLoaded', () => {
    console.log("STACKLY Premium Core Initialized.");

    
    const grid = document.createElement('div');
    grid.className = 'cyber-grid';
    document.body.appendChild(grid);

    
    
    
    

    
    const revealElements = document.querySelectorAll('.sec-title, .service-block, .about-block');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < triggerBottom) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'all 0.6s ease-out';
            }
        });
    };

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 

    
    const cards = document.querySelectorAll('.service-block .inner-box');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
