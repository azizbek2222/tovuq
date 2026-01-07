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
export const db = getDatabase(app);
export { ref, get, set, onValue, update };

export async function getUserData() {
    return new Promise((resolve) => {
        const tg = window.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user || { id: "123456", first_name: "Mehmon" };
        
        const userRef = ref(db, 'users/' + user.id);
        get(userRef).then(async (snapshot) => {
            if (!snapshot.exists()) {
                const newUser = {
                    id: user.id,
                    name: user.first_name,
                    balance: 0.0,
                    chickens: 0,
                    eggs: 0,
                    role: "user"
                };
                await set(userRef, newUser);
                resolve(newUser);
            } else {
                resolve(snapshot.val());
            }
        });
    });
}
