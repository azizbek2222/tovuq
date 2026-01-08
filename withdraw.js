import { db, ref, get, update, set } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";
const MIN_WITHDRAW = 0.001;

async function init() {
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    if(snap.exists()) {
        document.getElementById('balance').innerText = parseFloat(snap.val().balance || 0).toFixed(5);
    }
}

document.getElementById('submitWithdraw').onclick = async () => {
    const address = document.getElementById('address').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const statusMsg = document.getElementById('status-msg');

    if (!address || address.length < 10) {
        tg.showAlert("Please enter a valid TON address");
        return;
    }

    if (amount < MIN_WITHDRAW) {
        tg.showAlert(`Minimum withdrawal is ${MIN_WITHDRAW} USDT`);
        return;
    }

    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    const currentBalance = snap.val().balance || 0;

    if (amount > currentBalance) {
        tg.showAlert("Insufficient balance!");
        return;
    }

    // 1. Balansni chegirish
    const newBalance = currentBalance - amount;
    await update(userRef, { balance: newBalance });

    // 2. So'rovni saqlash
    const requestId = Date.now();
    const requestRef = ref(db, 'withdrawals/' + requestId);
    await set(requestRef, {
        userId: userId,
        address: address,
        amount: amount,
        status: 'pending',
        timestamp: requestId
    });

    statusMsg.style.color = "green";
    statusMsg.innerText = "Request sent successfully! Wait for admin approval.";
    document.getElementById('balance').innerText = newBalance.toFixed(5);
};

init();
