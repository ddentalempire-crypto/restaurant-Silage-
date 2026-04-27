document.addEventListener('DOMContentLoaded', () => {
    // ---- Navbar Scroll Effect ----
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ---- Mobile Menu Toggle ----
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('mobile-open');
        });
    }

    // ---- Order Toggle (Delivery / Takeout) ----
    const orderBtns = document.querySelectorAll('.order-btn');
    orderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            orderBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // ---- Popup Logic (Discount) ----
    const popup = document.getElementById('discount-popup');
    const closePopup = document.querySelector('.close-btn');
    
    if (popup) {
        if (!sessionStorage.getItem('popupShown')) {
            setTimeout(() => {
                popup.classList.add('show');
                sessionStorage.setItem('popupShown', 'true');
            }, 5000);
        }

        if (closePopup) {
            closePopup.addEventListener('click', () => {
                popup.classList.remove('show');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('show');
            }
        });

        const popupBtn = document.querySelector('.popup-btn');
        if (popupBtn) {
            popupBtn.addEventListener('click', () => {
                popup.classList.remove('show');
            });
        }
    }

    // ---- Order Modal Logic (Hybrid Backend + WhatsApp) ----
    const orderModal = document.getElementById('order-modal');
    const closeOrderBtn = document.querySelector('.close-order-btn');
    const orderForm = document.getElementById('order-form');
    const addressField = document.getElementById('address-field');
    const orderNowBtn = document.querySelector('.order-section .btn-primary');
    let selectedOrderData = {};

    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const typeBtn = document.querySelector('.order-btn.active');
            const type = typeBtn ? typeBtn.getAttribute('data-en') : 'Delivery';
            const pkgName = "Buffet Box"; // Default package
            
            selectedOrderData = { type, pkgName };
            
            if(type === 'Delivery') {
                addressField.style.display = 'block';
                const addrInput = document.getElementById('order-address');
                if(addrInput) addrInput.required = true;
            } else {
                addressField.style.display = 'none';
                const addrInput = document.getElementById('order-address');
                if(addrInput) addrInput.required = false;
            }
            
            if(orderModal) orderModal.classList.add('show');
        });
    }

    if (closeOrderBtn) {
        closeOrderBtn.addEventListener('click', () => {
            orderModal.classList.remove('show');
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('order-name').value;
            const phone = document.getElementById('order-phone').value;
            const address = document.getElementById('order-address').value;
            
            const fullOrder = {
                ...selectedOrderData,
                name,
                phone,
                address: selectedOrderData.type === 'Delivery' ? address : 'N/A'
            };

            fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullOrder)
            })
            .then(res => res.json())
            .then(data => {
                const isArabic = document.documentElement.lang === 'ar';
                let message = isArabic ? 
                    `طلب جديد:\nالاسم: ${name}\nالموبايل: ${phone}\nالنوع: ${selectedOrderData.type}\nالعنوان: ${fullOrder.address}` :
                    `New Order:\nName: ${name}\nPhone: ${phone}\nType: ${selectedOrderData.type}\nAddress: ${fullOrder.address}`;
                
                window.open(`https://wa.me/9651822228?text=${encodeURIComponent(message)}`, '_blank');
                
                if(orderModal) orderModal.classList.remove('show');
                alert(isArabic ? 'تم استلام طلبك بنجاح!' : 'Order received successfully!');
            })
            .catch(err => {
                console.error('Error:', err);
                alert('Error processing order. Please try again.');
            });
        });
    }

    // ---- Reservation Backend Integration ----
    const resForm = document.getElementById('reservation-form');
    if (resForm) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const resData = {
                name: document.getElementById('res-name').value,
                phone: document.getElementById('res-phone').value,
                people: document.getElementById('res-people').value,
                date: document.getElementById('res-date').value,
                time: document.getElementById('res-time').value,
                occasion: document.getElementById('res-occasion').value
            };

            fetch('/api/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resData)
            })
            .then(res => res.json())
            .then(data => {
                const isArabic = document.documentElement.lang === 'ar';
                let message = isArabic ? 
                    `حجز طاولة جديد:\nالاسم: ${resData.name}\nالعدد: ${resData.people}\nالتاريخ: ${resData.date}\nالوقت: ${resData.time}` :
                    `New Table Reservation:\nName: ${resData.name}\nGuests: ${resData.people}\nDate: ${resData.date}\nTime: ${resData.time}`;
                
                window.open(`https://wa.me/9651822228?text=${encodeURIComponent(message)}`, '_blank');
                alert(isArabic ? 'تم إرسال حجزك بنجاح!' : 'Reservation sent successfully!');
            })
            .catch(err => {
                console.error('Error:', err);
                alert('Connection error. Please try again.');
            });
        });
    }

    // ---- Bilingual Functionality (AR / EN) ----
    const langToggle = document.getElementById('lang-toggle');
    const htmlElement = document.documentElement;

    const setLanguage = (lang) => {
        if (lang === 'en') {
            htmlElement.lang = 'en';
            htmlElement.dir = 'ltr';
            if(langToggle) langToggle.textContent = 'AR';
            
            document.querySelectorAll('[data-en]').forEach(el => {
                if(el.tagName === 'META') {
                    if(el.name === 'description') el.content = el.getAttribute('data-en');
                } else {
                    if(!el.getAttribute('data-ar')) el.setAttribute('data-ar', el.innerHTML);
                    el.innerHTML = el.getAttribute('data-en');
                }
            });
            localStorage.setItem('preferredLang', 'en');
        } else {
            htmlElement.lang = 'ar';
            htmlElement.dir = 'rtl';
            if(langToggle) langToggle.textContent = 'EN';
            
            document.querySelectorAll('[data-ar]').forEach(el => {
                if(el.tagName === 'META') {
                    if(el.name === 'description') el.content = el.getAttribute('data-ar');
                } else {
                    el.innerHTML = el.getAttribute('data-ar');
                }
            });
            localStorage.setItem('preferredLang', 'ar');
        }
    };

    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) setLanguage(savedLang);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            setLanguage(htmlElement.lang === 'ar' ? 'en' : 'ar');
        });
    }

    // ---- Reviews Carousel ----
    const slides = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        if(slides[index] && dots[index]) {
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }
    }

    if (slides.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
    }

    // ---- Shake Animation on Scroll ----
    const shakeForm = document.querySelector('.shake-on-reach');
    if (shakeForm) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    shakeForm.classList.add('animate-shake');
                    setTimeout(() => {
                        shakeForm.classList.remove('animate-shake');
                    }, 1000);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(shakeForm);
    }
});
