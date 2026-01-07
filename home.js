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
        
        // Real-time ma'lumotlarni yangilash
        onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                document.getElementById('balance').innerText = data.balance;
                document.getElementById('chickens').innerText = data.chickens;
                document.getElementById('eggs').innerText = data.eggs;
                document.getElementById('user-name').innerText = user.displayName || "Fermer";
            }
        });

        // Tovuq boqish tugmasi
        document.getElementById('btn-feed').onclick = async () => {
            // SHU YERGA REKLAMA KODINI QO'SHASIZ
            alert("Tovuqlar to'ydirildi! +3 ta tuxum yig'ildi.");
            await updateDoc(userRef, {
                eggs: increment(3)
            });
        };
    } else {
        window.location.href = "login.html";
    }
});
