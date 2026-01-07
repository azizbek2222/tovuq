import { getUserId, db, ref, onValue, update, get } from './auth.js';

async function initBozor() {
    const userId = await getUserId();
    const userRef = ref(db, 'users/' + userId);

    // Balansni REAL VAQTDA kuzatish
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.innerText = parseFloat(data.balance || 0).toFixed(7);
            }
        }
    });

    const buyBtn = document.getElementById('btn-buy-chicken');
    if (buyBtn) {
        buyBtn.onclick = async () => {
            const snapshot = await get(userRef);
            const currentData = snapshot.val();
            const price = 0.5; 

            if (currentData && currentData.balance >= price) {
                await update(userRef, {
                    balance: currentData.balance - price,
                    chickens: (currentData.chickens || 0) + 1
                });
                alert("Tovuq sotib olindi!");
            } else {
                alert("Mablag' yetarli emas!");
            }
        };
    }
}
initBozor();
