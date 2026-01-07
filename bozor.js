import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase konfiguratsiyasi
const firebaseConfig = {
    apiKey: "AIzaSyCBAZ9Edi3Rh5qWf-AYesrQS6P2U51tvBs",
    authDomain: "coco-49573.firebaseapp.com",
    projectId: "coco-49573",
    storageBucket: "coco-49573.firebasestorage.app",
    messagingSenderId: "771160329024",
    appId: "1:771160329024:web:9bceae5db86b158ca388a5"
};

// Firebase-ni ishga tushirish
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userBalance = 0;

// Foydalanuvchi holatini tekshirish
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // Balansni real vaqtda kuzatib borish
        onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                userBalance = docSnap.data().balance;
                document.getElementById('balance').innerText = userBalance;
            }
        });

        // Sotib olish tugmasi mantiqi
        const buyBtn = document.getElementById('btn-buy-chicken');
        if (buyBtn) {
            buyBtn.onclick = async () => {
                const chickenPrice = 500; // Tovuq narxi

                if (userBalance >= chickenPrice) {
                    try {
                        // Balansdan ayirish va tovuq qo'shish
                        await updateDoc(userRef, {
                            balance: increment(-chickenPrice),
                            chickens: increment(1)
                        });
                        alert("Tabriklaymiz! Tovuq sotib olindi.");
                    } catch (error) {
                        console.error("Xatolik:", error);
                        alert("Amalni bajarib bo'lmadi.");
                    }
                } else {
                    alert("Mablag' yetarli emas! Tovuq sotib olish uchun 500 so'm kerak.");
                }
            };
        }
    } else {
        // Tizimga kirmagan bo'lsa login sahifasiga o'tkazish
        window.location.href = "login.html";
    }
});
