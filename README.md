# 📁 Dashboard Documenti

Una **dashboard moderna e intuitiva** per gestire e organizzare tutti i tuoi documenti, relazioni di lavoro e file personali.

![Dashboard Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Dashboard+Documenti)

## ✨ Caratteristiche Principali

### 🎯 **Upload Semplificato**
- **Drag & Drop**: Trascina i file direttamente nella zona di upload
- **Upload Multiplo**: Carica più file contemporaneamente
- **Auto-categorizzazione**: Riconoscimento automatico del tipo di file

### 📂 **Organizzazione Intelligente**
- **Categorie Predefinite**: Relazioni, Documenti, Presentazioni, Fogli di Calcolo, PDF, Immagini
- **Sistema di Tag**: Aggiungi tag personalizzati per una ricerca più efficace
- **Descrizioni**: Aggiungi note e descrizioni ai tuoi file

### 🔍 **Ricerca Avanzata**
- **Ricerca Istantanea**: Trova documenti per nome, descrizione o tag
- **Filtri per Categoria**: Visualizza solo i file della categoria desiderata
- **Ordinamento Automatico**: I file più recenti sono sempre in cima

### 🖼️ **Anteprima Integrata**
- **Preview Immagini**: Visualizza le immagini direttamente nella dashboard
- **Informazioni Dettagliate**: Visualizza metadati, dimensioni e date
- **Download Diretto**: Scarica i file con un click

### 📱 **Design Responsivo**
- **Mobile-First**: Perfettamente ottimizzata per tutti i dispositivi
- **Interfaccia Moderna**: Design glassmorphic con animazioni fluide
- **UX Intuitiva**: Esperienza utente studiata nei minimi dettagli

## 🚀 Come Iniziare

### 1. **Apri la Dashboard**
Semplicemente apri il file `index.html` nel tuo browser preferito.

### 2. **Carica i Tuoi Primi Documenti**
- Clicca su **"Carica File"** nell'header
- Oppure trascina i file nella zona di upload
- Compila le informazioni del file (nome, categoria, descrizione, tag)

### 3. **Organizza e Gestisci**
- Usa le categorie nella sidebar per filtrare i file
- Utilizza la barra di ricerca per trovare rapidamente i documenti
- Clicca su un file per visualizzarne l'anteprima

## 📁 Struttura del Progetto

```
Dashboard/
├── index.html          # Pagina principale
├── css/
│   └── styles.css      # Stili della dashboard
├── js/
│   └── app.js          # Logica JavaScript
└── README.md           # Questo file
```

## 🎨 Tecnologie Utilizzate

- **HTML5**: Struttura semantica moderna
- **CSS3**: Design responsivo con Flexbox/Grid
- **JavaScript ES6+**: Logica applicativa moderna
- **localStorage**: Persistenza dati locale
- **Font Awesome**: Icone professionali
- **Google Fonts**: Tipografia elegante (Inter)

## 📋 Funzionalità Dettagliate

### **Upload e Gestione File**
- Supporto per tutti i formati di file
- Salvataggio automatico nel browser
- Gestione metadati completa
- Sistema di backup automatico

### **Categorizzazione Automatica**
La dashboard riconosce automaticamente i tipi di file:
- **📄 PDF**: File .pdf
- **📝 Documenti**: .doc, .docx, .txt
- **📊 Fogli di Calcolo**: .xls, .xlsx, .csv
- **📈 Presentazioni**: .ppt, .pptx
- **🖼️ Immagini**: .jpg, .jpeg, .png, .gif, .bmp
- **📁 Altri**: Tutti gli altri formati

### **Sistema di Ricerca**
La ricerca funziona su:
- Nome del file
- Descrizione
- Tag associati
- Contenuto testuale (per file di testo)

## 🔧 Personalizzazione

### **Aggiungere Nuove Categorie**
Modifica il file `index.html` nella sezione categorie e aggiorna il JavaScript di conseguenza.

### **Modificare i Colori**
I colori principali sono definiti nelle variabili CSS. Modifica il file `css/styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
}
```

### **Estendere le Funzionalità**
Il codice è modulare e facilmente estendibile. Aggiungi nuovi metodi alla classe `DocumentDashboard`.

## 📊 Statistiche e Contatori

La dashboard mostra automaticamente:
- Numero totale di file
- Conteggio per ogni categoria
- Spazio utilizzato (simulato)
- Data ultimo upload

## 🛡️ Privacy e Sicurezza

- **Tutti i dati sono salvati localmente** nel tuo browser
- **Nessuna comunicazione con server esterni** (eccetto CDN per font e icone)
- **Controllo completo sui tuoi file**
- **Possibilità di export/import** dei dati

## 🔮 Funzionalità Future

- [ ] Integrazione con servizi cloud (Google Drive, Dropbox)
- [ ] Condivisione file via link
- [ ] Backup automatico su server
- [ ] Collaborazione multi-utente
- [ ] Versioning dei documenti
- [ ] OCR per documenti scansionati

## 📱 Browser Supportati

- ✅ **Chrome** 80+
- ✅ **Firefox** 75+
- ✅ **Safari** 13+
- ✅ **Edge** 80+

## 🤝 Contribuire

Questo progetto è open source! Sentiti libero di:
- Segnalare bug
- Proporre nuove funzionalità
- Migliorare il codice
- Aggiungere documentazione

## 📄 Licenza

Progetto rilasciato sotto licenza MIT. Vedi il file LICENSE per maggiori dettagli.

---

## 🎯 Quick Start

1. **Clone il repository**:
   ```bash
   git clone https://github.com/lorenzodigennaro61094/Dashboard.git
   ```

2. **Apri index.html** nel tuo browser

3. **Inizia a caricare i tuoi documenti!**

---

**Sviluppato con ❤️ per organizzare meglio i tuoi documenti di lavoro**

*Per domande o supporto, contatta: lorenzo.di.gennaro61094@gmail.com* 