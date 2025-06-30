// Firebase Configuration e Inizializzazione
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// SOSTITUISCI CON LA TUA CONFIGURAZIONE FIREBASE
// Ottieni le credenziali da: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Servizi Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Provider per autenticazione Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Funzioni di autenticazione
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);

// Funzioni Firestore
export const createUserDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;
  
  const userDocRef = doc(db, 'users', userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);
  
  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = userAuth;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Errore creazione utente:', error);
    }
  }
  
  return userDocRef;
};

// Funzioni per i file
export const saveFileToFirestore = async (userId, fileData) => {
  try {
    const fileDocRef = doc(collection(db, 'users', userId, 'files'));
    await setDoc(fileDocRef, {
      ...fileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return fileDocRef.id;
  } catch (error) {
    console.error('Errore salvataggio file:', error);
    throw error;
  }
};

export const getFilesFromFirestore = async (userId) => {
  try {
    const filesCollectionRef = collection(db, 'users', userId, 'files');
    const filesSnapshot = await getDocs(filesCollectionRef);
    return filesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Errore caricamento file:', error);
    throw error;
  }
};

export const deleteFileFromFirestore = async (userId, fileId) => {
  try {
    const fileDocRef = doc(db, 'users', userId, 'files', fileId);
    await deleteDoc(fileDocRef);
  } catch (error) {
    console.error('Errore eliminazione file:', error);
    throw error;
  }
};

// Listener in tempo reale per i file
export const listenToFiles = (userId, callback) => {
  const filesCollectionRef = collection(db, 'users', userId, 'files');
  return onSnapshot(filesCollectionRef, 
    (snapshot) => {
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(files);
    },
    (error) => {
      console.error('Errore listener file:', error);
    }
  );
};

// Funzioni Storage
export const uploadFileToStorage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Errore upload file:', error);
    throw error;
  }
};

export const deleteFileFromStorage = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Errore eliminazione file storage:', error);
    throw error;
  }
};

// Listener per stato autenticazione
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Utility per generare path file
export const generateFilePath = (userId, fileName) => {
  return `users/${userId}/files/${Date.now()}_${fileName}`;
};

console.log('Firebase inizializzato correttamente! 🔥'); 