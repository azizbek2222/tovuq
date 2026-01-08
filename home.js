import { db, ref, get, set } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

async function initHome() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = parseFloat(data.balance).toFixed(5);
    } else {
        const newData = { balance: 0.00000, chickens: 1 };
        await set(userRef, newData);
    }
}

initHome();
tg.expand();
