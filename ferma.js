import { getUserData, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Balansni yangilash
            const balanceEl = document.getElementById('balance');
            if (balanceEl) balanceEl.innerText = parseFloat(data.balance || 0).toFixed(7);

            // Tovuqlar soni
            const countEl = document.getElementById('chicken-count');
            if (countEl) countEl.innerText = data.chickens || 0;

            // Tovuqlar ro'yxatini chiqarish
            const grid = document.getElementById('farm-grid');
            if (grid) {
                grid.innerHTML = ""; // "Yuklanmoqda" yozuvini o'chirish
                const count = data.chickens || 0;
                
                if (count === 0) {
                    grid.innerHTML = "<p>Hali tovuqlaringiz yo'q.</p>";
                } else {
                    for (let i = 0; i < count; i++) {
                        grid.innerHTML += `
                            <div class="chicken-item">
                                <i class="fa-solid fa-kiwi-bird"></i>
                                <p>Tovuq #${i + 1}</p>
                            </div>`;
                    }
                }
            }
        }
    });
}
loadFarm();
