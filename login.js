import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('btn-google-login');

loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            
            // Foydalanuvchi bazada bormi yoki yo'qligini tekshirish
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Yangi foydalanuvchi bo'lsa, 0 balans va 1ta sovg'a tovuq bilan yaratish
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    balance: 0,
                    chickens: 1,
                    eggs: 0,
                    joinedAt: new Date()
                });
            }

            // Home sahifasiga o'tkazish
            window.location.href = "home.html";
        })
        .catch((error) => {
            console.error("Xatolik:", error);
            document.getElementById('status-msg').innerText = "Kirishda xatolik yuz berdi.";
        });
});
