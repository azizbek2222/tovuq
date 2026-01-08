import { db, ref, get } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

async function loadProfile() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Balansni ko'rsatish
        document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
        
        // Foydalanuvchi ID sini ko'rsatish
        document.getElementById('user-id').innerText = userId;
        
        // Tovuqlar sonini hisoblash (chickens_list massividagi faol tovuqlar)
        const activeChickens = (data.chickens_list || []).length;
        document.getElementById('profile-chickens').innerText = activeChickens;
    }
}

// Withdraw sahifasiga o'tish tugmasi
document.getElementById('withdrawBtn').onclick = () => {
    window.location.href = 'withdraw.html';
};

loadProfile();
tg.expand();
