// Dashboard Documenti con Integrazione Firebase
import { 
    auth, 
    signInWithGoogle, 
    signOutUser, 
    onAuthChange,
    createUserDocument,
    saveFileToFirestore,
    getFilesFromFirestore,
    deleteFileFromFirestore,
    listenToFiles,
    uploadFileToStorage,
    deleteFileFromStorage,
    generateFilePath
} from './firebase-config.js';

class DocumentDashboard {
    constructor() {
        // Stato autenticazione
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        this.firestoreListener = null;
        
        // Dati locali e cloud
        this.localFiles = JSON.parse(localStorage.getItem('dashboard_files')) || [];
        this.cloudFiles = [];
        this.files = []; // Array unificato
        
        // Filtri e ricerca
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.initializeElements();
        this.setupAuthenticationListener();
        this.bindEvents();
        this.setupNetworkListener();
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
        
        // Sezione utente e sync
        this.userSection = document.getElementById('userSection');
        this.syncIndicator = document.getElementById('syncIndicator');
        this.syncBtn = document.getElementById('syncBtn');
        
        // Modal elementi
        this.uploadModal = document.getElementById('uploadModal');
        this.previewModal = document.getElementById('previewModal');
        this.uploadForm = document.getElementById('uploadForm');
        this.syncToCloudCheckbox = document.getElementById('syncToCloud');
        
        // Bottoni
        this.uploadBtn = document.getElementById('uploadBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importInput = document.getElementById('importInput');
        this.closeModal = document.getElementById('closeModal');
        this.closePreview = document.getElementById('closePreview');
        this.cancelUpload = document.getElementById('cancelUpload');
        
        // Categorie
        this.categoryItems = document.querySelectorAll('.category-item');
    }

    // Setup Autenticazione Firebase
    setupAuthenticationListener() {
        onAuthChange(async (user) => {
            this.currentUser = user;
            this.updateUserUI();
            
            if (user) {
                // Utente loggato
                await createUserDocument(user);
                this.setupCloudSync();
                this.updateSyncStatus('online');
                this.showMessage(`Benvenuto ${user.displayName}!`, 'success');
            } else {
                // Utente non loggato
                this.teardownCloudSync();
                this.updateSyncStatus('offline');
                this.loadLocalFiles();
            }
        });
    }

    // UI Autenticazione
    updateUserUI() {
        if (this.currentUser) {
            this.userSection.innerHTML = `
                <div class="user-info">
                    <img src="${this.currentUser.photoURL}" alt="Avatar" class="user-avatar">
                    <div class="user-details">
                        <span class="user-name">${this.currentUser.displayName}</span>
                        <span class="user-email">${this.currentUser.email}</span>
                    </div>
                    <button class="btn btn-outline" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            `;
            
            // Event listener per logout
            document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        } else {
            this.userSection.innerHTML = `
                <button class="btn btn-google" id="loginBtn">
                    <i class="fab fa-google"></i>
                    Accedi con Google
                </button>
            `;
            
            // Event listener per login
            document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        }
    }

    // Autenticazione
    async handleLogin() {
        try {
            this.showMessage('Accesso in corso...', 'info');
            await signInWithGoogle();
        } catch (error) {
            console.error('Errore login:', error);
            this.showMessage('Errore durante l\'accesso', 'error');
        }
    }

    async handleLogout() {
        try {
            await signOutUser();
            this.showMessage('Logout effettuato', 'info');
        } catch (error) {
            console.error('Errore logout:', error);
            this.showMessage('Errore durante il logout', 'error');
        }
    }

    // Sync Cloud
    setupCloudSync() {
        if (this.currentUser && this.firestoreListener) {
            this.firestoreListener(); // Rimuovi listener precedente
        }
        
        if (this.currentUser) {
            this.firestoreListener = listenToFiles(this.currentUser.uid, (cloudFiles) => {
                this.cloudFiles = cloudFiles;
                this.mergeFiles();
                this.renderFiles();
                this.updateFileCounts();
            });
        }
    }

    teardownCloudSync() {
        if (this.firestoreListener) {
            this.firestoreListener();
            this.firestoreListener = null;
        }
        this.cloudFiles = [];
        this.mergeFiles();
    }

    // Merge file locali e cloud
    mergeFiles() {
        const merged = new Map();
        
        // Aggiungi file locali
        this.localFiles.forEach(file => {
            merged.set(file.id, { ...file, source: 'local' });
        });
        
        // Aggiungi/sovrascrive con file cloud
        this.cloudFiles.forEach(file => {
            merged.set(file.id, { ...file, source: 'cloud' });
        });
        
        this.files = Array.from(merged.values());
    }

    loadLocalFiles() {
        this.files = [...this.localFiles];
        this.renderFiles();
        this.updateFileCounts();
    }

    // Status Sync
    updateSyncStatus(status) {
        const icon = this.syncIndicator.querySelector('i');
        const text = this.syncIndicator.querySelector('span');
        const syncStatus = this.syncBtn.querySelector('.sync-status');
        
        switch(status) {
            case 'online':
                icon.className = 'fas fa-cloud-upload-alt';
                text.textContent = 'Online - Sync attivo';
                syncStatus.textContent = 'Cloud';
                this.syncIndicator.className = 'sync-indicator online';
                this.syncBtn.disabled = false;
                break;
            case 'offline':
                icon.className = 'fas fa-wifi-slash';
                text.textContent = 'Offline - Solo locale';
                syncStatus.textContent = 'Locale';
                this.syncIndicator.className = 'sync-indicator offline';
                this.syncBtn.disabled = true;
                break;
            case 'syncing':
                icon.className = 'fas fa-sync fa-spin';
                text.textContent = 'Sincronizzazione...';
                syncStatus.textContent = 'Sync...';
                this.syncIndicator.className = 'sync-indicator syncing';
                break;
        }
    }

    // Network Listener
    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (this.currentUser) {
                this.updateSyncStatus('online');
                this.showMessage('Connessione ripristinata', 'success');
            }
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus('offline');
            this.showMessage('Connessione persa - Modalità offline', 'warning');
        });
    }

    bindEvents() {
        // Upload eventi
        this.uploadBtn.addEventListener('click', () => this.openUploadModal());
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Backup eventi
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importInput.click());
        this.importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
                e.target.value = '';
            }
        });

        // Sync manuale
        this.syncBtn.addEventListener('click', () => this.manualSync());
        
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

    // Sync Manuale
    async manualSync() {
        if (!this.currentUser || !this.isOnline) {
            this.showMessage('Login richiesto per sincronizzazione', 'error');
            return;
        }

        this.updateSyncStatus('syncing');
        
        try {
            // Carica file dal cloud
            const cloudFiles = await getFilesFromFirestore(this.currentUser.uid);
            this.cloudFiles = cloudFiles;
            this.mergeFiles();
            this.renderFiles();
            this.updateFileCounts();
            
            this.updateSyncStatus('online');
            this.showMessage('Sincronizzazione completata!', 'success');
        } catch (error) {
            console.error('Errore sync:', error);
            this.updateSyncStatus('offline');
            this.showMessage('Errore sincronizzazione', 'error');
        }
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
            files.forEach(file => {
                this.addFileToSystem(file, false); // Non aprire modal per upload multiplo
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
            
            // Abilita sync cloud solo se utente loggato
            this.syncToCloudCheckbox.checked = !!this.currentUser;
            this.syncToCloudCheckbox.disabled = !this.currentUser;
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
    async handleUploadSubmit(e) {
        e.preventDefault();
        
        if (!this.selectedFile) {
            this.showMessage('Nessun file selezionato!', 'error');
            return;
        }
        
        const formData = new FormData(this.uploadForm);
        const syncToCloud = this.syncToCloudCheckbox.checked && this.currentUser;
        
        const fileData = {
            id: Date.now() + Math.random(), // ID temporaneo
            name: formData.get('fileName') || this.selectedFile.name,
            category: formData.get('fileCategory'),
            description: formData.get('fileDescription') || '',
            tags: (formData.get('fileTags') || '').split(',').map(tag => tag.trim()).filter(tag => tag),
            originalName: this.selectedFile.name,
            size: this.selectedFile.size,
            type: this.selectedFile.type,
            uploadDate: new Date().toISOString(),
            fileData: null,
            cloudUrl: null,
            cloudPath: null
        };

        this.closeUploadModal();
        this.updateSyncStatus('syncing');

        try {
            if (syncToCloud) {
                // Upload su Firebase
                const filePath = generateFilePath(this.currentUser.uid, this.selectedFile.name);
                const cloudUrl = await uploadFileToStorage(this.selectedFile, filePath);
                
                fileData.cloudUrl = cloudUrl;
                fileData.cloudPath = filePath;
                
                // Salva metadati su Firestore
                const docId = await saveFileToFirestore(this.currentUser.uid, fileData);
                fileData.id = docId;
                
                this.showMessage('File caricato sul cloud!', 'success');
            } else {
                // Solo locale
                const reader = new FileReader();
                reader.onload = (e) => {
                    fileData.fileData = e.target.result;
                    this.addFileToLocal(fileData);
                    this.mergeFiles();
                    this.renderFiles();
                    this.updateFileCounts();
                    this.showMessage('File salvato localmente!', 'success');
                };
                reader.readAsDataURL(this.selectedFile);
                return; // Evita di eseguire il resto del codice
            }
            
            this.updateSyncStatus('online');
        } catch (error) {
            console.error('Errore upload:', error);
            this.showMessage('Errore durante l\'upload', 'error');
            this.updateSyncStatus(this.currentUser ? 'online' : 'offline');
        }
    }

    addFileToLocal(fileData) {
        this.localFiles.push(fileData);
        this.saveLocalFiles();
    }

    addFileToSystem(fileData) {
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
        
        this.addFileToLocal(fileData);
        this.mergeFiles();
    }

    saveLocalFiles() {
        localStorage.setItem('dashboard_files', JSON.stringify(this.localFiles));
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
            
            this.fileGrid.querySelectorAll('.file-card').forEach(card => {
                const fileId = card.dataset.fileId;
                const file = this.files.find(f => f.id.toString() === fileId);
                card.addEventListener('click', () => this.openPreviewModal(file));
            });
        }
    }

    createFileCard(file) {
        const fileIcon = this.getFileIcon(file.originalName);
        const fileSize = this.formatFileSize(file.size);
        const uploadDate = new Date(file.uploadDate).toLocaleDateString('it-IT');
        const isCloud = file.source === 'cloud' || file.cloudUrl;
        
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
                    <div class="file-badges">
                        ${isCloud ? '<span class="badge cloud"><i class="fas fa-cloud"></i></span>' : '<span class="badge local"><i class="fas fa-hdd"></i></span>'}
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
        
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(file => file.category === this.currentFilter);
        }
        
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(file => 
                file.name.toLowerCase().includes(term) ||
                file.description.toLowerCase().includes(term) ||
                file.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        return filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }

    handleCategoryClick(categoryItem) {
        this.categoryItems.forEach(item => item.classList.remove('active'));
        categoryItem.classList.add('active');
        this.currentFilter = categoryItem.dataset.category;
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
        
        downloadBtn.onclick = () => this.downloadFile(file);
        deleteBtn.onclick = () => this.deleteFile(file);
        
        if (file.type && file.type.startsWith('image/') && (file.fileData || file.cloudUrl)) {
            const imageSrc = file.cloudUrl || file.fileData;
            contentElement.innerHTML = `<img src="${imageSrc}" alt="${file.name}" class="preview-image">`;
        } else if (file.type && file.type.startsWith('text/') && file.fileData) {
            const textContent = atob(file.fileData.split(',')[1]);
            contentElement.innerHTML = `<div class="preview-text">${textContent}</div>`;
        } else {
            const isCloud = file.source === 'cloud' || file.cloudUrl;
            contentElement.innerHTML = `
                <div class="file-info-preview">
                    <div class="preview-icon">
                        <i class="${this.getFileIcon(file.originalName).icon}" style="font-size: 4rem; color: #667eea;"></i>
                    </div>
                    <h3>${file.name}</h3>
                    <p><strong>File originale:</strong> ${file.originalName}</p>
                    <p><strong>Dimensione:</strong> ${this.formatFileSize(file.size)}</p>
                    <p><strong>Categoria:</strong> ${file.category}</p>
                    <p><strong>Storage:</strong> ${isCloud ? '☁️ Cloud' : '💽 Locale'}</p>
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
        if (file.cloudUrl) {
            // Download da cloud
            const link = document.createElement('a');
            link.href = file.cloudUrl;
            link.download = file.originalName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (file.fileData) {
            // Download locale
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

    async deleteFile(file) {
        if (confirm(`Sei sicuro di voler eliminare "${file.name}"?`)) {
            try {
                if (file.source === 'cloud' && this.currentUser) {
                    // Elimina da cloud
                    await deleteFileFromFirestore(this.currentUser.uid, file.id);
                    if (file.cloudPath) {
                        await deleteFileFromStorage(file.cloudPath);
                    }
                } else {
                    // Elimina locale
                    this.localFiles = this.localFiles.filter(f => f.id !== file.id);
                    this.saveLocalFiles();
                    this.mergeFiles();
                    this.renderFiles();
                    this.updateFileCounts();
                }
                
                this.closePreviewModal();
                this.showMessage('File eliminato con successo!', 'success');
            } catch (error) {
                console.error('Errore eliminazione:', error);
                this.showMessage('Errore durante l\'eliminazione', 'error');
            }
        }
    }

    // Export/Import
    exportData() {
        const data = {
            files: this.files,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('Backup esportato con successo!', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.files && Array.isArray(data.files)) {
                    if (confirm(`Trovati ${data.files.length} file nel backup. Vuoi sostituire i dati attuali?`)) {
                        this.localFiles = data.files.filter(f => f.source !== 'cloud');
                        this.saveLocalFiles();
                        this.mergeFiles();
                        this.renderFiles();
                        this.updateFileCounts();
                        this.showMessage(`${data.files.length} file importati con successo!`, 'success');
                    }
                } else {
                    this.showMessage('File di backup non valido!', 'error');
                }
            } catch (error) {
                this.showMessage('Errore durante l\'importazione del backup!', 'error');
            }
        };
        reader.readAsText(file);
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
        }, 4000);
    }
}

// Inizializza la dashboard quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new DocumentDashboard();
    
    // File di esempio solo se prima volta E non loggato
    if (!localStorage.getItem('dashboard_files') && !auth.currentUser) {
        const exampleFiles = [
            {
                id: 1,
                name: "Guida Setup Raspberry Pi",
                category: "documenti",
                description: "Guida completa per configurare il cloud su Raspberry Pi",
                tags: ["raspberry", "cloud", "setup"],
                originalName: "raspberry-pi-cloud-setup.md",
                size: 2500000,
                type: "text/markdown",
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                fileData: null
            }
        ];
        
        localStorage.setItem('dashboard_files', JSON.stringify(exampleFiles));
    }
}); 