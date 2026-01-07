// Firebase modullarini CDN orqali import qilish
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Sizning Firebase konfiguratsiyangiz
const firebaseConfig = {
  apiKey: "AIzaSyCBAZ9Edi3Rh5qWf-AYesrQS6P2U51tvBs",
  authDomain: "coco-49573.firebaseapp.com",
  projectId: "coco-49573",
  storageBucket: "coco-49573.firebasestorage.app",
  messagingSenderId: "771160329024",
  appId: "1:771160329024:web:9bceae5db86b158ca388a5",
  measurementId: "G-HK10LC89N8"
};

// Firebase-ni ishga tushirish
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Tugmani tanlab olish
const loginBtn = document.getElementById('btn-google-login');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        // Google popup oynasini ochish
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                console.log("Muvaffaqiyatli kirdi:", user.displayName);

                // Firestore-da foydalanuvchi ma'lumotlarini tekshirish
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
    await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        balance: 0,
        chickens: 0, // Tekin tovuq berilmaydi
        eggs: 0,
        lastLogin: new Date()
                    });
                    console.log("Yangi foydalanuvchi yaratildi!");
                }

                // Asosiy sahifaga o'tish
                window.location.href = "home.html";
            })
            .catch((error) => {
                console.error("Xatolik yuz berdi:", error.code, error.message);
                
                // Xatolik turiga qarab xabar chiqarish
                if (error.code === 'auth/unauthorized-domain') {
                    alert("Xato: Ushbu domen (github.io) Firebase-da ruxsat etilganlar ro'yxatiga qo'shilmagan!");
                } else {
                    alert("Kirishda xatolik: " + error.message);
                }
            });
    });
}