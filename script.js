// Feature Detection and Progressive Enhancement
(function() {
    'use strict';
    
    // Feature detection
    var hasCSS3DTransforms = (function() {
        var el = document.createElement('p'), 
            has3d,
            transforms = {
                'webkitTransform':'-webkit-transform',
                'OTransform':'-o-transform',
                'msTransform':'-ms-transform',
                'MozTransform':'-moz-transform',
                'transform':'transform'
            };

        document.body.insertBefore(el, null);
        for(var t in transforms){
            if( el.style[t] !== undefined ){
                el.style[t] = 'translate3d(1px,1px,1px)';
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            }
        }
        document.body.removeChild(el);
        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
    })();

    // CSS Grid detection
    var hasGrid = CSS.supports && CSS.supports('display', 'grid');
    
    // Add classes to html element
    var html = document.documentElement;
    html.className += hasCSS3DTransforms ? ' csstransforms' : ' no-csstransforms';
    html.className += hasGrid ? ' cssgrid' : ' no-cssgrid';
    
    // Intersection Observer fallback
    var observerSupported = 'IntersectionObserver' in window;
    
    // Header scroll effect with fallback
    function handleScroll() {
        var header = document.getElementById('header');
        if (header) {
            if (window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
    
    // Smooth scrolling with fallback
    function smoothScroll(target, duration) {
        duration = duration || 800;
        var targetPosition = target.offsetTop - 70;
        var startPosition = window.pageYOffset;
        var distance = targetPosition - startPosition;
        var startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Initialize on DOM ready
    function init() {
        // Header scroll effect
        if (window.addEventListener) {
            window.addEventListener('scroll', handleScroll, false);
        } else {
            window.attachEvent('onscroll', handleScroll);
        }

        // Smooth scrolling for navigation links
        var navLinks = document.querySelectorAll('a[href^="#"]');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    if ('scrollBehavior' in document.documentElement.style) {
                        var headerHeight = document.querySelector('.header').offsetHeight;
                        var targetPosition = target.offsetTop - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        smoothScroll(target);
                    }
                }
            });
        }

        // Slide-in animations with fallback
        if (observerSupported && hasCSS3DTransforms) {
            var slideObserverOptions = {
                threshold: 0.2,
                rootMargin: '0px 0px -100px 0px'
            };

            var slideObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, slideObserverOptions);

            var slideElements = document.querySelectorAll('.slide-in-left, .slide-in-right');
            for (var j = 0; j < slideElements.length; j++) {
                slideObserver.observe(slideElements[j]);
            }
        } else {
            // Fallback: Simple scroll-based animation
            function checkSlideElements() {
                var slideElements = document.querySelectorAll('.slide-in-left, .slide-in-right');
                var windowHeight = window.innerHeight;
                
                for (var k = 0; k < slideElements.length; k++) {
                    var element = slideElements[k];
                    var elementTop = element.getBoundingClientRect().top;
                    
                    if (elementTop < windowHeight - 100) {
                        element.classList.add('visible');
                    }
                }
            }
            
            if (window.addEventListener) {
                window.addEventListener('scroll', checkSlideElements, false);
                window.addEventListener('load', checkSlideElements, false);
            } else {
                window.attachEvent('onscroll', checkSlideElements);
                window.attachEvent('onload', checkSlideElements);
            }
        }

        // Parallax effect with performance check
        if (hasCSS3DTransforms && !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            var ticking = false;
            
            function updateParallax() {
                var scrolled = window.pageYOffset;
                var hero = document.querySelector('.hero');
                if (hero) {
                    hero.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
                }
                ticking = false;
            }
            
            function requestTick() {
                if (!ticking) {
                    requestAnimationFrame(updateParallax);
                    ticking = true;
                }
            }
            
            if (window.addEventListener) {
                window.addEventListener('scroll', requestTick, false);
            } else {
                window.attachEvent('onscroll', requestTick);
            }
        }
    }

    // DOM Ready cross-browser
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Additional loading check for IE
    if (window.attachEvent) {
        window.attachEvent('onload', function() {
            document.body.classList.add('loaded');
        });
    } else {
        window.addEventListener('load', function() {
            document.body.classList.add('loaded');
        });
    }
})();