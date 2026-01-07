import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7VLHdjPqf_tobSiBczGbN8H7YlFwq9Wg",
  authDomain: "magnetic-alloy-467611-u7.firebaseapp.com",
  databaseURL: "https://magnetic-alloy-467611-u7-default-rtdb.firebaseio.com",
  projectId: "magnetic-alloy-467611-u7",
  storageBucket: "magnetic-alloy-467611-u7.firebasestorage.app",
  messagingSenderId: "589500919880",
  appId: "1:589500919880:web:e5dd41c0fba58c3851687d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Telegram foydalanuvchisini olish
const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "local_user_test"; // ID bo'lmasa test ID ishlatiladi

export async function getUserBalance() {
    try {
        const userRef = ref(db, 'users/' + userId);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            let val = snapshot.val().balance;
            let num = parseFloat(val);
            return isNaN(num) ? 0 : num; // Agar bazada raqam bo'lmasa 0 qaytaradi
        } else {
            // Yangi foydalanuvchi yaratish
            await set(userRef, {
                id: userId,
                balance: 0,
                username: tg.initDataUnsafe?.user?.username || "Guest"
            });
            return 0;
        }
    } catch (e) {
        console.error("Firebase o'qishda xato:", e);
        return 0;
    }
}

export async function updateBalanceInDB(newBalance) {
    try {
        const userRef = ref(db, 'users/' + userId);
        // Yangi balansni son ko'rinishida saqlash juda muhim
        await update(userRef, { balance: parseFloat(newBalance) });
    } catch (e) {
        console.error("Firebase yozishda xato:", e);
    }
}
