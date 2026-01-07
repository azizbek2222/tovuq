import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        
        onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // Balansni TON formatiga o'tkazish
                document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(7);
                document.getElementById('chickens').innerText = data.chickens || 0;
                document.getElementById('eggs').innerText = data.eggs || 0;
                document.getElementById('user-name').innerText = user.displayName || "Fermer";
            }
        });

        document.getElementById('btn-feed').onclick = async () => {
            alert("Tovuqlar boqildi! +3 tuxum.");
            await updateDoc(userRef, { eggs: increment(3) });
        };
    } else {
        window.location.href = "login.html";
    }
});
