import { getUserData, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Balansni yangilash
            const balEl = document.getElementById('balance');
            if (balEl) balEl.innerText = parseFloat(data.balance || 0).toFixed(7);

            // Tovuqlar soni matni
            const countEl = document.getElementById('chicken-count');
            if (countEl) countEl.innerText = data.chickens || 0;

            // Vizual tovuqlar ro'yxati
            const grid = document.getElementById('farm-grid');
            if (grid) {
                grid.innerHTML = ""; 
                const count = data.chickens || 0;
                if (count === 0) {
                    grid.innerHTML = "<p style='grid-column: 1/4;'>Sizda hali tovuq yo'q. Bozorga o'ting!</p>";
                } else {
                    for (let i = 0; i < count; i++) {
                        const chickenDiv = document.createElement('div');
                        chickenDiv.className = 'chicken-item';
                        chickenDiv.innerHTML = `
                            <i class="fa-solid fa-kiwi-bird"></i>
                            <p>Tovuq #${i + 1}</p>
                        `;
                        grid.appendChild(chickenDiv);
                    }
                }
            }
        }
    });
}

loadFarm();
