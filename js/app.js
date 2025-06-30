// Dashboard Documenti - JavaScript
class DocumentDashboard {
    constructor() {
        this.files = JSON.parse(localStorage.getItem('dashboard_files')) || [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.initializeElements();
        this.bindEvents();
        this.renderFiles();
        this.updateFileCounts();
    }

    initializeElements() {
        // Elementi DOM principali
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileGrid = document.getElementById('fileGrid');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        
        // Modal elementi
        this.uploadModal = document.getElementById('uploadModal');
        this.previewModal = document.getElementById('previewModal');
        this.uploadForm = document.getElementById('uploadForm');
        
        // Bottoni
        this.uploadBtn = document.getElementById('uploadBtn');
        this.closeModal = document.getElementById('closeModal');
        this.closePreview = document.getElementById('closePreview');
        this.cancelUpload = document.getElementById('cancelUpload');
        
        // Categorie
        this.categoryItems = document.querySelectorAll('.category-item');
        
        // Contatori file
        this.fileCounts = document.querySelectorAll('.file-count');
    }

    bindEvents() {
        // Upload eventi
        this.uploadBtn.addEventListener('click', () => this.openUploadModal());
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Form eventi
        this.uploadForm.addEventListener('submit', (e) => this.handleUploadSubmit(e));
        this.cancelUpload.addEventListener('click', () => this.closeUploadModal());
        this.closeModal.addEventListener('click', () => this.closeUploadModal());
        this.closePreview.addEventListener('click', () => this.closePreviewModal());
        
        // Ricerca
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        
        // Categorie
        this.categoryItems.forEach(item => {
            item.addEventListener('click', () => this.handleCategoryClick(item));
        });
        
        // Chiusura modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeUploadModal();
                this.closePreviewModal();
            }
        });
        
        // Chiusura modal cliccando fuori
        this.uploadModal.addEventListener('click', (e) => {
            if (e.target === this.uploadModal) this.closeUploadModal();
        });
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) this.closePreviewModal();
        });
    }

    // Gestione Drag & Drop
    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        if (files.length === 1) {
            this.selectedFile = files[0];
            this.openUploadModal();
            this.prefillForm();
        } else if (files.length > 1) {
            // Upload multiplo
            files.forEach(file => {
                this.addFileToSystem(file);
            });
            this.renderFiles();
            this.updateFileCounts();
            this.showMessage('File caricati con successo!', 'success');
        }
    }

    prefillForm() {
        if (this.selectedFile) {
            const fileName = this.selectedFile.name.split('.')[0];
            document.getElementById('fileName').value = fileName;
            
            const category = this.detectFileCategory(this.selectedFile.name);
            document.getElementById('fileCategory').value = category;
        }
    }

    detectFileCategory(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        const categories = {
            'pdf': 'pdf',
            'doc': 'documenti', 'docx': 'documenti', 'txt': 'documenti',
            'xls': 'fogli', 'xlsx': 'fogli', 'csv': 'fogli',
            'ppt': 'presentazioni', 'pptx': 'presentazioni',
            'jpg': 'immagini', 'jpeg': 'immagini', 'png': 'immagini', 'gif': 'immagini', 'bmp': 'immagini'
        };
        
        return categories[extension] || 'altri';
    }

    // Modal Management
    openUploadModal() {
        this.uploadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeUploadModal() {
        this.uploadModal.classList.remove('active');
        document.body.style.overflow = '';
        this.uploadForm.reset();
        this.selectedFile = null;
    }

    openPreviewModal(file) {
        this.previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderPreview(file);
    }

    closePreviewModal() {
        this.previewModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Upload Form Submission
    handleUploadSubmit(e) {
        e.preventDefault();
        
        if (!this.selectedFile) {
            this.showMessage('Nessun file selezionato!', 'error');
            return;
        }
        
        const formData = new FormData(this.uploadForm);
        const fileData = {
            id: Date.now(),
            name: formData.get('fileName') || this.selectedFile.name,
            category: formData.get('fileCategory'),
            description: formData.get('fileDescription'),
            tags: formData.get('fileTags').split(',').map(tag => tag.trim()).filter(tag => tag),
            originalName: this.selectedFile.name,
            size: this.selectedFile.size,
            type: this.selectedFile.type,
            uploadDate: new Date().toISOString(),
            fileData: null
        };
        
        // Leggi il file come base64 per la demo
        const reader = new FileReader();
        reader.onload = (e) => {
            fileData.fileData = e.target.result;
            this.addFileToSystem(fileData);
            this.closeUploadModal();
            this.renderFiles();
            this.updateFileCounts();
            this.showMessage('File caricato con successo!', 'success');
        };
        reader.readAsDataURL(this.selectedFile);
    }

    addFileToSystem(fileData) {
        // Se è un oggetto File diretto, convertilo
        if (fileData instanceof File) {
            const file = fileData;
            fileData = {
                id: Date.now() + Math.random(),
                name: file.name.split('.')[0],
                category: this.detectFileCategory(file.name),
                description: '',
                tags: [],
                originalName: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                fileData: null
            };
        }
        
        this.files.push(fileData);
        this.saveFiles();
    }

    saveFiles() {
        localStorage.setItem('dashboard_files', JSON.stringify(this.files));
    }

    // File Rendering
    renderFiles() {
        const filteredFiles = this.getFilteredFiles();
        
        if (filteredFiles.length === 0) {
            this.fileGrid.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.fileGrid.style.display = 'grid';
            this.emptyState.style.display = 'none';
            
            this.fileGrid.innerHTML = filteredFiles.map(file => this.createFileCard(file)).join('');
            
            // Aggiungi event listeners alle card
            this.fileGrid.querySelectorAll('.file-card').forEach(card => {
                const fileId = parseInt(card.dataset.fileId);
                const file = this.files.find(f => f.id === fileId);
                card.addEventListener('click', () => this.openPreviewModal(file));
            });
        }
    }

    createFileCard(file) {
        const fileIcon = this.getFileIcon(file.originalName);
        const fileSize = this.formatFileSize(file.size);
        const uploadDate = new Date(file.uploadDate).toLocaleDateString('it-IT');
        
        return `
            <div class="file-card fade-in" data-file-id="${file.id}">
                <div class="file-header">
                    <div class="file-icon ${fileIcon.class}">
                        <i class="${fileIcon.icon}"></i>
                    </div>
                    <div class="file-info">
                        <h3>${file.name}</h3>
                        <div class="file-meta">${fileSize} • ${uploadDate}</div>
                    </div>
                </div>
                ${file.description ? `<div class="file-description">${file.description}</div>` : ''}
                ${file.tags.length > 0 ? `
                    <div class="file-tags">
                        ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        const icons = {
            'pdf': { icon: 'fas fa-file-pdf', class: 'pdf' },
            'doc': { icon: 'fas fa-file-word', class: 'word' },
            'docx': { icon: 'fas fa-file-word', class: 'word' },
            'xls': { icon: 'fas fa-file-excel', class: 'excel' },
            'xlsx': { icon: 'fas fa-file-excel', class: 'excel' },
            'ppt': { icon: 'fas fa-file-powerpoint', class: 'powerpoint' },
            'pptx': { icon: 'fas fa-file-powerpoint', class: 'powerpoint' },
            'jpg': { icon: 'fas fa-image', class: 'image' },
            'jpeg': { icon: 'fas fa-image', class: 'image' },
            'png': { icon: 'fas fa-image', class: 'image' },
            'gif': { icon: 'fas fa-image', class: 'image' }
        };
        
        return icons[extension] || { icon: 'fas fa-file', class: 'default' };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Filtering & Search
    getFilteredFiles() {
        let filtered = this.files;
        
        // Filtro per categoria
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(file => file.category === this.currentFilter);
        }
        
        // Filtro per ricerca
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(file => 
                file.name.toLowerCase().includes(term) ||
                file.description.toLowerCase().includes(term) ||
                file.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        // Ordina per data di upload (più recenti prima)
        return filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }

    handleCategoryClick(categoryItem) {
        // Rimuovi active da tutti
        this.categoryItems.forEach(item => item.classList.remove('active'));
        
        // Aggiungi active al selezionato
        categoryItem.classList.add('active');
        
        // Aggiorna filtro
        this.currentFilter = categoryItem.dataset.category;
        
        // Re-renderizza
        this.renderFiles();
    }

    handleSearch(e) {
        this.searchTerm = e.target.value;
        this.renderFiles();
    }

    // File Counts
    updateFileCounts() {
        const counts = {
            all: this.files.length,
            relazioni: this.files.filter(f => f.category === 'relazioni').length,
            documenti: this.files.filter(f => f.category === 'documenti').length,
            presentazioni: this.files.filter(f => f.category === 'presentazioni').length,
            fogli: this.files.filter(f => f.category === 'fogli').length,
            immagini: this.files.filter(f => f.category === 'immagini').length,
            pdf: this.files.filter(f => f.category === 'pdf').length,
            altri: this.files.filter(f => f.category === 'altri').length
        };
        
        this.categoryItems.forEach(item => {
            const category = item.dataset.category;
            const countElement = item.querySelector('.file-count');
            if (countElement && counts[category] !== undefined) {
                countElement.textContent = counts[category];
            }
        });
    }

    // Preview Management
    renderPreview(file) {
        const titleElement = document.getElementById('previewTitle');
        const contentElement = document.getElementById('previewContent');
        const downloadBtn = document.getElementById('downloadBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        
        titleElement.textContent = file.name;
        
        // Setup bottoni
        downloadBtn.onclick = () => this.downloadFile(file);
        deleteBtn.onclick = () => this.deleteFile(file);
        
        // Renderizza contenuto in base al tipo
        if (file.type && file.type.startsWith('image/') && file.fileData) {
            contentElement.innerHTML = `<img src="${file.fileData}" alt="${file.name}" class="preview-image">`;
        } else if (file.type && file.type.startsWith('text/') && file.fileData) {
            const textContent = atob(file.fileData.split(',')[1]);
            contentElement.innerHTML = `<div class="preview-text">${textContent}</div>`;
        } else {
            contentElement.innerHTML = `
                <div class="file-info-preview">
                    <div class="preview-icon">
                        <i class="${this.getFileIcon(file.originalName).icon}" style="font-size: 4rem; color: #667eea;"></i>
                    </div>
                    <h3>${file.name}</h3>
                    <p><strong>File originale:</strong> ${file.originalName}</p>
                    <p><strong>Dimensione:</strong> ${this.formatFileSize(file.size)}</p>
                    <p><strong>Categoria:</strong> ${file.category}</p>
                    <p><strong>Data upload:</strong> ${new Date(file.uploadDate).toLocaleString('it-IT')}</p>
                    ${file.description ? `<p><strong>Descrizione:</strong> ${file.description}</p>` : ''}
                    ${file.tags.length > 0 ? `
                        <div class="preview-tags">
                            <strong>Tag:</strong>
                            <div class="file-tags" style="margin-top: 0.5rem;">
                                ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }

    downloadFile(file) {
        if (file.fileData) {
            const link = document.createElement('a');
            link.href = file.fileData;
            link.download = file.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            this.showMessage('File non disponibile per il download', 'error');
        }
    }

    deleteFile(file) {
        if (confirm(`Sei sicuro di voler eliminare "${file.name}"?`)) {
            this.files = this.files.filter(f => f.id !== file.id);
            this.saveFiles();
            this.renderFiles();
            this.updateFileCounts();
            this.closePreviewModal();
            this.showMessage('File eliminato con successo!', 'success');
        }
    }

    // Utility Methods
    showMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} fade-in`;
        messageDiv.textContent = text;
        
        const headerContent = document.querySelector('.header-content');
        headerContent.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Inizializza la dashboard quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new DocumentDashboard();
    
    // Aggiungi file di esempio se è la prima volta
    if (!localStorage.getItem('dashboard_files')) {
        const exampleFiles = [
            {
                id: 1,
                name: "Relazione Progetto Q1",
                category: "relazioni",
                description: "Relazione trimestrale sui risultati del primo quarter",
                tags: ["q1", "risultati", "importante"],
                originalName: "relazione_q1_2024.pdf",
                size: 2500000,
                type: "application/pdf",
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                fileData: null
            },
            {
                id: 2,
                name: "Presentazione Nuovo Prodotto",
                category: "presentazioni",
                description: "Slide per la presentazione del nuovo prodotto",
                tags: ["prodotto", "marketing", "2024"],
                originalName: "presentazione_prodotto.pptx",
                size: 5200000,
                type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                uploadDate: new Date(Date.now() - 172800000).toISOString(),
                fileData: null
            }
        ];
        
        localStorage.setItem('dashboard_files', JSON.stringify(exampleFiles));
    }
}); 