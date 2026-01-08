import { db, ref, get } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";
const botUsername = "chicken_farm_robot"; // Botingiz username-i
const appName = "my_farm"; // Mini app nomi

const refLink = `https://t.me/${botUsername}/${appName}?startapp=${userId}`;

async function initReferral() {
    // Havolani ekranga chiqarish
    document.getElementById('referral-link').innerText = refLink;

    // Firebase-dan referal ma'lumotlarini olish
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        const count = data.referrals_count || 0;
        
        document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
        document.getElementById('ref-count').innerText = count;
        document.getElementById('ref-earned').innerText = (count * 0.00005).toFixed(5);
    }
}

// Havolani nusxalash
document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(refLink);
    tg.showScanQrPopup({ text: "Link copied to clipboard!" }); 
    // Alternativ: tg.showAlert("Link copied!");
};

// Telegramda ulashish
document.getElementById('shareBtn').onclick = () => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("Join my chicken farm and earn USDT together! 🐔💰")}`;
    tg.openTelegramLink(shareUrl);
};

initReferral();
tg.expand();
