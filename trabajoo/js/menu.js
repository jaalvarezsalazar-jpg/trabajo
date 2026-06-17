/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ConectaHuellas - Menú Hamburguesa
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MenuHandler = {
    menuToggle: null,
    navMenu: null,
    isOpen: false,
    
    /**
     * Inicializar menú
     */
    init: function() {
        this.menuToggle = document.getElementById('menuToggle');
        this.navMenu = document.getElementById('navMenu');
        
        if (!this.menuToggle || !this.navMenu) return;
        
        // Event listeners
        this.menuToggle.addEventListener('click', this.toggle.bind(this));
        
        // Cerrar menú cuando se hace click en un link
        this.navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', this.close.bind(this));
        });
        
        // Cerrar menú cuando se hace click fuera
        document.addEventListener('click', this.handleClickOutside.bind(this));
        
        // Cerrar menú cuando se redimensiona la ventana (si pasa a desktop)
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    /**
     * Toggle menú
     */
    toggle: function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },
    
    /**
     * Abrir menú
     */
    open: function() {
        this.navMenu.classList.add('active');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Cerrar menú
     */
    close: function() {
        this.navMenu.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        document.body.style.overflow = '';
    },
    
    /**
     * Manejar click fuera del menú
     */
    handleClickOutside: function(e) {
        if (window.innerWidth >= 1024) return;
        
        const isClickOnMenu = this.navMenu.contains(e.target);
        const isClickOnToggle = this.menuToggle.contains(e.target);
        
        if (!isClickOnMenu && !isClickOnToggle && this.isOpen) {
            this.close();
        }
    },
    
    /**
     * Manejar redimensionamiento de ventana
     */
    handleResize: function() {
        if (window.innerWidth >= 1024) {
            this.close();
        }
    }
};

// Inicializar cuando esté listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MenuHandler.init());
} else {
    MenuHandler.init();
}
