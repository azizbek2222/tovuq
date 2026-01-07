import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

let userData = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            userData = snapshot.val();
            if (userData) {
                document.getElementById('balance').innerText = parseFloat(userData.balance || 0).toFixed(7);
            }
        });

        const buyBtn = document.getElementById('btn-buy-chicken');
        if (buyBtn) {
            buyBtn.onclick = async () => {
                const price = 0.5; // 0.5 TON
                if (userData && userData.balance >= price) {
                    await update(userRef, {
                        balance: userData.balance - price,
                        chickens: (userData.chickens || 0) + 1
                    });
                    alert("Tabriklaymiz! Tovuq sotib olindi.");
                } else {
                    alert("Balansda mablag' yetarli emas!");
                }
            };
        }
    } else {
        window.location.href = "login.html";
    }
});
