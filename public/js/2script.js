/**
 * Avi Institute of Technology - Core Client Engineering Logic
 * Operational Execution Framework Lifecycle Hooks
 */  

document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize AOS Framework Safely
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 800,
            offset: 100
        });
    }

    /* ========================================================
       APPLICATION PAGE LOADER TERMINATION
       ======================================================== */
    const loader = document.getElementById("loader");
    if (loader) {
        window.addEventListener("load", () => {
            setTimeout(() => {
                loader.classList.add("fade-out");
            }, 400); // Guarantees critical painting frame validation buffers
        });
    }

    /* ========================================================
       SCROLL HEURISTICS ENGINE (NAVBAR & PROGRESS MONITOR)
       ======================================================== */
    const navbar = document.getElementById("navbar");
    const progressBar = document.getElementById("progress-bar");

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Compute and map vertical progress percentages
        if (documentHeight > 0) {
            const scrollPercentage = (scrollY / documentHeight) * 100;
            progressBar.style.width = `${scrollPercentage}%`;
        }

        // Structural dynamic condensation mechanics for fixed header
        if (scrollY > 50) {
            navbar.classList.add("py-2.5", "bg-darkbg/90", "shadow-[0_4px_30px_rgba(0,0,0,0.3)]");
            navbar.classList.remove("py-4", "bg-darkbg/70");
        } else {
            navbar.classList.add("py-4", "bg-darkbg/70");
            navbar.classList.remove("py-2.5", "bg-darkbg/90", "shadow-[0_4px_30px_rgba(0,0,0,0.3)]");
        }
    });

    /* ========================================================
       RESPONSIVE MOBILE VIEWPORT VIEWPORT STRIPS INTERACTION
       ======================================================== */
    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            const isExpanded = mobileMenu.classList.contains("scale-y-100");
            if (isExpanded) {
                mobileMenu.classList.remove("scale-y-100");
                mobileMenu.classList.add("scale-y-0");
                menuBtn.innerHTML = '<i class="fa-solid fa-bars text-2xl"></i>';
            } else {
                mobileMenu.classList.remove("scale-y-0");
                mobileMenu.classList.add("scale-y-100");
                menuBtn.innerHTML = '<i class="fa-solid fa-xmark text-2xl"></i>';
            }
        });

        // Close menu sheet panels on link invocation actions
        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("scale-y-100");
                mobileMenu.classList.add("scale-y-0");
                menuBtn.innerHTML = '<i class="fa-solid fa-bars text-2xl"></i>';
            });
        });
    }

    /* ========================================================
       ASYNCHRONOUS DATA COUNTER RUNNER INDEXERS
       ======================================================== */
    const counters = document.querySelectorAll(".counter");
    
    const runCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            const count = +counter.innerText;
            // Adaptive speed tuning variable matrix
            const speed = target / 60; 

            if (count < target) {
                counter.innerText = Math.ceil(count + speed);
                setTimeout(runCounters, 20);
            } else {
                counter.innerText = target.toLocaleString();
            }
        });
    };

    // Intersection observer monitoring array initialization bounds
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroSection = document.querySelector(".counter");
    if (heroSection) {
        counterObserver.observe(heroSection.parentElement.parentElement);
    }

    /* ========================================================
       AUTOMATED LOOP CAROUSEL SLIDERS (TESTIMONIALS STRUCTURE)
       ======================================================== */
    const slides = document.querySelectorAll(".testimonial-slide");
    let currentSlideIdx = 0;

    if (slides.length > 0) {
        setInterval(() => {
            // Un-stage standard display vectors
            slides[currentSlideIdx].classList.remove("opacity-100");
            slides[currentSlideIdx].classList.add("opacity-0", "pointer-events-none");
            
            // Increment loop pointer limits safely via matrix modulo math 
            currentSlideIdx = (currentSlideIdx + 1) % slides.length;

            // Stage immediate presentation layers
            slides[currentSlideIdx].classList.remove("opacity-0", "pointer-events-none");
            slides[currentSlideIdx].classList.add("opacity-100");
        }, 6000); // 6-Second operational retention frame threshold arrays
    }
});

/* ========================================================
   GLOBAL PROFILE NAVIGATION CONTROLLERS (GLOBAL ROUTERS)
   ======================================================== */

// Tab Menu System View Routing Matrix logic
window.switchTab = (event, tabId) => {
    const tabContainer = event.currentTarget.parentElement;
    const sectionContainer = tabContainer.parentElement;
    
    // Toggle Tab Active Styles
    tabContainer.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active", "text-accentPurple", "border-b-2", "border-accentPurple");
        btn.classList.add("text-lightGray/60");
    });
    event.currentTarget.classList.add("active", "text-accentPurple", "border-b-2", "border-accentPurple");
    event.currentTarget.classList.remove("text-lightGray/60");

    // Toggle Content Panels Visible Output
    sectionContainer.querySelectorAll(".tab-content").forEach(content => {
        content.classList.add("hidden");
    });
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) selectedContent.classList.remove("hidden");
};

// UI Accordion Mechanics Interaction Triggers
window.toggleFaq = (buttonElement) => {
    const targetWrapper = buttonElement.parentElement;
    const answerPanel = targetWrapper.querySelector(".faq-answer");
    const directionalIcon = buttonElement.querySelector(".fa-chevron-down");
    
    if (answerPanel.style.maxHeight && answerPanel.style.maxHeight !== "0px") {
        answerPanel.style.maxHeight = "0px";
        directionalIcon.style.transform = "rotate(0deg)";
        targetWrapper.classList.remove("border-accentPurple/40");
    } else {
        // Handle collapse actions across matching elements cleanly first
        document.querySelectorAll(".faq-answer").forEach(pnl => pnl.style.maxHeight = "0px");
        document.querySelectorAll(".faq-item i").forEach(icn => icn.style.transform = "rotate(0deg)");
        document.querySelectorAll(".faq-item").forEach(item => item.classList.remove("border-accentPurple/40"));

        // Engage active states
        answerPanel.style.maxHeight = `${answerPanel.scrollHeight}px`;
        directionalIcon.style.transform = "rotate(180deg)";
        targetWrapper.classList.add("border-accentPurple/40");
    }
};