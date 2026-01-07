import { getUserData, db, ref, onValue, update, get } from './auth.js';

async function initBozor() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    // Balansni real vaqtda kuzatish
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const balanceEl = document.getElementById('balance');
            if (balanceEl) balanceEl.innerText = parseFloat(data.balance || 0).toFixed(7);
        }
    });

    // Sotib olish tugmasi
    const buyBtn = document.getElementById('btn-buy-chicken');
    if (buyBtn) {
        buyBtn.onclick = async () => {
            const snap = await get(userRef);
            const current = snap.val();
            const price = 0.5;

            if (current && current.balance >= price) {
                await update(userRef, {
                    balance: current.balance - price,
                    chickens: (current.chickens || 0) + 1
                });
                alert("Tovuq sotib olindi!");
            } else {
                alert("Mablag' yetarli emas!");
            }
        };
    }
}
initBozor();
