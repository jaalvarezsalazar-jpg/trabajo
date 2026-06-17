/**
 * ConectaHuellas - Módulo de Donaciones
 * Gestiona el flujo completo de selección, confirmación y donación
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE FUNDACIONES
// ─────────────────────────────────────────────────────────────────────────────

const foundations = {
  'manada-sanadora': {
    name: 'Manada Sanadora',
    description: 'Rescatamos, rehabilitamos y damos en adopción responsable a perros de la calle de Talagante.',
    stats: {
      rescued: 156,
      adopted: 98,
      raised: '$1.200.000'
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE ANIMALES (para el mensaje post-donación)
// ─────────────────────────────────────────────────────────────────────────────

const animalMessages = {
  'manada-sanadora': {
    name: 'Toby',
    image: 'img/animales/perro-1.webp',
    emoji: '🐶',
    message: 'Gracias por apoyar a Manada Sanadora. Tu ayuda permitirá financiar alimento, medicamentos y rescates para muchos animales. ¡Eres increíble!'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO DE LA APLICACIÓN
// ─────────────────────────────────────────────────────────────────────────────

let donationState = {
  foundation: null,
  amount: null,
  selectedAmountBtn: null
};

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  console.log('[donaciones] DOMContentLoaded');
  initializeEventListeners();
});

/**
 * Inicializa todos los event listeners
 */
function initializeEventListeners() {
  console.log('[donaciones] initializeEventListeners start');
  // Botones de montos rápidos
  const amountBtns = document.querySelectorAll('.amount-btn');
  amountBtns.forEach(btn => {
    btn.addEventListener('click', handleAmountSelect);
  });

  // Botón de monto personalizado
  const customBtn = document.getElementById('customBtn');
  const customAmount = document.getElementById('customAmount');
  
  if (customBtn) {
    customBtn.addEventListener('click', handleCustomAmount);
  }
  
  if (customAmount) {
    customAmount.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCustomAmount();
      }
    });
  }

  // Botón Realizar donación
  const btnDonate = document.getElementById('btnDonate');
  if (btnDonate) {
    btnDonate.addEventListener('click', handleDonateClick);
  }

  // Cerrar modal de confirmación
  const closeConfirm = document.getElementById('closeConfirm');
  const cancelDonation = document.getElementById('cancelDonation');
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (closeConfirm) closeConfirm.addEventListener('click', closeConfirmModal);
  if (cancelDonation) cancelDonation.addEventListener('click', closeConfirmModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeConfirmModal);

  // Confirmar donación
  const confirmDonation = document.getElementById('confirmDonation');
  if (confirmDonation) {
    confirmDonation.addEventListener('click', handleConfirmDonation);
  }

  console.log('[donaciones] attached modal listeners');

  // Cerrar modal de éxito
  const closeSuccess = document.getElementById('closeSuccess');
  const successOverlay = document.getElementById('successOverlay');
  
  if (closeSuccess) closeSuccess.addEventListener('click', handleCloseSuccess);
  if (successOverlay) successOverlay.addEventListener('click', handleCloseSuccess);

  // Cerrar modal del animal
  const closeAnimal = document.getElementById('closeAnimal');
  const animalOverlay = document.getElementById('animalOverlay');
  
  if (closeAnimal) closeAnimal.addEventListener('click', closeAnimalModal);
  if (animalOverlay) animalOverlay.addEventListener('click', closeAnimalModal);

  // Robust: any .modal-close button should close its parent modal
  const modalCloseBtns = document.querySelectorAll('.modal .modal-close');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // If closing success modal, reset state
        if (modal.id === 'successModal') resetDonationState();
      }
    });
  });

  // Robust: clicking any modal overlay closes its parent modal
  const modalOverlays = document.querySelectorAll('.modal .modal-overlay');
  modalOverlays.forEach(o => {
    o.addEventListener('click', (e) => {
      const modal = o.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (modal.id === 'successModal') resetDonationState();
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MANEJADORES DE EVENTOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maneja la selección de montos rápidos
 */
function handleAmountSelect(e) {
  const btn = e.target;
  const amount = parseInt(btn.getAttribute('data-amount'));

  // Remover selección anterior
  if (donationState.selectedAmountBtn) {
    donationState.selectedAmountBtn.classList.remove('selected');
  }

  // Añadir nueva selección
  btn.classList.add('selected');
  donationState.selectedAmountBtn = btn;
  donationState.amount = amount;

  // Limpiar campo personalizado
  const customAmount = document.getElementById('customAmount');
  if (customAmount) {
    customAmount.value = '';
  }

  // Actualizar UI
  updateDonationUI();
}

/**
 * Maneja la entrada de monto personalizado
 */
function handleCustomAmount() {
  const customAmount = document.getElementById('customAmount');
  const value = customAmount.value.trim();

  if (!value) {
    showError('Por favor ingresa un monto');
    return;
  }

  const amount = parseInt(value);

  // Validación de monto mínimo
  if (amount < 1000) {
    showError('El monto mínimo es $1.000');
    customAmount.focus();
    return;
  }

  // Remover selección de botones rápidos
  if (donationState.selectedAmountBtn) {
    donationState.selectedAmountBtn.classList.remove('selected');
    donationState.selectedAmountBtn = null;
  }

  donationState.amount = amount;
  clearError();
  updateDonationUI();
}

/**
 * Maneja el clic en el botón "Realizar donación"
 */
function handleDonateClick(e) {
  const btn = e.target;
  const foundationId = btn.getAttribute('data-fundacion');

  // Validar que existe monto seleccionado
  if (!donationState.amount) {
    showError('Selecciona un monto para continuar');
    return;
  }

  donationState.foundation = foundationId;
  openConfirmModal();
}

/**
 * Maneja la confirmación de la donación
 */
function handleConfirmDonation() {
  closeConfirmModal();

  // Simular procesamiento de donación y mostrar modal de agradecimiento con imagen
  setTimeout(() => {
    showSuccessModal();
  }, 300);
}

/**
 * Maneja el cierre del modal de éxito
 */
function handleCloseSuccess() {
  closeSuccessModal();
  // Reset estado y UI
  resetDonationState();
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES DE UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza la UI del resumen de donación
 */
function updateDonationUI() {
  const summary = document.getElementById('donationSummary');
  const selectedAmount = document.getElementById('selectedAmount');
  const btnDonate = document.getElementById('btnDonate');

  if (donationState.amount) {
    summary.style.display = 'block';
    selectedAmount.textContent = formatCurrency(donationState.amount);
    btnDonate.disabled = false;
    clearError();
  } else {
    summary.style.display = 'none';
    btnDonate.disabled = true;
  }
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
  const errorContainer = document.getElementById('donationError');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }
}

/**
 * Limpia el mensaje de error
 */
function clearError() {
  const errorContainer = document.getElementById('donationError');
  if (errorContainer) {
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abre el modal de confirmación
 */
function openConfirmModal() {
  const modal = document.getElementById('confirmModal');
  const body = document.getElementById('confirmBody');
  const foundation = foundations[donationState.foundation];

  console.log('[donaciones] openConfirmModal', donationState);

  if (!foundation) return;

  // Construir contenido del modal
  const content = `
    <div class="confirm-details">
      <div class="detail-row">
        <span class="detail-label">Fundación:</span>
        <span class="detail-value">${foundation.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Monto:</span>
        <span class="detail-value">${formatCurrency(donationState.amount)}</span>
      </div>
      <p class="detail-note">Serás redirigido a Mercado Pago para completar el pago.</p>
    </div>
  `;

  body.innerHTML = content;
  modal.style.display = 'flex';
  
  // Prevenir scroll del body
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de confirmación
 */
function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/**
 * Abre el modal de éxito
 */
function showSuccessModal() {
  const modal = document.getElementById('successModal');
  const body = document.getElementById('successBody');
  const foundation = foundations[donationState.foundation];

  const animal = animalMessages[donationState.foundation];

  if (!foundation) return;

  // Construir contenido con imagen del animal (si existe)
  const content = `
    <div class="success-card">
      <div class="success-left">
        <div class="success-icon">✓</div>
        <h4>¡Gracias por tu donación!</h4>
        <p>Hemos registrado tu aporte de <strong>${formatCurrency(donationState.amount)}</strong> a <strong>${foundation.name}</strong>.</p>
      </div>
      <div class="success-right">
        ${animal ? `<img src="${animal.image}" alt="${animal.name}" class="success-animal-photo">` : ''}
      </div>
    </div>
  `;
  body.innerHTML = content;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  console.log('[donaciones] showSuccessModal displayed');
}

/**
 * Cierra el modal de éxito
 */
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/**
 * Muestra el mensaje del animal
 */
function showAnimalMessage() {
  const modal = document.getElementById('animalModal');
  const messageContainer = document.getElementById('animalMessage');
  const animal = animalMessages[donationState.foundation];

  if (!animal) return;

  const content = `
    <div class="animal-card">
      <img src="${animal.image}" alt="${animal.name}" class="animal-photo">
      <div class="animal-content">
        <h4 class="animal-name">Hola, soy ${animal.name} ${animal.emoji}</h4>
        <p class="animal-text">${animal.message}</p>
      </div>
    </div>
  `;

  messageContainer.innerHTML = content;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal del animal
 */
function closeAnimalModal() {
  const modal = document.getElementById('animalModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Resetear el estado
  resetDonationState();
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda CLP
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Resetea el estado de la donación
 */
function resetDonationState() {
  // Remover selección de botones
  if (donationState.selectedAmountBtn) {
    donationState.selectedAmountBtn.classList.remove('selected');
    donationState.selectedAmountBtn = null;
  }

  // Limpiar campos
  const customAmount = document.getElementById('customAmount');
  if (customAmount) {
    customAmount.value = '';
  }

  // Resetear estado
  donationState.foundation = null;
  donationState.amount = null;

  // Actualizar UI
  const summary = document.getElementById('donationSummary');
  const btnDonate = document.getElementById('btnDonate');
  if (summary) summary.style.display = 'none';
  if (btnDonate) btnDonate.disabled = true;

  clearError();
}

/**
 * Función preparada para integración con Mercado Pago
 * Actualmente solo simula el flujo
 */
function startDonation(donationData) {
  console.log('Iniciando donación:', donationData);
  
  /*
  TODO: Integración con Mercado Pago
  const { foundation, amount } = donationData;
  
  // 1. Crear preferencia en backend
  // 2. Redirigir a Mercado Pago
  // 3. Procesar callback
  */
  
  return true;
}
