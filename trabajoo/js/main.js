/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ConectaHuellas - JavaScript Principal
 * Vanilla JS - Sin dependencias externas
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES GLOBALES
// ─────────────────────────────────────────────────────────────────────────────

const App = {
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    /**
     * Log con estilo para development
     */
    log: function(message, type = 'info') {
        if (type === 'error') console.error(`[ConectaHuellas] ${message}`);
        else if (type === 'warn') console.warn(`[ConectaHuellas] ${message}`);
        else console.log(`[ConectaHuellas] ${message}`);
    },
    
    /**
     * Animar números de forma ligera
     */
    animateNumber: function(element, target, duration = 2000) {
        if (!element) return;
        
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const startTime = Date.now();
        const formattedTarget = element.getAttribute('data-amount') 
            ? this.formatCurrency(target)
            : target.toLocaleString('es-CL');
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(startValue + (target - startValue) * progress);
            
            if (element.getAttribute('data-amount')) {
                element.textContent = this.formatCurrency(current);
            } else {
                element.textContent = current.toLocaleString('es-CL');
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = formattedTarget;
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Formatear moneda
     */
    formatCurrency: function(value) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    },
    
    /**
     * Mostrar notificación
     */
    notify: function(message, type = 'success', duration = 3000) {
        const notificationId = 'notification-' + Date.now();
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
                <button class="notification-close" aria-label="Cerrar notificación">
                    <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },
    
    /**
     * Validar formulario
     */
    validateForm: function(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    },
    
    /**
     * Debounce para optimizar
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    
    /**
     * Lazy load de imágenes
     */
    initLazyLoad: function() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
        }
    },
    
    /**
     * Smooth scroll polyfill para navegadores antiguos
     */
    smoothScroll: function(target) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    initTheme: function() {
        const storedTheme = localStorage.getItem('theme');
        // Default to light mode unless user has explicitly chosen a theme
        const theme = storedTheme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.toggle('dark-theme', theme === 'dark');
        // Update sun/moon buttons if present
        const sun = document.getElementById('themeSun');
        const moon = document.getElementById('themeMoon');
        if (sun) sun.classList.toggle('active', theme === 'light');
        if (moon) moon.classList.toggle('active', theme === 'dark');
    },
    setTheme: function(nextTheme) {
        if (!nextTheme || (nextTheme !== 'dark' && nextTheme !== 'light')) return;
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.body.classList.toggle('dark-theme', nextTheme === 'dark');
        localStorage.setItem('theme', nextTheme);
        const sun = document.getElementById('themeSun');
        const moon = document.getElementById('themeMoon');
        if (sun) sun.classList.toggle('active', nextTheme === 'light');
        if (moon) moon.classList.toggle('active', nextTheme === 'dark');
    },

    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
    }

// ─────────────────────────────────────────────────────────────────────────────
// ANIMACIÓN DE NÚMEROS EN PÁGINAS
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Animar números de estadísticas cuando se ven
    const observerOptions = { threshold: 0.5 };
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const target = parseInt(entry.target.getAttribute('data-number') || 
                                       entry.target.textContent.replace(/[^0-9]/g, '')) || 0;
                App.animateNumber(entry.target, target);
                numberObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-number], .impact-number').forEach(el => {
        numberObserver.observe(el);
    });
    
    // Lazy load de imágenes
    App.initLazyLoad();
    App.initTheme();
    
    // Analytics simplificado
    console.log('%c🐾 ConectaHuellas', 'font-size: 16px; font-weight: bold; color: #1A8BB4;');
    console.log('%cPlataforma web para protección animal. Développée avec HTML5, CSS3 et JavaScript vanilla.', 'color: #3DBBB0;');

    // Theme toggle attached earlier to avoid double-binding
});

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO GENERAL
// ─────────────────────────────────────────────────────────────────────────────

const FormHandler = {
    /**
     * Inicializar event listeners para formularios
     */
    init: function() {
        document.querySelectorAll('form').forEach(form => {
            if (form.id !== 'reportForm' && form.id !== 'contactForm') {
                form.addEventListener('submit', this.handleSubmit.bind(this));
            }
        });
    },
    
    /**
     * Manejar envío de formulario
     */
    handleSubmit: function(e) {
        e.preventDefault();
        
        if (!App.validateForm(e.target)) {
            App.notify('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        // Simular envío (en producción sería a backend)
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            App.notify('¡Gracias! Tu mensaje ha sido enviado.', 'success');
            e.target.reset();
        }, 1500);
    }
};

// Ensure theme is applied immediately (so it persists across navigations)
try { App.initTheme(); } catch (e) { /* fail silently if App not ready */ }

// Attach theme toggle handler immediately so pages that load scripts late still bind
const attachThemeToggle = () => {
    const attach = () => {
        const sun = document.getElementById('themeSun');
        const moon = document.getElementById('themeMoon');
        if (sun) {
            sun.removeEventListener('click', () => App.setTheme('light'));
            sun.addEventListener('click', () => App.setTheme('light'));
        }
        if (moon) {
            moon.removeEventListener('click', () => App.setTheme('dark'));
            moon.addEventListener('click', () => App.setTheme('dark'));
        }
    };

    // Try attach now, and again on DOMContentLoaded as a fallback
    try { attach(); } catch (e) { /* ignore */ }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attach);
    }
};
attachThemeToggle();

// Inicializar cuando esté listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FormHandler.init());
} else {
    FormHandler.init();
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILO DE NOTIFICACIONES
// ─────────────────────────────────────────────────────────────────────────────

const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        padding: 16px 24px;
        max-width: 400px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 2000;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    }
    
    .notification-success {
        border-left: 4px solid #3DBBB0;
        color: #2c7a76;
    }
    
    .notification-error {
        border-left: 4px solid #E64A51;
        color: #8b3835;
    }
    
    .notification-warning {
        border-left: 4px solid #E5B34B;
        color: #7a6a2e;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        opacity: 0.6;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .notification-close svg {
        width: 16px;
        height: 16px;
        stroke-width: 2;
    }
    
    input.error,
    textarea.error {
        border-color: #E64A51 !important;
        background-color: rgba(230, 74, 81, 0.05);
    }
`;
document.head.appendChild(style);

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL INDICATORS
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
    // Agregar shadow al header cuando hay scroll
    const header = document.querySelector('.header');
    if (header && window.scrollY > 0) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else if (header) {
        header.style.boxShadow = 'none';
    }
}, { passive: true });

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR PARA USO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.ConectaHuellas = { App, FormHandler };
