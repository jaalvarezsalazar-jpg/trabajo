/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ConectaHuellas - Denuncias
 * Formulario multi-paso
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ReportApp = {
    currentStep: 1,
    totalSteps: 4,
    formData: {},
    uploadedFiles: [],
    
    /**
     * Inicializar aplicación
     */
    init: function() {
        this.cacheElements();
        this.setupEventListeners();
        this.showStep(1);
    },
    
    /**
     * Cachear elementos del DOM
     */
    cacheElements: function() {
        this.reportForm = document.getElementById('reportForm');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        this.anonymousCheckbox = document.getElementById('anonymous');
        this.contactGroup = document.getElementById('contactGroup');
        this.confirmationSummary = document.getElementById('confirmationSummary');
    },
    
    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        if (!this.reportForm) return;
        
        // Botones de navegación
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
        
        // Checkbox anónimo
        if (this.anonymousCheckbox) {
            this.anonymousCheckbox.addEventListener('change', (e) => {
                this.contactGroup.style.display = e.target.checked ? 'none' : 'block';
            });
        }
        
        // Upload de archivos
        if (this.uploadArea && this.fileInput) {
            this.setupUploadArea();
        }
    },
    
    /**
     * Configurar drag & drop para upload
     */
    setupUploadArea: function() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.style.background = 'rgba(61, 187, 176, 0.1)';
                this.uploadArea.style.borderColor = '#3DBBB0';
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.style.background = '';
                this.uploadArea.style.borderColor = '';
            });
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
        
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    },
    
    preventDefaults: function(e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    /**
     * Manejar files
     */
    handleFiles: function(files) {
        const maxFiles = 5;
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (this.uploadedFiles.length >= maxFiles) {
            App.notify('Máximo 5 imágenes permitidas', 'error');
            return;
        }
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                App.notify(`${file.name} no es una imagen válida`, 'error');
                return;
            }
            
            if (file.size > maxSize) {
                App.notify(`${file.name} es demasiado grande (máx. 10MB)`, 'error');
                return;
            }
            
            if (this.uploadedFiles.length < maxFiles) {
                this.uploadedFiles.push(file);
            }
        });
        
        this.renderFileList();
    },
    
    /**
     * Renderizar lista de archivos
     */
    renderFileList: function() {
        if (this.uploadedFiles.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }
        
        this.fileList.innerHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-item">
                <span>${file.name} (${(file.size / 1024).toFixed(1)}KB)</span>
                <button type="button" class="btn btn-small" data-file-index="${index}" onclick="ReportApp.removeFile(${index})">
                    Eliminar
                </button>
            </div>
        `).join('');
    },
    
    /**
     * Remover archivo
     */
    removeFile: function(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderFileList();
    },
    
    /**
     * Mostrar paso específico
     */
    showStep: function(step) {
        // Ocultar todos los pasos
        this.reportForm.querySelectorAll('[data-step]').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostrar paso actual
        const currentFieldset = this.reportForm.querySelector(`[data-step="${step}"]`);
        if (currentFieldset) {
            currentFieldset.classList.add('active');
        }
        
        // Actualizar indicadores de pasos
        this.updateStepIndicators(step);
        this.updateButtons(step);
    },
    
    /**
     * Actualizar indicadores visuales
     */
    updateStepIndicators: function(step) {
        document.querySelectorAll('.step-item').forEach((el, index) => {
            const stepNum = index + 1;
            el.classList.remove('active', 'completed');
            
            if (stepNum === step) {
                el.classList.add('active');
            } else if (stepNum < step) {
                el.classList.add('completed');
            }
        });
    },
    
    /**
     * Actualizar botones según paso
     */
    updateButtons: function(step) {
        this.prevBtn.style.display = step > 1 ? 'block' : 'none';
        this.nextBtn.style.display = step < this.totalSteps ? 'block' : 'none';
        this.submitBtn.style.display = step === this.totalSteps ? 'block' : 'none';
    },
    
    /**
     * Validar paso actual
     */
    validateStep: function(step) {
        const fieldset = this.reportForm.querySelector(`[data-step="${step}"]`);
        const required = fieldset.querySelectorAll('[required]');
        let isValid = true;
        
        required.forEach(field => {
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
     * Guardar datos del paso actual
     */
    saveStepData: function(step) {
        const fieldset = this.reportForm.querySelector(`[data-step="${step}"]`);
        const fields = fieldset.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (field.type === 'checkbox') {
                this.formData[field.id] = field.checked;
            } else {
                this.formData[field.id] = field.value;
            }
        });
    },
    
    /**
     * Paso siguiente
     */
    nextStep: function() {
        if (!this.validateStep(this.currentStep)) {
            App.notify('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        this.saveStepData(this.currentStep);
        
        if (this.currentStep === this.totalSteps - 1) {
            this.updateConfirmation();
        }
        
        this.currentStep++;
        this.showStep(this.currentStep);
    },
    
    /**
     * Paso anterior
     */
    previousStep: function() {
        this.saveStepData(this.currentStep);
        this.currentStep--;
        this.showStep(this.currentStep);
    },
    
    /**
     * Actualizar confirmación final
     */
    updateConfirmation: function() {
        const summary = `
            <div class="confirmation-item">
                <h4>Tipo de reporte</h4>
                <p>${this.formData.reportType || 'No especificado'}</p>
            </div>
            <div class="confirmation-item">
                <h4>Descripción</h4>
                <p>${this.formData.description || 'Sin descripción'}</p>
            </div>
            <div class="confirmation-item">
                <h4>Ubicación</h4>
                <p>${this.formData.address || 'No especificada'}</p>
            </div>
            <div class="confirmation-item">
                <h4>Fecha y hora</h4>
                <p>${this.formData.date || ''} ${this.formData.time || ''}</p>
            </div>
            <div class="confirmation-item">
                <h4>Imágenes adjuntas</h4>
                <p>${this.uploadedFiles.length} imagen(es)</p>
            </div>
            <div class="confirmation-item">
                <h4>Estado de privacidad</h4>
                <p>${this.formData.anonymous ? '🔒 Denuncia anónima' : '👤 Con contacto'}</p>
            </div>
        `;
        
        this.confirmationSummary.innerHTML = summary;
    },
    
    /**
     * Enviar formulario
     */
    handleSubmit: function(e) {
        e.preventDefault();
        
        if (!document.getElementById('terms').checked) {
            App.notify('Debes aceptar los términos de privacidad', 'error');
            return;
        }
        
        // Guardar últimos datos
        this.saveStepData(this.currentStep);
        
        // Desabilitar botón
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Enviando denuncia...';
        
        // Simular envío
        setTimeout(() => {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Enviar denuncia';

            // Mostrar modal de éxito si existe
            const successModal = document.getElementById('reportSuccessModal');
            if (successModal) {
                successModal.style.display = 'flex';
                successModal.classList.add('active');
                document.body.style.overflow = 'hidden';

                const closeBtn = document.getElementById('closeReportSuccess');
                const okBtn = document.getElementById('reportSuccessOk');
                const closeModal = () => {
                    successModal.style.display = 'none';
                    successModal.classList.remove('active');
                    document.body.style.overflow = '';
                };

                if (closeBtn) closeBtn.addEventListener('click', closeModal);
                if (okBtn) okBtn.addEventListener('click', closeModal);
                successModal.addEventListener('click', (ev) => {
                    if (ev.target === successModal) closeModal();
                });
                document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });
            } else {
                App.notify('¡Gracias! Tu denuncia ha sido registrada. Nos pondremos en contacto pronto.', 'success', 5000);
            }

            // Resetear formulario
            this.reportForm.reset();
            this.uploadedFiles = [];
            this.formData = {};
            this.currentStep = 1;
            this.showStep(1);
            this.renderFileList();
        }, 2000);
    }
};

// CSS para pasos
const stepStyle = document.createElement('style');
stepStyle.textContent = `
    .step-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
    }
    
    .step-item span {
        width: 48px;
        height: 48px;
        background: #F5F7F8;
        border: 2px solid #E0E0E0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #4A4A4A;
        transition: all 0.3s ease;
    }
    
    .step-item p {
        font-size: 12px;
        text-align: center;
        margin: 0;
    }
    
    .step-item.active span {
        background: #1A8BB4;
        color: white;
        border-color: #1A8BB4;
        box-shadow: 0 0 0 4px rgba(26, 139, 180, 0.2);
    }
    
    .step-item.completed span {
        background: #3DBBB0;
        color: white;
        border-color: #3DBBB0;
    }
    
    .step-item.completed::after {
        content: '✓';
        position: absolute;
        top: 8px;
        right: -6px;
        background: #3DBBB0;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    
    [data-step] {
        display: none;
    }
    
    [data-step].active {
        display: block;
    }
    
    .confirmation-item {
        background: #F5F7F8;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        border-left: 4px solid #1A8BB4;
    }
    
    .confirmation-item h4 {
        margin: 0 0 8px 0;
        color: #1A8BB4;
    }
    
    .confirmation-item p {
        margin: 0;
        font-size: 14px;
        color: #666;
    }
    
    .form-buttons {
        display: flex;
        gap: 12px;
        margin-top: 32px;
    }
`;
document.head.appendChild(stepStyle);

// Inicializar cuando esté listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReportApp.init());
} else {
    ReportApp.init();
}

// Exportar globalmente
window.ReportApp = ReportApp;
