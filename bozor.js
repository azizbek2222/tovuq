import { getUser, db, ref, update, get } from './auth.js';

const buyBtn = document.getElementById('btn-buy-chicken');

if (buyBtn) {
    buyBtn.onclick = async () => {
        const userData = await getUser();
        const userRef = ref(db, 'users/' + userData.id);
        
        const snapshot = await get(userRef);
        const currentData = snapshot.val();
        const price = 0.5; // 0.5 TON

        if (currentData.balance >= price) {
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
