
document.addEventListener('DOMContentLoaded', () => {
    
    const cursor = document.querySelector('.creative-cursor');
    const ring = document.querySelector('.creative-cursor-ring');
    const links = document.querySelectorAll('a, button, .scroll-down, .search, .menu_bar');

    if (cursor && ring) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(ring, { x: e.clientX - 13.5, y: e.clientY - 13.5, duration: 0.25 });
        });

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                ring.classList.add('active');
                gsap.to(cursor, { scale: 1.5, opacity: 0.5 });
            });
            link.addEventListener('mouseleave', () => {
                ring.classList.remove('active');
                gsap.to(cursor, { scale: 1, opacity: 1 });
            });
        });
    }

    
    const magneticBtns = document.querySelectorAll('.tj-primary-btn, .project-btn, .slider-prev, .slider-next');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { 
                x: x * 0.3, 
                y: y * 0.3, 
                duration: 0.3, 
                ease: "power2.out" 
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });

    
    const progressLine = document.querySelector('.creative-scroll-progress');
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        if (progressLine) progressLine.style.width = `${progress}%`;
    });

    
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const reveals = document.querySelectorAll('.tj-banner-section-2, .tj-client-section-2, .tj-choose-section, .tj-about-section-2, .tj-service-section, .tj-project-section-3, .tj-testimonial-section-3, .tj-team-section-2, .tj-faq-section-2, .footer-area');
        
        reveals.forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        
        gsap.utils.toArray('.sec-title').forEach(title => {
            gsap.from(title, {
                backgroundPosition: "200% center",
                duration: 2,
                ease: "power1.inOut",
                scrollTrigger: {
                    trigger: title,
                    start: "top 90%",
                }
            });
        });
    }
});
