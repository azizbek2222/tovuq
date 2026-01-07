import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBAZ9Edi3Rh5qWf-AYesrQS6P2U51tvBs",
    authDomain: "coco-49573.firebaseapp.com",
    projectId: "coco-49573",
    databaseURL: "https://coco-49573-default-rtdb.firebaseio.com",
    storageBucket: "coco-49573.firebasestorage.app",
    messagingSenderId: "771160329024",
    appId: "1:771160329024:web:9bceae5db86b158ca388a5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tg = window.Telegram?.WebApp;

export async function getUserData() {
    // Telegram user bo'lmasa, test uchun ID ishlatadi
    const user = tg?.initDataUnsafe?.user || { id: "test_user", first_name: "Admin" };
    const userRef = ref(db, 'users/' + user.id);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
        const newUser = { 
            id: user.id, 
            name: user.first_name, 
            balance: 0, 
            chickens: 0, 
            eggs: 0, 
            role: "user" 
        };
        await set(userRef, newUser);
        return newUser;
    }
    return snapshot.val();
}

// Boshqa fayllar ishlata olishi uchun eksportlar
export { db, ref, onValue, update, get };
