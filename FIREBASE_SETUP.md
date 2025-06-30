# 🔥 **Configurazione Firebase per Dashboard Documenti**

## 📋 **Setup Iniziale**

### **1️⃣ Crea Progetto Firebase**
1. Vai su https://console.firebase.google.com/
2. Clicca **"Aggiungi progetto"**
3. Nome progetto: `Dashboard-[TuoNome]`
4. **Importante:** Seleziona regione **`europe-west1 (Belgio)`** per Storage gratuito

### **2️⃣ Configura Autenticazione**
1. **Authentication** → **Get started**
2. **Sign-in method** → **Google** → **Abilita**
3. **Authorized domains** → Aggiungi il tuo dominio:
   - `localhost` (già presente)
   - `tuonome.github.io` (se usi GitHub Pages)

### **3️⃣ Configura Firestore Database**
1. **Firestore Database** → **Crea database**
2. **Modalità test** (regole permissive per 30 giorni)
3. **Regioni:** Seleziona `europe-west1`

### **4️⃣ Configura Storage**
1. **Storage** → **Get started**
2. **Modalità test** inizialmente
3. **Location:** `europe-west1` (per quota gratuita)

### **5️⃣ Ottieni Credenziali**
1. **⚙️ Project Settings** → **General**
2. **Your apps** → **Web app** (</>) 
3. **Nome app:** `Dashboard Web`
4. ✅ **Abilita Firebase Hosting** (opzionale)
5. **Copia la configurazione** che appare

## 🔧 **Configurazione Codice**

### **📄 Modifica `js/firebase-config.js`**

Sostituisci i placeholder con i tuoi valori:

```javascript
const firebaseConfig = {
  apiKey: "la-tua-api-key-qui",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto-id",
  storageBucket: "tuo-progetto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 🔒 **Regole di Sicurezza**

### **📋 Firestore Rules** (Database → Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /files/{fileId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### **📋 Storage Rules** (Storage → Rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 **Deploy e Test**

### **🌐 GitHub Pages**
1. Aggiorna `firebase-config.js` con le tue credenziali
2. Commit e push su GitHub
3. Attiva GitHub Pages nelle repository settings
4. Aggiungi il dominio GitHub Pages agli authorized domains

### **✅ Test Funzionalità**
1. **Login Google** ✅
2. **Upload file** ✅  
3. **Sync real-time** ✅
4. **Multi-dispositivo** ✅

## 📊 **Quota Gratuita Firebase**

- **Authentication:** Illimitata
- **Firestore:** 1GB storage, 50k letture/giorno
- **Storage:** 5GB storage, 1GB download/giorno
- **Hosting:** 10GB storage, 360MB/giorno

## 🔧 **Troubleshooting**

### **❌ CORS Error**
- Verifica domini autorizzati in Authentication
- Controlla che Storage sia attivato

### **❌ Permission Denied**
- Verifica regole Firestore/Storage
- Controlla che utente sia autenticato

### **❌ Quota Exceeded**
- Monitora uso in Firebase Console
- Considera upgrade a piano Blaze se necessario

---

**🔥 Dashboard pronta per uso professionale con sicurezza enterprise!** 