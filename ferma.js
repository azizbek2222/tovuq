import { getUserData, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Balans
            const balEl = document.getElementById('balance');
            if (balEl) balEl.innerText = parseFloat(data.balance || 0).toFixed(7);

            // Tovuqlar soni
            const countEl = document.getElementById('chicken-count');
            if (countEl) countEl.innerText = data.chickens || 0;

            // Vizual tovuqlar
            const grid = document.getElementById('farm-grid');
            if (grid) {
                grid.innerHTML = ""; // "Yuklanmoqda" yozuvini o'chiradi
                const count = data.chickens || 0;
                if (count === 0) {
                    grid.innerHTML = "<p>Sizda hali tovuq yo'q.</p>";
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
