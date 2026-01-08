import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";
const AdController = window.Adsgram.init({ blockId: "int-20798" }); // O'z blockId-ingizni qo'ying

let adCount = 0;

async function loadData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        document.getElementById('balance').innerText = parseFloat(snapshot.val().balance || 0).toFixed(5);
    }
}

document.getElementById('watchAdBtn').onclick = async () => {
    AdController.show().then(async (result) => {
        // Reklama to'liq ko'rilsa
        adCount++;
        document.getElementById('ad-counter').innerText = `${adCount} / 10`;

        if (adCount >= 10) {
            await addChicken();
            adCount = 0;
            document.getElementById('ad-counter').innerText = `0 / 10`;
            tg.showAlert("Tabriklaymiz! Yangi tovuq fermangizga qo'shildi.");
        }
    }).catch((err) => {
        tg.showAlert("Reklama yuklanmadi yoki oxirigacha ko'rilmadi.");
    });
};

async function addChicken() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();

    if (!data.chickens_list) data.chickens_list = [];
    
    // Yangi tovuq obyekti: yaratilgan vaqti bilan
    data.chickens_list.push({
        id: Date.now(),
        created: Date.now()
    });

    await update(userRef, data);
}

loadData();