import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

async function processFarm() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return;

    let data = snapshot.val();
    const now = Date.now();
    const hundredDaysInMs = 100 * 24 * 60 * 60 * 1000;

    // 1. O'lgan tovuqlarni olib tashlash (100 kundan oshganlar)
    const activeChickens = (data.chickens_list || []).filter(ch => {
        return (now - ch.created) < hundredDaysInMs;
    });

    // Agar o'lgan tovuqlar bo'lsa, bazani yangilaymiz
    if (activeChickens.length !== (data.chickens_list || []).length) {
        data.chickens_list = activeChickens;
        await update(userRef, { chickens_list: activeChickens });
    }

    document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
    document.getElementById('chicken-count').innerText = activeChickens.length;
}

document.getElementById('collectBtn').onclick = async () => {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();
    
    const activeChickensCount = (data.chickens_list || []).length;
    
    if (activeChickensCount === 0) {
        tg.showAlert("Sizda hali tovuqlar yo'q!");
        return;
    }

    // Kunlik 0.00002 USDT daromad
    const income = activeChickensCount * 0.00002;
    data.balance = parseFloat(data.balance || 0) + income;

    await update(userRef, { balance: data.balance });
    processFarm();
    tg.showAlert(`Daromad yig'ildi: ${income.toFixed(5)} USDT`);
};

processFarm();
