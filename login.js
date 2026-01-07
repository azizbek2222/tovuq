import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('btn-google-login');

if (loginBtn) {
    loginBtn.onclick = () => {
        signInWithPopup(auth, provider).then(async (result) => {
            const user = result.user;
            const userRef = ref(db, 'users/' + user.uid);
            
            const snapshot = await get(userRef);
            if (!snapshot.exists()) {
                await set(userRef, {
                    name: user.displayName,
                    email: user.email.toLowerCase(),
                    balance: 0.0,
                    chickens: 0,
                    eggs: 0
                });
            }
            window.location.href = "home.html";
        }).catch(err => alert("Xatolik: " + err.message));
    };
}
