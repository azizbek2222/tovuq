import { getUserData, db, ref, onValue, update, get } from './auth.js';

async function initBozor() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    // Balansni ekranda ko'rsatish
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.innerText = parseFloat(data.balance || 0).toFixed(7);
            }
        }
    });

    // Sotib olish tugmasi
    const buyBtn = document.getElementById('btn-buy-chicken');
    if (buyBtn) {
        buyBtn.onclick = async () => {
            const snapshot = await get(userRef);
            const currentData = snapshot.val();
            const price = 0.5; // 0.5 TON

            if (currentData && currentData.balance >= price) {
                await update(userRef, {
                    balance: currentData.balance - price,
                    chickens: (currentData.chickens || 0) + 1
                });
                alert("Tabriklaymiz! Tovuq sotib olindi.");
            } else {
                alert("Mablag' yetarli emas!");
            }
        };
    }
}

initBozor();
