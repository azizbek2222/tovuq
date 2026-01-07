import { getUserData, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Balansni yangilash
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.innerText = parseFloat(data.balance || 0).toFixed(7);
            }

            // Tovuqlar sonini yangilash
            const countEl = document.getElementById('chicken-count');
            if (countEl) countEl.innerText = data.chickens || 0;

            // Tovuqlarni ro'yxatda chiqarish
            const grid = document.getElementById('farm-grid');
            if (grid) {
                grid.innerHTML = ""; // Tozalash
                const chickensCount = data.chickens || 0;
                
                if (chickensCount === 0) {
                    grid.innerHTML = "<p style='grid-column: 1/4; text-align: center;'>Sizda hali tovuqlar yo'q.</p>";
                } else {
                    for (let i = 0; i < chickensCount; i++) {
                        grid.innerHTML += `
                            <div class="chicken-item">
                                <i class="fa-solid fa-kiwi-bird" style="font-size: 40px; color: #f39c12;"></i>
                                <p>Tovuq #${i + 1}</p>
                            </div>`;
                    }
                }
            }
        }
    });
}

loadFarm();
