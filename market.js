import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

// 5 ta turli xil Block ID ro'yxati
const blockIds = [
    "int-20798", // 1-blok
    "int-20799", // 2-blok (O'zingiznikini qo'ying)
    "int-20801", // 3-blok
    "int-20802", // 4-blok
    "int-20803"  // 5-blok
];

let currentBlockIndex = 0;
let adCount = 0;

async function loadData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
    }
}

// Reklamani ko'rsatish funksiyasi
const showNextAd = () => {
    // Navbatdagi blockId ni olish
    const currentBlockId = blockIds[currentBlockIndex];
    console.log("Yuklanmoqda: ", currentBlockId);
    
    const AdController = window.Adsgram.init({ blockId: currentBlockId });

    AdController.show().then(async (result) => {
        // Reklama muvaffaqiyatli ko'rilsa
        adCount++;
        document.getElementById('ad-counter').innerText = `${adCount} / 10`;

        // Navbatni keyingi blokga o'tkazish (0-4 oralig'ida aylanadi)
        currentBlockIndex = (currentBlockIndex + 1) % blockIds.length;

        if (adCount >= 10) {
            await addChicken();
            adCount = 0;
            document.getElementById('ad-counter').innerText = `0 / 10`;
            tg.showAlert("Tabriklaymiz! 10 ta reklama ko'rildi va yangi tovuq fermaga qo'shildi.");
        } else {
            tg.showConfirm(`Reklama qabul qilindi! Yana ${10 - adCount} ta qoldi.`);
        }
    }).catch((err) => {
        console.error("Adsgram xatosi:", err);
        tg.showAlert("Reklama hozircha tayyor emas yoki blokda cheklov bor. Birozdan so'ng urinib ko'ring.");
    });
};

async function addChicken() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();

    if (!data.chickens_list) data.chickens_list = [];
    
    // Yangi tovuq obyekti (100 kun yashashi uchun vaqt bilan)
    data.chickens_list.push({
        id: Date.now(),
        created: Date.now()
    });

    await update(userRef, { chickens_list: data.chickens_list });
}

// Tugmaga hodisani bog'lash
document.getElementById('watchAdBtn').onclick = showNextAd;

// Ma'lumotlarni yuklash
loadData();
tg.expand();