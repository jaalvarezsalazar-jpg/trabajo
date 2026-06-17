document.addEventListener('DOMContentLoaded', () => {
    const waitForAdoptions = (cb) => {
        if (window.AdoptionApp && Array.isArray(window.AdoptionApp.animals)) return cb();
        const check = setInterval(() => {
            if (window.AdoptionApp && Array.isArray(window.AdoptionApp.animals)) {
                clearInterval(check);
                cb();
            }
        }, 100);
        // stop waiting after 3s
        setTimeout(() => clearInterval(check), 3000);
    };

    waitForAdoptions(() => {
        const animals = window.AdoptionApp.animals || [];
        const featured = animals.slice(0, 3);
        const grid = document.getElementById('featuredGrid');
        const modal = document.getElementById('featuredModal');
        const modalBody = document.getElementById('featuredModalBody');
        const closeBtn = document.getElementById('featuredClose');

        if (!grid) return;

        grid.innerHTML = featured.map(a => `
            <div class="card card-animal">
                <img src="${a.image}" alt="${a.name}" loading="lazy" class="animal-image">
                <div class="animal-info">
                    <h3>${a.name}</h3>
                    <p class="tag">${a.type === 'perros' ? 'Perro' : 'Gato'} • ${a.age} • ${a.size}</p>
                    <p>${a.description}</p>
                    <button class="btn btn-small" data-animal-id="${a.id}">Conocer historia</button>
                </div>
            </div>
        `).join('');

        grid.querySelectorAll('[data-animal-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-animal-id'));
                const animal = animals.find(x => x.id === id);
                if (!animal) return;
                modalBody.innerHTML = `
                        <div class="featured-modal-inner">
                        <img src="${animal.image}" alt="${animal.name}" style="width:100%; border-radius:8px; max-height:420px; object-fit:cover; margin-bottom:18px;">
                        <h2>${animal.name}</h2>
                        <p class="tag">${animal.type === 'perros' ? '🐕 Perro' : '🐈 Gato'} • ${animal.age} • ${animal.size} • ${animal.gender}</p>
                        <p><strong>Fundación:</strong> ${animal.foundation}</p>
                        <p style="margin-top:14px; line-height:1.7;">${animal.fullStory}</p>
                        <div style="margin-top:18px; display:flex; gap:12px;">
                            <a href="adoptar.html?animalId=${animal.id}&name=${encodeURIComponent(animal.name)}" class="btn btn-primary">Quiero adoptar</a>
                            <button class="btn btn-outline" id="closeFromBtn">Cerrar</button>
                        </div>
                    </div>
                `;
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';

                const closeFromBtn = document.getElementById('closeFromBtn');
                if (closeFromBtn) closeFromBtn.addEventListener('click', closeModal);
            });
        });

        function closeModal() {
            if (!modal) return;
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    });
});
