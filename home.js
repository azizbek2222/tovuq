import { db, ref, get, update, set } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

let userData = {
    balance: 0.00,
    chickens: 1,
    last_collected: Date.now()
};

// Sahifani yuklash
async function initApp() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        userData = snapshot.val();
    } else {
        await set(userRef, userData);
    }
    updateUI();
    switchPage('home'); // Boshlang'ich sahifa
}

// Sahifalar mantiqi
window.switchPage = (page) => {
    const content = document.getElementById('main-content');
    
    // Aktiv menyu rangini o'zgartirish
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    if (page === 'home') {
        content.innerHTML = `
            <div class="card">
                <h2>Xush kelibsiz!</h2>
                <p>Sizning fermangiz rivojlanishga tayyor. Tovuqlarga qarang va TON ishlang.</p>
                <img src="https://cdn-icons-png.flaticon.com/512/2662/2662207.png" width="100">
            </div>
        `;
    } else if (page === 'market') {
        content.innerHTML = `
            <div class="card">
                <h3>Market</h3>
                <p>Yangi tovuq: 0.5 TON</p>
                <button onclick="buyChicken()" style="padding:10px; background:gold; border-radius:10px;">Sotib olish</button>
            </div>
        `;
    } else if (page === 'farm') {
        content.innerHTML = `
            <div class="card">
                <h3>Sizning Fermangiz</h3>
                <p>Tovuqlar soni: ${userData.chickens} ta</p>
                <div style="font-size:50px;">🐔</div>
                <button onclick="collectIncome()" style="padding:10px; background:#4CAF50; color:white; border-radius:10px;">Daromadni yig'ish</button>
            </div>
        `;
    } else if (page === 'profile') {
        content.innerHTML = `
            <div class="card">
                <h3>Profil</h3>
                <p>ID: ${userId}</p>
                <p>Jami ishlangan: ${userData.balance} TON</p>
                <button onclick="tg.close()" style="background:red; color:white; padding:5px;">Chiqish</button>
            </div>
        `;
    }
};

window.buyChicken = async () => {
    if (userData.balance >= 0.5) {
        userData.balance -= 0.5;
        userData.chickens += 1;
        await syncData();
        switchPage('market');
    } else {
        tg.showAlert("Balansda yetarli TON yo'q!");
    }
};

window.collectIncome = async () => {
    const income = userData.chickens * 0.01; // Har bir tovuq 0.01 TON beradi
    userData.balance += income;
    await syncData();
    tg.showScanQrPopup({text: "Daromad yig'ildi: " + income + " TON"});
    switchPage('farm');
};

async function syncData() {
    const userRef = ref(db, 'users/' + userId);
    await update(userRef, userData);
    updateUI();
}

function updateUI() {
    document.getElementById('balance').innerText = userData.balance.toFixed(2);
}

initApp();
tg.expand();
