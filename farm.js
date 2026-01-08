import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

async function initFarm() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = parseFloat(data.balance).toFixed(5);
        document.getElementById('chicken-count').innerText = data.chickens;
    }
}

document.getElementById('collectBtn').onclick = async () => {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();

    // Har bir tovuq 0.00050 USDT daromad beradi
    const income = data.chickens * 0.00050;
    data.balance = parseFloat(data.balance) + income;
    
    await update(userRef, data);
    initFarm();
    tg.showAlert(`Yig'ildi: ${income.toFixed(5)} USDT`);
};

initFarm();
