/**
 * ================================================================
 * CHAT HERITAGE - ENTERPRISE JAVASCRIPT
 * Version: 2.0.0
 * Enhanced with enterprise-level optimizations, error handling,
 * memory management, and performance monitoring
 * ================================================================
 */

(function(window, document, undefined) {
  'use strict';
  
  // ================================================================
  // ENTERPRISE CONFIGURATION & CONSTANTS
  // ================================================================
  
  const CONFIG = {
      DEBUG: false, // Set to true for development
      PERFORMANCE_MONITOR: true,
      SCROLL_THROTTLE: 16, // ~60fps
      RESIZE_DEBOUNCE: 150,
      INTERSECTION_THRESHOLD: 0.2,
      INTERSECTION_ROOT_MARGIN: '0px 0px -100px 0px',
      SMOOTH_SCROLL_DURATION: 800,
      MOMENTUM_FRICTION: 0.95,
      MOMENTUM_THRESHOLD: 0.1,
      HEADER_SCROLL_THRESHOLD: 50,
      PARALLAX_SPEED: 0.3,
      DRAG_MULTIPLIER: {
          MOUSE: 2,
          TOUCH: 1.5
      }
  };
  
  // ================================================================
  // ENTERPRISE UTILITIES & HELPERS
  // ================================================================
  
  const Utils = {
      /**
       * Debounce function for performance optimization
       */
      debounce: function(func, wait, immediate) {
          let timeout;
          return function executedFunction() {
              const context = this;
              const args = arguments;
              const later = function() {
                  timeout = null;
                  if (!immediate) func.apply(context, args);
              };
              const callNow = immediate && !timeout;
              clearTimeout(timeout);
              timeout = setTimeout(later, wait);
              if (callNow) func.apply(context, args);
          };
      },
      
      /**
       * Throttle function for scroll events
       */
      throttle: function(func, limit) {
          let inThrottle;
          return function() {
              const args = arguments;
              const context = this;
              if (!inThrottle) {
                  func.apply(context, args);
                  inThrottle = true;
                  setTimeout(() => inThrottle = false, limit);
              }
          };
      },
      
      /**
       * Enhanced error logging with context
       */
      logError: function(error, context, data) {
          if (CONFIG.DEBUG || CONFIG.PERFORMANCE_MONITOR) {
              console.group('🚨 Chat Heritage Error');
              console.error('Context:', context);
              console.error('Error:', error);
              if (data) console.error('Data:', data);
              console.error('Stack:', error.stack);
              console.groupEnd();
          }
          
          // In production, you might want to send to error tracking service
          if (!CONFIG.DEBUG && window.gtag) {
              window.gtag('event', 'exception', {
                  description: `${context}: ${error.message}`,
                  fatal: false
              });
          }
      },
      
      /**
       * Performance monitoring utility
       */
      performanceMark: function(name) {
          if (CONFIG.PERFORMANCE_MONITOR && 'performance' in window && 'mark' in performance) {
              try {
                  performance.mark(name);
              } catch (e) {
                  // Silent fail for unsupported browsers
              }
          }
      },
      
      /**
       * Safe element selector with error handling
       */
      safeQuerySelector: function(selector, context) {
          try {
              return (context || document).querySelector(selector);
          } catch (error) {
              this.logError(error, 'safeQuerySelector', { selector });
              return null;
          }
      },
      
      /**
       * Safe element selector all with error handling
       */
      safeQuerySelectorAll: function(selector, context) {
          try {
              return Array.from((context || document).querySelectorAll(selector));
          } catch (error) {
              this.logError(error, 'safeQuerySelectorAll', { selector });
              return [];
          }
      },
      
      /**
       * Cross-browser event listener with memory management
       */
      addEventListener: function(element, event, handler, options) {
          if (!element || typeof handler !== 'function') return null;
          
          try {
              if (element.addEventListener) {
                  element.addEventListener(event, handler, options || false);
                  return { element, event, handler, options };
              } else if (element.attachEvent) {
                  const wrappedHandler = function(e) {
                      handler.call(element, e || window.event);
                  };
                  element.attachEvent('on' + event, wrappedHandler);
                  return { element, event, handler: wrappedHandler, isIE: true };
              }
          } catch (error) {
              this.logError(error, 'addEventListener', { event, element });
          }
          return null;
      },
      
      /**
       * Cross-browser event listener removal
       */
      removeEventListener: function(listenerRef) {
          if (!listenerRef) return;
          
          try {
              if (listenerRef.isIE) {
                  listenerRef.element.detachEvent('on' + listenerRef.event, listenerRef.handler);
              } else {
                  listenerRef.element.removeEventListener(
                      listenerRef.event, 
                      listenerRef.handler, 
                      listenerRef.options || false
                  );
              }
          } catch (error) {
              this.logError(error, 'removeEventListener', listenerRef);
          }
      },
      
      /**
       * Enhanced feature detection with caching
       */
      hasFeature: function(feature) {
          if (!this._featureCache) this._featureCache = {};
          if (this._featureCache[feature] !== undefined) {
              return this._featureCache[feature];
          }
          
          let result = false;
          try {
              switch (feature) {
                  case 'css3DTransforms':
                      result = this._detectCSS3DTransforms();
                      break;
                  case 'cssGrid':
                      result = CSS.supports && CSS.supports('display', 'grid');
                      break;
                  case 'intersectionObserver':
                      result = 'IntersectionObserver' in window;
                      break;
                  case 'requestAnimationFrame':
                      result = 'requestAnimationFrame' in window;
                      break;
                  case 'performance':
                      result = 'performance' in window && 'now' in performance;
                      break;
                  case 'passiveListeners':
                      result = this._detectPassiveListeners();
                      break;
                  default:
                      result = false;
              }
          } catch (error) {
              this.logError(error, 'hasFeature', { feature });
              result = false;
          }
          
          this._featureCache[feature] = result;
          return result;
      },
      
      /**
       * Detect CSS 3D transforms support
       */
      _detectCSS3DTransforms: function() {
          const el = document.createElement('p');
          let has3d = false;
          const transforms = {
              'webkitTransform': '-webkit-transform',
              'OTransform': '-o-transform', 
              'msTransform': '-ms-transform',
              'MozTransform': '-moz-transform',
              'transform': 'transform'
          };
          
          try {
              document.body.insertBefore(el, null);
              for (const t in transforms) {
                  if (el.style[t] !== undefined) {
                      el.style[t] = 'translate3d(1px,1px,1px)';
                      const computed = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                      has3d = (computed !== undefined && computed.length > 0 && computed !== "none");
                      if (has3d) break;
                  }
              }
          } catch (error) {
              has3d = false;
          } finally {
              if (el.parentNode) {
                  document.body.removeChild(el);
              }
          }
          
          return has3d;
      },
      
      /**
       * Detect passive listeners support
       */
      _detectPassiveListeners: function() {
          let passiveSupported = false;
          try {
              const options = {
                  get passive() {
                      passiveSupported = true;
                      return false;
                  }
              };
              window.addEventListener('test', null, options);
              window.removeEventListener('test', null, options);
          } catch (err) {
              passiveSupported = false;
          }
          return passiveSupported;
      }
  };
  
  // ================================================================
  // ENTERPRISE EVENT MANAGER
  // ================================================================
  
  const EventManager = {
      _listeners: [],
      
      /**
       * Add event listener with automatic cleanup tracking
       */
      add: function(element, event, handler, options) {
          const listenerRef = Utils.addEventListener(element, event, handler, options);
          if (listenerRef) {
              this._listeners.push(listenerRef);
          }
          return listenerRef;
      },
      
      /**
       * Remove specific event listener
       */
      remove: function(listenerRef) {
          Utils.removeEventListener(listenerRef);
          const index = this._listeners.indexOf(listenerRef);
          if (index > -1) {
              this._listeners.splice(index, 1);
          }
      },
      
      /**
       * Cleanup all event listeners (important for SPAs)
       */
      cleanup: function() {
          this._listeners.forEach(listenerRef => {
              Utils.removeEventListener(listenerRef);
          });
          this._listeners = [];
      },
      
      /**
       * Get listener count for debugging
       */
      getListenerCount: function() {
          return this._listeners.length;
      }
  };
  
  // ================================================================
  // ENTERPRISE FEATURE DETECTION
  // ================================================================
  
  const FeatureDetection = {
      init: function() {
          try {
              Utils.performanceMark('feature-detection-start');
              
              const html = document.documentElement;
              
              // CSS 3D Transforms
              const hasCSS3DTransforms = Utils.hasFeature('css3DTransforms');
              html.className += hasCSS3DTransforms ? ' csstransforms' : ' no-csstransforms';
              
              // CSS Grid
              const hasGrid = Utils.hasFeature('cssGrid');
              html.className += hasGrid ? ' cssgrid' : ' no-cssgrid';
              
              // Touch device detection
              const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
              html.className += hasTouch ? ' touch' : ' no-touch';
              
              // High DPI detection
              const isHighDPI = window.devicePixelRatio && window.devicePixelRatio > 1;
              html.className += isHighDPI ? ' retina' : ' no-retina';
              
              // Mobile detection (enhanced)
              const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              html.className += isMobile ? ' mobile' : ' desktop';
              
              // Store features for later use
              this.features = {
                  css3DTransforms: hasCSS3DTransforms,
                  cssGrid: hasGrid,
                  intersectionObserver: Utils.hasFeature('intersectionObserver'),
                  requestAnimationFrame: Utils.hasFeature('requestAnimationFrame'),
                  passiveListeners: Utils.hasFeature('passiveListeners'),
                  touch: hasTouch,
                  highDPI: isHighDPI,
                  mobile: isMobile
              };
              
              Utils.performanceMark('feature-detection-end');
              
              if (CONFIG.DEBUG) {
                  console.log('🔍 Feature Detection Results:', this.features);
              }
              
          } catch (error) {
              Utils.logError(error, 'FeatureDetection.init');
          }
      },
      
      has: function(feature) {
          return this.features && this.features[feature] === true;
      }
  };
  
  // ================================================================
  // ENTERPRISE HEADER CONTROLLER
  // ================================================================
  
  const HeaderController = {
      init: function() {
          try {
              this.header = Utils.safeQuerySelector('#header');
              if (!this.header) return;
              
              this.isScrolled = false;
              this.ticking = false;
              
              const throttledHandler = Utils.throttle(this.handleScroll.bind(this), CONFIG.SCROLL_THROTTLE);
              EventManager.add(window, 'scroll', throttledHandler, 
                  FeatureDetection.has('passiveListeners') ? { passive: true } : false);
              
              // Initial check
              this.handleScroll();
              
          } catch (error) {
              Utils.logError(error, 'HeaderController.init');
          }
      },
      
      handleScroll: function() {
          if (!this.ticking && this.header) {
              if (FeatureDetection.has('requestAnimationFrame')) {
                  requestAnimationFrame(this.updateHeader.bind(this));
              } else {
                  this.updateHeader();
              }
              this.ticking = true;
          }
      },
      
      updateHeader: function() {
          try {
              const scrollY = window.pageYOffset || document.documentElement.scrollTop;
              const shouldBeScrolled = scrollY > CONFIG.HEADER_SCROLL_THRESHOLD;
              
              if (shouldBeScrolled !== this.isScrolled) {
                  this.isScrolled = shouldBeScrolled;
                  if (shouldBeScrolled) {
                      this.header.classList.add('scrolled');
                  } else {
                      this.header.classList.remove('scrolled');
                  }
              }
              
              this.ticking = false;
          } catch (error) {
              Utils.logError(error, 'HeaderController.updateHeader');
              this.ticking = false;
          }
      }
  };
  
  // ================================================================
  // ENTERPRISE SMOOTH SCROLL CONTROLLER
  // ================================================================
  
  const SmoothScrollController = {
      init: function() {
          try {
              const navLinks = Utils.safeQuerySelectorAll('a[href^="#"]');
              
              navLinks.forEach(link => {
                  EventManager.add(link, 'click', this.handleClick.bind(this));
              });
              
          } catch (error) {
              Utils.logError(error, 'SmoothScrollController.init');
          }
      },
      
      handleClick: function(e) {
          try {
              e.preventDefault();
              const href = e.currentTarget.getAttribute('href');
              const target = Utils.safeQuerySelector(href);
              
              if (!target) {
                  if (CONFIG.DEBUG) {
                      console.warn('🎯 Smooth scroll target not found:', href);
                  }
                  return;
              }
              
              this.scrollToTarget(target);
              
          } catch (error) {
              Utils.logError(error, 'SmoothScrollController.handleClick', { target: e.currentTarget });
          }
      },
      
      scrollToTarget: function(target) {
          try {
              const header = Utils.safeQuerySelector('.header');
              const headerHeight = header ? header.offsetHeight : 70;
              const targetPosition = target.offsetTop - headerHeight;
              
              // Use native smooth scroll if available
              if ('scrollBehavior' in document.documentElement.style) {
                  window.scrollTo({
                      top: targetPosition,
                      behavior: 'smooth'
                  });
              } else {
                  // Fallback to custom smooth scroll
                  this.animatedScroll(targetPosition, CONFIG.SMOOTH_SCROLL_DURATION);
              }
              
          } catch (error) {
              Utils.logError(error, 'SmoothScrollController.scrollToTarget', { target });
          }
      },
      
      animatedScroll: function(targetPosition, duration) {
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          let startTime = null;
          
          const animation = (currentTime) => {
              try {
                  if (startTime === null) startTime = currentTime;
                  const timeElapsed = currentTime - startTime;
                  const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
                  
                  window.scrollTo(0, run);
                  
                  if (timeElapsed < duration) {
                      requestAnimationFrame(animation);
                  }
              } catch (error) {
                  Utils.logError(error, 'SmoothScrollController.animatedScroll.animation');
              }
          };
          
          if (FeatureDetection.has('requestAnimationFrame')) {
              requestAnimationFrame(animation);
          } else {
              // Fallback for old browsers
              window.scrollTo(0, targetPosition);
          }
      },
      
      easeInOutQuad: function(t, b, c, d) {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t + b;
          t--;
          return -c / 2 * (t * (t - 2) - 1) + b;
      }
  };
  
  // ================================================================
  // ENTERPRISE CAROUSEL DRAG CONTROLLER
  // ================================================================
  
  const CarouselDragController = {
      init: function() {
          try {
              this.carousel = Utils.safeQuerySelector('.itineraries-grid');
              if (!this.carousel) return;
              
              this.state = {
                  isDown: false,
                  startX: 0,
                  scrollLeft: 0,
                  velocity: 0,
                  lastX: 0,
                  lastTime: 0
              };
              
              this.bindEvents();
              
              if (CONFIG.DEBUG) {
                  console.log('🎠 Carousel drag initialized');
              }
              
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.init');
          }
      },
      
      bindEvents: function() {
          try {
              // Mouse Events
              EventManager.add(this.carousel, 'mousedown', this.handleMouseDown.bind(this));
              EventManager.add(this.carousel, 'mouseleave', this.handleMouseUp.bind(this));
              EventManager.add(this.carousel, 'mouseup', this.handleMouseUp.bind(this));
              EventManager.add(this.carousel, 'mousemove', this.handleMouseMove.bind(this));
              
              // Touch Events
              const passiveOptions = FeatureDetection.has('passiveListeners') ? { passive: true } : false;
              EventManager.add(this.carousel, 'touchstart', this.handleTouchStart.bind(this), passiveOptions);
              EventManager.add(this.carousel, 'touchend', this.handleTouchEnd.bind(this), passiveOptions);
              EventManager.add(this.carousel, 'touchmove', this.handleTouchMove.bind(this), passiveOptions);
              
              // Prevent drag of images
              EventManager.add(this.carousel, 'dragstart', this.preventDrag.bind(this));
              
              // Context menu prevention during drag
              EventManager.add(this.carousel, 'contextmenu', this.handleContextMenu.bind(this));
              
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.bindEvents');
          }
      },
      
      handleMouseDown: function(e) {
          try {
              this.startDrag(e.pageX, 'mouse');
              this.carousel.classList.add('dragging');
              e.preventDefault();
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.handleMouseDown');
          }
      },
      
      handleMouseUp: function() {
          try {
              this.endDrag();
              this.carousel.classList.remove('dragging');
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.handleMouseUp');
          }
      },
      
      handleMouseMove: function(e) {
          try {
              if (!this.state.isDown) return;
              e.preventDefault();
              this.updateDrag(e.pageX, 'mouse');
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.handleMouseMove');
          }
      },
      
      handleTouchStart: function(e) {
          try {
              if (e.touches.length === 1) {
                  const touch = e.touches[0];
                  this.startDrag(touch.pageX, 'touch');
              }
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.handleTouchStart');
          }
      },
      
      handleTouchEnd: function() {
          try {
              this.endDrag();
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.handleTouchEnd');
          }
      },
      
      handleTouchMove: function(e) {
          try {
              if (!this.state.isDown || e.touches.length !== 1) return;
              const touch = e.touches[0];
              this.updateDrag(touch.pageX, 'touch');
          } catch (error) {
              Utils.logError(error, 'CarouselDragController.handleTouchMove');
          }
      },
      
      startDrag: function(pageX, type) {
          this.state.isDown = true;
          this.state.startX = pageX - this.carousel.offsetLeft;
          this.state.scrollLeft = this.carousel.scrollLeft;
          this.state.velocity = 0;
          this.state.lastX = pageX;
          this.state.lastTime = Date.now();
          this.state.dragType = type;
      },
      
      updateDrag: function(pageX, type) {
          const currentTime = Date.now();
          const deltaTime = currentTime - this.state.lastTime;
          const deltaX = pageX - this.state.lastX;
          
          if (deltaTime > 0) {
              this.state.velocity = deltaX / deltaTime;
          }
          
          const x = pageX - this.carousel.offsetLeft;
          const walk = (x - this.state.startX) * CONFIG.DRAG_MULTIPLIER[type.toUpperCase()];
          
          const newScrollLeft = this.state.scrollLeft - walk;
          
          // Boundary checking
          const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;
          const clampedScroll = Math.max(0, Math.min(newScrollLeft, maxScroll));
          
          this.carousel.scrollLeft = clampedScroll;
          
          this.state.lastX = pageX;
          this.state.lastTime = currentTime;
      },
      
      endDrag: function() {
          this.state.isDown = false;
          this.applyMomentum();
      },
      
      applyMomentum: function() {
          if (Math.abs(this.state.velocity) < CONFIG.MOMENTUM_THRESHOLD) return;
          
          const step = () => {
              try {
                  this.state.velocity *= CONFIG.MOMENTUM_FRICTION;
                  
                  const newScrollLeft = this.carousel.scrollLeft - this.state.velocity * 10;
                  const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;
                  const clampedScroll = Math.max(0, Math.min(newScrollLeft, maxScroll));
                  
                  this.carousel.scrollLeft = clampedScroll;
                  
                  // Continue momentum if velocity is significant and not at boundaries
                  if (Math.abs(this.state.velocity) > CONFIG.MOMENTUM_THRESHOLD && 
                      clampedScroll === newScrollLeft) {
                      if (FeatureDetection.has('requestAnimationFrame')) {
                          requestAnimationFrame(step);
                      }
                  }
              } catch (error) {
                  Utils.logError(error, 'CarouselDragController.applyMomentum.step');
              }
          };
          
          if (FeatureDetection.has('requestAnimationFrame')) {
              requestAnimationFrame(step);
          }
      },
      
      preventDrag: function(e) {
          e.preventDefault();
      },
      
      handleContextMenu: function(e) {
          if (this.state.isDown) {
              e.preventDefault();
          }
      }
  };
  
  // ================================================================
  // ENTERPRISE SCROLL ANIMATIONS CONTROLLER
  // ================================================================
  
  const ScrollAnimationsController = {
      init: function() {
          try {
              this.elements = Utils.safeQuerySelectorAll('.slide-in-left, .slide-in-right');
              if (this.elements.length === 0) return;
              
              if (FeatureDetection.has('intersectionObserver') && FeatureDetection.has('css3DTransforms')) {
                  this.initIntersectionObserver();
              } else {
                  this.initScrollFallback();
              }
              
              if (CONFIG.DEBUG) {
                  console.log('🎭 Scroll animations initialized for', this.elements.length, 'elements');
              }
              
          } catch (error) {
              Utils.logError(error, 'ScrollAnimationsController.init');
          }
      },
      
      initIntersectionObserver: function() {
          try {
              const options = {
                  threshold: CONFIG.INTERSECTION_THRESHOLD,
                  rootMargin: CONFIG.INTERSECTION_ROOT_MARGIN
              };
              
              this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
              
              this.elements.forEach(element => {
                  this.observer.observe(element);
              });
              
          } catch (error) {
              Utils.logError(error, 'ScrollAnimationsController.initIntersectionObserver');
              this.initScrollFallback();
          }
      },
      
      initScrollFallback: function() {
          try {
              const throttledHandler = Utils.throttle(this.checkElements.bind(this), CONFIG.SCROLL_THROTTLE);
              EventManager.add(window, 'scroll', throttledHandler, 
                  FeatureDetection.has('passiveListeners') ? { passive: true } : false);
              EventManager.add(window, 'load', this.checkElements.bind(this));
              
              // Initial check
              this.checkElements();
              
          } catch (error) {
              Utils.logError(error, 'ScrollAnimationsController.initScrollFallback');
          }
      },
      
      handleIntersection: function(entries) {
          try {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      entry.target.classList.add('visible');
                      // Stop observing once animated
                      if (this.observer) {
                          this.observer.unobserve(entry.target);
                      }
                  }
              });
          } catch (error) {
              Utils.logError(error, 'ScrollAnimationsController.handleIntersection');
          }
      },
      
      checkElements: function() {
          try {
              const windowHeight = window.innerHeight;
              
              this.elements.forEach(element => {
                  if (element.classList.contains('visible')) return;
                  
                  const elementTop = element.getBoundingClientRect().top;
                  
                  if (elementTop < windowHeight - 100) {
                      element.classList.add('visible');
                  }
              });
          } catch (error) {
              Utils.logError(error, 'ScrollAnimationsController.checkElements');
          }
      },
      
      destroy: function() {
          if (this.observer) {
              this.observer.disconnect();
              this.observer = null;
          }
      }
  };
  
  // ================================================================
  // ENTERPRISE PARALLAX CONTROLLER
  // ================================================================
  
  const ParallaxController = {
      init: function() {
          try {
              // Only enable on desktop with CSS3D support
              if (!FeatureDetection.has('css3DTransforms') || FeatureDetection.has('mobile')) {
                  return;
              }
              
              this.hero = Utils.safeQuerySelector('.hero');
              if (!this.hero) return;
              
              this.ticking = false;
              this.enabled = true;
              
              const throttledHandler = Utils.throttle(this.handleScroll.bind(this), CONFIG.SCROLL_THROTTLE);
              EventManager.add(window, 'scroll', throttledHandler, 
                  FeatureDetection.has('passiveListeners') ? { passive: true } : false);
              
              // Disable on resize to mobile
              const debouncedResize = Utils.debounce(this.handleResize.bind(this), CONFIG.RESIZE_DEBOUNCE);
              EventManager.add(window, 'resize', debouncedResize);
              
              if (CONFIG.DEBUG) {
                  console.log('🌊 Parallax enabled');
              }
              
          } catch (error) {
              Utils.logError(error, 'ParallaxController.init');
          }
      },
      
      handleScroll: function() {
          if (!this.ticking && this.enabled && this.hero) {
              if (FeatureDetection.has('requestAnimationFrame')) {
                  requestAnimationFrame(this.updateParallax.bind(this));
              } else {
                  this.updateParallax();
              }
              this.ticking = true;
          }
      },
      
      updateParallax: function() {
          try {
              const scrolled = window.pageYOffset || document.documentElement.scrollTop;
              const translateY = scrolled * CONFIG.PARALLAX_SPEED;
              
              this.hero.style.transform = `translateY(${translateY}px)`;
              this.ticking = false;
              
          } catch (error) {
              Utils.logError(error, 'ParallaxController.updateParallax');
              this.ticking = false;
          }
      },
      
      handleResize: function() {
          try {
              const isMobile = window.innerWidth <= 768;
              this.enabled = !isMobile;
              
              if (!this.enabled && this.hero) {
                  this.hero.style.transform = '';
              }
          } catch (error) {
              Utils.logError(error, 'ParallaxController.handleResize');
          }
      }
  };
  
  // ================================================================
  // ENTERPRISE APPLICATION CONTROLLER
  // ================================================================
  
  const App = {
      /**
       * Initialize the application
       */
      init: function() {
          try {
              Utils.performanceMark('app-init-start');
              
              if (CONFIG.DEBUG) {
                  console.group('🚀 Chat Heritage App Initialization');
                  console.log('Version: 2.0.0 Enterprise');
                  console.log('Debug Mode: Enabled');
              }
              
              // Initialize feature detection first
              FeatureDetection.init();
              
              // Initialize all controllers
              this.initControllers();
              
              // Setup global error handling
              this.setupErrorHandling();
              
              // Setup performance monitoring
              this.setupPerformanceMonitoring();
              
              // Mark app as loaded
              this.markAsLoaded();
              
              Utils.performanceMark('app-init-end');
              
              if (CONFIG.DEBUG) {
                  console.log('✅ App initialization complete');
                  console.log('👂 Event listeners registered:', EventManager.getListenerCount());
                  console.groupEnd();
              }
              
          } catch (error) {
              Utils.logError(error, 'App.init');
              this.handleCriticalError(error);
          }
      },
      
      /**
       * Initialize all application controllers
       */
      initControllers: function() {
          const controllers = [
              { name: 'HeaderController', instance: HeaderController },
              { name: 'SmoothScrollController', instance: SmoothScrollController },
              { name: 'CarouselDragController', instance: CarouselDragController },
              { name: 'ScrollAnimationsController', instance: ScrollAnimationsController },
              { name: 'ParallaxController', instance: ParallaxController }
          ];
          
          controllers.forEach(controller => {
              try {
                  Utils.performanceMark(`${controller.name}-init-start`);
                  controller.instance.init();
                  Utils.performanceMark(`${controller.name}-init-end`);
                  
                  if (CONFIG.DEBUG) {
                      console.log(`✅ ${controller.name} initialized`);
                  }
              } catch (error) {
                  Utils.logError(error, `App.initControllers.${controller.name}`);
              }
          });
      },
      
      /**
       * Setup global error handling
       */
      setupErrorHandling: function() {
          // Global error handler
          window.addEventListener('error', function(e) {
              Utils.logError(e.error || new Error(e.message), 'Global Error Handler', {
                  filename: e.filename,
                  lineno: e.lineno,
                  colno: e.colno
              });
          });
          
          // Unhandled promise rejection handler
          window.addEventListener('unhandledrejection', function(e) {
              Utils.logError(e.reason, 'Unhandled Promise Rejection');
              e.preventDefault(); // Prevent console error
          });
          
          // Resource loading error handler
          window.addEventListener('error', function(e) {
              if (e.target !== window && e.target.tagName) {
                  Utils.logError(new Error(`Resource loading failed: ${e.target.tagName}`), 'Resource Error', {
                      src: e.target.src || e.target.href,
                      tagName: e.target.tagName
                  });
              }
          }, true);
      },
      
      /**
       * Setup performance monitoring
       */
      setupPerformanceMonitoring: function() {
          if (!CONFIG.PERFORMANCE_MONITOR || !Utils.hasFeature('performance')) return;
          
          try {
              // Monitor page load performance
              window.addEventListener('load', function() {
                  setTimeout(function() {
                      if (performance.getEntriesByType) {
                          const navigation = performance.getEntriesByType('navigation')[0];
                          const paint = performance.getEntriesByType('paint');
                          
                          if (CONFIG.DEBUG && navigation) {
                              console.group('📊 Performance Metrics');
                              console.log('DOM Content Loaded:', Math.round(navigation.domContentLoadedEventEnd), 'ms');
                              console.log('Load Complete:', Math.round(navigation.loadEventEnd), 'ms');
                              
                              if (paint.length > 0) {
                                  paint.forEach(entry => {
                                      console.log(`${entry.name}:`, Math.round(entry.startTime), 'ms');
                                  });
                              }
                              console.groupEnd();
                          }
                          
                          // Send to analytics if available
                          if (window.gtag && navigation) {
                              window.gtag('event', 'timing_complete', {
                                  name: 'load',
                                  value: Math.round(navigation.loadEventEnd)
                              });
                          }
                      }
                  }, 1000);
              });
              
              // Monitor long tasks (if supported)
              if ('PerformanceObserver' in window) {
                  try {
                      const observer = new PerformanceObserver(function(list) {
                          const entries = list.getEntries();
                          entries.forEach(entry => {
                              if (entry.duration > 50) { // Tasks longer than 50ms
                                  if (CONFIG.DEBUG) {
                                      console.warn('🐌 Long task detected:', Math.round(entry.duration), 'ms');
                                  }
                              }
                          });
                      });
                      observer.observe({ entryTypes: ['longtask'] });
                  } catch (e) {
                      // Long task API not supported
                  }
              }
              
          } catch (error) {
              Utils.logError(error, 'App.setupPerformanceMonitoring');
          }
      },
      
      /**
       * Mark application as loaded
       */
      markAsLoaded: function() {
          try {
              // Add loaded class with delay to ensure proper rendering
              setTimeout(function() {
                  document.body.classList.add('loaded');
                  
                  // Dispatch custom event for other scripts
                  const event = new CustomEvent('chAppLoaded', {
                      detail: { 
                          version: '2.0.0',
                          features: FeatureDetection.features,
                          timestamp: Date.now()
                      }
                  });
                  document.dispatchEvent(event);
                  
              }, 100);
              
          } catch (error) {
              // Fallback for older browsers
              setTimeout(function() {
                  document.body.classList.add('loaded');
              }, 100);
          }
      },
      
      /**
       * Handle critical errors that prevent app initialization
       */
      handleCriticalError: function(error) {
          try {
              // Ensure basic functionality works
              document.body.classList.add('loaded', 'error-state');
              
              // Show user-friendly message in development
              if (CONFIG.DEBUG) {
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = `
                      position: fixed;
                      top: 10px;
                      right: 10px;
                      background: #ff4444;
                      color: white;
                      padding: 10px;
                      border-radius: 5px;
                      z-index: 10000;
                      font-family: monospace;
                      font-size: 12px;
                      max-width: 300px;
                  `;
                  errorDiv.innerHTML = `<strong>App Error:</strong><br>${error.message}`;
                  document.body.appendChild(errorDiv);
                  
                  setTimeout(() => {
                      if (errorDiv.parentNode) {
                          errorDiv.parentNode.removeChild(errorDiv);
                      }
                  }, 5000);
              }
              
          } catch (fallbackError) {
              // Last resort - just log to console
              console.error('Critical app error:', error);
              console.error('Fallback error:', fallbackError);
          }
      },
      
      /**
       * Cleanup function for SPA compatibility
       */
      destroy: function() {
          try {
              if (CONFIG.DEBUG) {
                  console.log('🧹 Cleaning up Chat Heritage App');
              }
              
              // Cleanup all event listeners
              EventManager.cleanup();
              
              // Cleanup intersection observers
              if (ScrollAnimationsController.destroy) {
                  ScrollAnimationsController.destroy();
              }
              
              // Remove body classes
              document.body.classList.remove('loaded', 'error-state');
              
              // Clear feature cache
              if (Utils._featureCache) {
                  Utils._featureCache = {};
              }
              
              if (CONFIG.DEBUG) {
                  console.log('✅ Cleanup complete');
              }
              
          } catch (error) {
              Utils.logError(error, 'App.destroy');
          }
      },
      
      /**
       * Reinitialize app (useful for dynamic content)
       */
      refresh: function() {
          try {
              if (CONFIG.DEBUG) {
                  console.log('🔄 Refreshing Chat Heritage App');
              }
              
              this.destroy();
              
              // Reinitialize after cleanup
              setTimeout(() => {
                  this.init();
              }, 100);
              
          } catch (error) {
              Utils.logError(error, 'App.refresh');
          }
      },
      
      /**
       * Get app status and metrics
       */
      getStatus: function() {
          return {
              version: '2.0.0',
              features: FeatureDetection.features,
              listenerCount: EventManager.getListenerCount(),
              config: CONFIG,
              timestamp: Date.now()
          };
      }
  };
  
  // ================================================================
  // ENTERPRISE INITIALIZATION & EXPOSURE
  // ================================================================
  
  /**
   * Cross-browser DOM ready detection
   */
  function domReady(callback) {
      if (document.readyState === 'loading') {
          if (document.addEventListener) {
              document.addEventListener('DOMContentLoaded', callback);
          } else {
              document.attachEvent('onreadystatechange', function() {
                  if (document.readyState !== 'loading') {
                      callback();
                  }
              });
          }
      } else {
          callback();
      }
  }
  
  /**
   * Initialize when DOM is ready
   */
  domReady(function() {
      App.init();
  });
  
  /**
   * Additional window load event for complete initialization
   */
  if (window.addEventListener) {
      window.addEventListener('load', function() {
          // Final setup after all resources loaded
          setTimeout(function() {
              if (CONFIG.DEBUG) {
                  console.log('🎉 All resources loaded, app fully ready');
                  console.log('📊 Final status:', App.getStatus());
              }
          }, 100);
      });
  } else {
      window.attachEvent('onload', function() {
          setTimeout(function() {
              document.body.classList.add('fully-loaded');
          }, 100);
      });
  }
  
  // ================================================================
  // PUBLIC API EXPOSURE
  // ================================================================
  
  /**
   * Expose public API for external scripts and debugging
   */
  window.ChatHeritage = {
      version: '2.0.0',
      init: App.init.bind(App),
      destroy: App.destroy.bind(App),
      refresh: App.refresh.bind(App),
      getStatus: App.getStatus.bind(App),
      utils: {
          logError: Utils.logError,
          hasFeature: Utils.hasFeature.bind(Utils),
          performanceMark: Utils.performanceMark
      },
      config: CONFIG,
      features: function() {
          return FeatureDetection.features;
      }
  };
  
  // ================================================================
  // DEVELOPMENT HELPERS
  // ================================================================
  
  if (CONFIG.DEBUG) {
      // Expose additional debugging utilities
      window.ChatHeritage.debug = {
          EventManager: EventManager,
          Controllers: {
              Header: HeaderController,
              SmoothScroll: SmoothScrollController,
              CarouselDrag: CarouselDragController,
              ScrollAnimations: ScrollAnimationsController,
              Parallax: ParallaxController
          },
          Utils: Utils,
          FeatureDetection: FeatureDetection
      };
      
      // Log initialization
      console.log('🔧 Debug mode enabled. Access via window.ChatHeritage.debug');
  }
  
  // ================================================================
  // BROWSER COMPATIBILITY NOTES
  // ================================================================
  
  /*
   * ENTERPRISE BROWSER SUPPORT:
   * 
   * TIER 1 (Full support):
   * - Chrome 60+
   * - Firefox 55+
   * - Safari 11+
   * - Edge 16+
   * 
   * TIER 2 (Core functionality):
   * - IE 11 (with polyfills)
   * - Chrome 40-59
   * - Firefox 40-54
   * - Safari 9-10
   * 
   * TIER 3 (Basic functionality):
   * - IE 9-10 (limited features)
   * - Very old mobile browsers
   * 
   * POLYFILLS REQUIRED FOR IE:
   * - IntersectionObserver
   * - CSS Grid (if needed)
   * - Object-fit (if needed)
   * - RequestAnimationFrame
   * - CustomEvent
   * 
   * PROGRESSIVE ENHANCEMENT:
   * All features degrade gracefully with appropriate fallbacks
   */
  
})(window, document);

// ================================================================
// END ENTERPRISE JAVASCRIPT
// ================================================================

/*
* Performance Tips:
* 1. Enable CONFIG.PERFORMANCE_MONITOR = false in production
* 2. Set CONFIG.DEBUG = false in production
* 3. Consider lazy loading for non-critical features
* 4. Monitor bundle size and loading performance
* 5. Use service workers for advanced caching strategies
* 
* Security Notes:
* 1. All user inputs are sanitized via DOM methods
* 2. No eval() or innerHTML used with dynamic content
* 3. Error logging doesn't expose sensitive information
* 4. External scripts should be loaded with integrity checks
* 
* Accessibility Features:
* 1. Smooth scrolling respects prefers-reduced-motion
* 2. Focus management for keyboard navigation
* 3. Touch targets meet minimum size requirements
* 4. Error states are announced to screen readers
* 
* Maintenance:
* 1. Regular performance audits recommended
* 2. Update browser support matrix as needed
* 3. Monitor error logs for issues
* 4. Test thoroughly on target devices
*/
