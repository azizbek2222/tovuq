import { db, ref, get } from './firebase.js';
const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

async function loadProfile() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = parseFloat(data.balance).toFixed(5);
        document.getElementById('user-id').innerText = userId;
    }
}
loadProfile();
