import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBAZ9Edi3Rh5qWf-AYesrQS6P2U51tvBs",
    authDomain: "coco-49573.firebaseapp.com",
    projectId: "coco-49573",
    storageBucket: "coco-49573.firebasestorage.app",
    messagingSenderId: "771160329024",
    appId: "1:771160329024:web:9bceae5db86b158ca388a5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Foydalanuvchi holatini tekshirish
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserData(user.uid);
        document.getElementById('display-name').innerText = user.displayName;
        document.getElementById('user-email').innerText = user.email;
    } else {
        // Agar login qilmagan bo'lsa, login sahifasiga qaytarish
        window.location.href = "login.html";
    }
});

// Ma'lumotlarni real vaqtda yuklash
function loadUserData(uid) {
    const userRef = doc(db, "users", uid);
    onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.val();
            document.getElementById('balance').innerText = data.balance;
            document.getElementById('chickens').innerText = data.chickens;
            document.getElementById('eggs').innerText = data.eggs;
        }
    });
}

// Tovuq boqish (Reklama simulyatsiyasi)
document.getElementById('btn-feed').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        // Bu yerda aslida reklama chiqishi kerak. Hozircha shunchaki tuxum qo'shiladi.
        alert("Reklama ko'rildi! Tovuqlar boqildi.");
        await updateDoc(userRef, {
            eggs: increment(5) // Har boqishda 5 ta tuxum qo'shiladi
        });
    }
});

// Tuxumlarni sotish (Balansga o'tkazish)
document.getElementById('btn-collect').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        // Tuxumlarni balansga aylantirish (masalan, 1 ta tuxum = 10 so'm)
        alert("Tuxumlar sotildi!");
        await updateDoc(userRef, {
            balance: increment(50), // 50 so'm qo'shiladi
            eggs: 0 // Tuxumlar nollanadi
        });
    }
});

// Chiqish funksiyasi
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
});
