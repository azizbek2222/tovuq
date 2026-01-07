import { getUserId, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const userId = await getUserId();
    const userRef = ref(db, 'users/' + userId);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Balansni yangilash (0 bo'lib qolmasligi uchun)
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.innerText = parseFloat(data.balance || 0).toFixed(7);
            }

            // Tovuqlar va boshqa statistika
            if (document.getElementById('chicken-count')) {
                document.getElementById('chicken-count').innerText = data.chickens || 0;
            }
            
            // Gridni chizish... (oldingi kodingiz)
        }
    });
}
loadFarm();
