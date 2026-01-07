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
        
        // Balansni real vaqtda kuzatib borish va TON formatida ko'rsatish
        onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                // Ma'lumotni olish yoki 0 deb hisoblash
                userBalance = docSnap.data().balance || 0;
                
                // Balansni 0.0000000 formatida ekranga chiqarish
                const balanceElement = document.getElementById('balance');
                if (balanceElement) {
                    balanceElement.innerText = parseFloat(userBalance).toFixed(7);
                }
            }
        });

        // Sotib olish tugmasi mantiqi
        const buyBtn = document.getElementById('btn-buy-chicken');
        if (buyBtn) {
            buyBtn.onclick = async () => {
                const chickenPrice = 0.5; // Tovuq narxi: 0.5 TON

                if (userBalance >= chickenPrice) {
                    try {
                        // Balansdan ayirish va tovuq sonini oshirish
                        await updateDoc(userRef, {
                            balance: increment(-chickenPrice),
                            chickens: increment(1)
                        });
                        alert("Muvaffaqiyatli sotib olindi! Tovuqlaringiz soni bittaga ko'paydi.");
                    } catch (error) {
                        console.error("Xatolik:", error);
                        alert("Amalni bajarishda xatolik yuz berdi. Internetni tekshiring.");
                    }
                } else {
                    alert("Mablag' yetarli emas! Tovuq sotib olish uchun kamida 0.5000000 TON kerak.");
                }
            };
        }
    } else {
        // Agar foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga qaytarish
        window.location.href = "login.html";
    }
});
