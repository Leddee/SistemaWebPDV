import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app;
let db;

// Mock variables declared in module scope
const mockData = {
  products: [
    { id: 'p1', name: 'Crepe de Morango com Nutella', category: 'Doce', price: 25.00 },
    { id: 'p2', name: 'Crepe de Frango com Catupiry', category: 'Salgado', price: 22.50 },
    { id: 'p3', name: 'Refrigerante Cola Lata', category: 'Bebida', price: 6.00 }
  ],
  orders: []
};

const listeners = {
  products: new Set(),
  orders: new Set()
};

const triggerListeners = (collName) => {
  listeners[collName].forEach(callback => {
    callback({
      docs: mockData[collName].map(item => ({
        id: item.id,
        data: () => item
      }))
    });
  });
};

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🔥 Firebase initialized");
} else {
  console.warn("⚠️ Firebase not configured. Using Mock DB in memory.");
  db = {
    isMock: true
  };
}

export const subscribeToCollection = (collName, callback, sortField = null) => {
  if (db.isMock) {
    if (listeners[collName]) {
       listeners[collName].add(callback);
       triggerListeners(collName);
       return () => listeners[collName].delete(callback);
    }
    return () => {};
  } else {
    let q = collection(db, collName);
    if (sortField) {
      q = query(q, orderBy(sortField, 'desc'));
    }
    return onSnapshot(q, callback);
  }
};

export const addDocument = async (collName, data) => {
  if (db.isMock) {
    const newItem = { id: Math.random().toString(36).substr(2, 9), ...data, createdAt: new Date() };
    mockData[collName].push(newItem);
    triggerListeners(collName);
    return { id: newItem.id };
  } else {
    data.createdAt = new Date();
    return await addDoc(collection(db, collName), data);
  }
};

export const updateDocument = async (collName, id, data) => {
  if (db.isMock) {
    const index = mockData[collName].findIndex(item => item.id === id);
    if (index > -1) {
      mockData[collName][index] = { ...mockData[collName][index], ...data };
      triggerListeners(collName);
    }
  } else {
    const docRef = doc(db, collName, id);
    await updateDoc(docRef, data);
  }
};

export const deleteDocument = async (collName, id) => {
  if (db.isMock) {
    mockData[collName] = mockData[collName].filter(item => item.id !== id);
    triggerListeners(collName);
  } else {
    const docRef = doc(db, collName, id);
    await deleteDoc(docRef);
  }
};

export { db, isFirebaseConfigured };
