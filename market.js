import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

async function loadBalance() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        document.getElementById('balance').innerText = parseFloat(snapshot.val().balance).toFixed(5);
    }
}

document.getElementById('buyBtn').onclick = async () => {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();

    if (data.balance >= 1.0) {
        data.balance -= 1.0;
        data.chickens += 1;
        await update(userRef, data);
        loadBalance();
        tg.showAlert("Tabriklaymiz! 1 ta tovuq sotib olindi.");
    } else {
        tg.showAlert("Mablag' yetarli emas! 1 USDT kerak.");
    }
};

loadBalance();
