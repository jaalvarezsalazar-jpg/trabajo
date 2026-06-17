/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ConectaHuellas - Adopciones
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AdoptionApp = {
    animals: [
        {
            id: 1,
            name: 'Gaspar',
            type: 'perros',
            age: 'Cachorro',
            size: 'Mediano',
            gender: 'Macho',
            image: 'img/animales/perrito 1.webp',
            foundation: 'Manada Sanadora',
            description: 'Mestizo de galgo',
            fullStory: 'Rescatados junto a su madre Galga,2 meses de vida,edad ideal paa aprender habitos,desparacitado y con proceso de vacunas'
        },
        {
            id: 2,
            name: 'Luna',
            type: 'gatos',
            age: 'Adulto',
            size: 'Pequeña',
            gender: 'Hembra',
            image: 'img/animales/gato 1.webp',
            foundation: 'Manada Sanadora',
            description: 'Gatita cariñosa e independiente, ideal para apartamentos.',
            fullStory: 'Luna fue abandonada pero recuperó su confianza. Ahora busca un hogar donde la amen.'
        },
        {
            id: 3,
            name: 'Max',
            type: 'perros',
            age: 'Cachorro',
            size: 'Grande',
            gender: 'Macho',
            image: 'img/animales/perrito 2.webp',
            foundation: 'Manada Sanadora',
            description: 'Cachorro energético en busca de hogar lleno de aventuras.',
            fullStory: 'Max es un cachorro lleno de energía que necesita una familia activa para crecer feliz.'
        },
        {
            id: 4,
            name: 'Bella',
            type: 'perros',
            age: 'Adulto',
            size: 'Grande',
            gender: 'Hembra',
            image: 'img/animales/perro a.webp',
            foundation: 'Manada Sanadora',
            description: 'Perrita afectuosa y tranquila, excelente compañera.',
            fullStory: 'Bella es perfecta para personas mayores o parejas que buscan compañía tranquila.'
        },
        {
            id: 5,
            name: 'Gatito',
            type: 'gatos',
            age: 'Cachorro',
            size: 'Pequeña',
            gender: 'Macho',
            image: 'img/animales/gato 2.webp',
            foundation: 'Manada Sanadora',
            description: 'Gatito juguetón y tierno buscando su primer hogar.',
            fullStory: 'Gatito está ansioso por explorar su nuevo hogar. ¡Espera por ti!'
        },
        {
            id: 6,
            name: 'Rocky',
            type: 'perros',
            age: 'Cachorro',
            size: 'Pequeña',
            gender: 'Macho',
            image: 'img/animales/perro c.webp',
            foundation: 'Manada Sanadora',
            description: 'Perro leal y protector, ideal para casas con terreno.',
            fullStory: 'Rocky es un pastor alemán que necesita una familia firme pero amorosa.'
        }
    ],
    
    currentFilter: 'todos',
    filteredAnimals: [],
    
    /**
     * Inicializar aplicación
     */
    init: function() {
        this.cacheElements();
        this.setupEventListeners();
        this.filteredAnimals = this.getFilteredAnimals();
        this.render();
    },
    
    /**
     * Cachear elementos del DOM
     */
    cacheElements: function() {
        this.animalsGrid = document.getElementById('animalsGrid');
        this.searchInput = document.getElementById('searchInput');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.emptyState = document.getElementById('emptyState');
        this.animalModal = document.getElementById('animalModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.modalBody = document.getElementById('modalBody');
    },
    
    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        // Filtros
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.filter();
            });
        });
        
        // Búsqueda (con debounce)
        if (this.searchInput) {
            const debounceFunc = (window.App && App.debounce)
                ? App.debounce(() => this.search(), 300)
                : (function() {
                    let t;
                    return function() {
                        const ctx = this;
                        clearTimeout(t);
                        t = setTimeout(() => ctx.search(), 300);
                    };
                })();
            this.searchInput.addEventListener('input', debounceFunc);
        }
        
        // Modal
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.animalModal) {
            this.animalModal.addEventListener('click', (e) => {
                if (e.target === this.animalModal) this.closeModal();
            });
        }
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },
    
    /**
     * Filtrar animales
     */
    filter: function() {
        this.filteredAnimals = this.getFilteredAnimals();
        this.render();
    },
    
    /**
     * Buscar animales
     */
    search: function() {
        this.filteredAnimals = this.getFilteredAnimals();
        this.render();
    },
    
    /**
     * Obtener animales filtrados por categoría y búsqueda
     */
    getFilteredAnimals: function() {
        const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';

        return this.animals.filter(animal => {
            const matchesFilter =
                this.currentFilter === 'todos' ||
                (this.currentFilter === 'perros' && animal.type === 'perros') ||
                (this.currentFilter === 'gatos' && animal.type === 'gatos') ||
                (this.currentFilter === 'cachorros' && animal.age === 'Cachorro') ||
                (this.currentFilter === 'adultos' && animal.age === 'Adulto');

            const matchesSearch = query === '' ||
                animal.name.toLowerCase().includes(query) ||
                animal.description.toLowerCase().includes(query) ||
                animal.foundation.toLowerCase().includes(query);

            return matchesFilter && matchesSearch;
        });
    },
    
    /**
     * Renderizar grid de animales
     */
    render: function() {
        if (!this.animalsGrid) return;
        
        if (this.filteredAnimals.length === 0) {
            this.animalsGrid.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }
        
        this.emptyState.style.display = 'none';
        
        this.animalsGrid.innerHTML = this.filteredAnimals.map(animal => `
            <div class="card card-animal">
                <img src="${animal.image}" alt="${animal.name}" loading="lazy" class="animal-image">
                <div class="animal-info">
                    <h3>${animal.name}</h3>
                    <p class="tag">${animal.type === 'perros' ? '🐕' : '🐈'} ${animal.type} • ${animal.age} • ${animal.size}</p>
                    <p>${animal.description}</p>
                    <div style="display:flex; gap:8px; margin-top:10px;">
                        <button class="btn btn-small" data-animal-id="${animal.id}">Conocer historia</button>
                        <a href="adoptar.html?animalId=${animal.id}&name=${encodeURIComponent(animal.name)}" class="btn btn-primary btn-small">Quiero adoptar</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Event listeners para botones de detalles
        this.animalsGrid.querySelectorAll('[data-animal-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-animal-id'));
                this.openModal(id);
            });
        });
    },
    
    /**
     * Abrir modal con detalles del animal
     */
    openModal: function(animalId) {
        const animal = this.animals.find(a => a.id === animalId);
        if (!animal) return;
        
        this.modalBody.innerHTML = `
            <div style="max-width: 500px;">
                <img src="${animal.image}" alt="${animal.name}" style="width: 100%; border-radius: 8px; margin-bottom: 20px; object-fit:cover; height:240px;">
                <h2>${animal.name}</h2>
                <p class="tag">${animal.type === 'perros' ? '🐕 Perro' : '🐈 Gato'} • ${animal.age} • ${animal.size} • ${animal.gender}</p>
                <p><strong>Fundación:</strong> ${animal.foundation}</p>
                <p style="margin-top: 20px; line-height: 1.8;">${animal.fullStory}</p>
                <a href="adoptar.html?animalId=${animal.id}&name=${encodeURIComponent(animal.name)}" class="btn btn-primary" style="width: 100%; margin-top: 20px; display:inline-flex; justify-content:center;">Quiero adoptar a ${animal.name}</a>
            </div>
        `;
        
        this.animalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Cerrar modal
     */
    closeModal: function() {
        this.animalModal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Inicializar cuando esté listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdoptionApp.init());
} else {
    AdoptionApp.init();
}

// Exportar globalmente
window.AdoptionApp = AdoptionApp;
