import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

// Reklama bloklari
const blockIds = [
    "int-20817", "int-20819", "int-20820", 
    "int-20821", "int-20822", "int-20824"
];

let currentBlockIndex = 0;
let adCount = 0;
const COOLDOWN_TIME = 3600 * 1000; // 1 soat (millisekundlarda)
let timerInterval = null;

// Foydalanuvchi ma'lumotlarini yuklash va Cooldown tekshirish
async function loadData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
        
        // Cooldown vaqtini tekshirish
        checkCooldown(data.lastAdRewardTime || 0);
    }
}

// Vaqt cheklovini tekshirish va taymerni yoqish
function checkCooldown(lastRewardTime) {
    const now = Date.now();
    const timePassed = now - lastRewardTime;
    const timeLeft = COOLDOWN_TIME - timePassed;

    const btn = document.getElementById('watchAdBtn');
    const timerContainer = document.getElementById('timer-container');
    const timerText = document.getElementById('timer');

    if (timeLeft > 0) {
        // Agar vaqt hali tugamagan bo'lsa
        btn.disabled = true;
        btn.innerText = "Vaqt kuting";
        timerContainer.style.display = "block";
        
        // Taymerni ishga tushirish
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            const currentNow = Date.now();
            const currentLeft = COOLDOWN_TIME - (currentNow - lastRewardTime);

            if (currentLeft <= 0) {
                clearInterval(timerInterval);
                btn.disabled = false;
                btn.innerText = "Reklama ko'rish";
                timerContainer.style.display = "none";
                document.getElementById('ad-counter').innerText = "0 / 10";
                adCount = 0;
            } else {
                // Vaqtni minut:sekund formatiga o'tkazish
                const minutes = Math.floor((currentLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((currentLeft % (1000 * 60)) / 1000);
                timerText.innerText = `${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`;
            }
        }, 1000);
    } else {
        // Cheklov yo'q
        btn.disabled = false;
        timerContainer.style.display = "none";
    }
}

// Reklamani ko'rsatish funksiyasi
const showNextAd = () => {
    const btn = document.getElementById('watchAdBtn');
    if (btn.disabled) return; // Agar tugma bloklangan bo'lsa, ishlamasin

    const currentBlockId = blockIds[currentBlockIndex];
    console.log("Yuklanmoqda: ", currentBlockId);
    
    const AdController = window.Adsgram.init({ blockId: currentBlockId });

    AdController.show().then(async (result) => {
        // Reklama muvaffaqiyatli ko'rilsa
        adCount++;
        document.getElementById('ad-counter').innerText = `${adCount} / 10`;

        currentBlockIndex = (currentBlockIndex + 1) % blockIds.length;

        if (adCount >= 10) {
            // 10 ta bo'ldi: Tovuq berish va Cooldown qo'yish
            await addChicken(true); // true = tekin (reklama orqali)
            
            adCount = 0;
            document.getElementById('ad-counter').innerText = `0 / 10`;
            
            // Vaqtni yangilash
            const userRef = ref(db, 'users/' + userId);
            const now = Date.now();
            await update(userRef, { lastAdRewardTime: now });
            
            // Taymerni darhol ishga tushirish
            checkCooldown(now); 

            tg.showAlert("Tabriklaymiz! Yangi tovuq qo'shildi. Keyingi urinish 1 soatdan keyin.");
        } else {
            tg.showConfirm(`Reklama qabul qilindi! Yana ${10 - adCount} ta qoldi.`);
        }
    }).catch((err) => {
        console.error("Adsgram xatosi:", err);
        tg.showAlert("Reklama hozircha tayyor emas. Qayta urinib ko'ring.");
    });
};

// Sotib olish funksiyasi (0.0003 USDT)
async function buyChickenBtn() {
    const buyBtn = document.getElementById('buyBtn');
    buyBtn.disabled = true; // Bosilganda bloklab turish

    try {
        const userRef = ref(db, 'users/' + userId);
        const snapshot = await get(userRef);
        const data = snapshot.val();
        const price = 0.0003;
        const currentBalance = parseFloat(data.balance || 0);

        if (currentBalance >= price) {
            // Balans yetarli
            const newBalance = currentBalance - price;
            
            // Balansni yangilash
            await update(userRef, { balance: newBalance });
            document.getElementById('balance').innerText = newBalance.toFixed(5);

            // Tovuq qo'shish
            await addChicken(false);

            tg.showAlert(`Muvaffaqiyatli! Tovuq sotib olindi. Balans: ${newBalance.toFixed(5)} USDT`);
        } else {
            tg.showAlert("Hisobingizda mablag' yetarli emas! (Kerak: 0.0003 USDT)");
        }
    } catch (error) {
        console.error("Xatolik:", error);
        tg.showAlert("Xatolik yuz berdi, qayta urinib ko'ring.");
    } finally {
        buyBtn.disabled = false; // Tugmani qayta yoqish
    }
}

// Tovuq qo'shish yordamchi funksiyasi
async function addChicken(isFree) {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();

    if (!data.chickens_list) data.chickens_list = [];
    
    data.chickens_list.push({
        id: Date.now(),
        created: Date.now(),
        source: isFree ? 'ad_reward' : 'purchased' // Qayerdan kelganini bilish uchun
    });

    await update(userRef, { chickens_list: data.chickens_list });
}

// Tugmalarga hodisalarni bog'lash
document.getElementById('watchAdBtn').onclick = showNextAd;
document.getElementById('buyBtn').onclick = buyChickenBtn;

// Dasturni ishga tushirish
loadData();
tg.expand();