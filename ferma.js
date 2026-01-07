import { getUserData, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const user = await getUserData();
    const userRef = ref(db, 'users/' + user.id);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Balansni yangilash (Agar HTMLda id="balance" bo'lsa)
            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.innerText = parseFloat(data.balance || 0).toFixed(7);
            }

            // Tovuqlar sonini yangilash
            const chickenCount = data.chickens || 0;
            const countDisplay = document.getElementById('chicken-count');
            if (countDisplay) countDisplay.innerText = chickenCount;

            // Tovuqlarni vizual ko'rsatish
            const grid = document.getElementById('farm-grid');
            if (grid) {
                grid.innerHTML = "";
                if (chickenCount === 0) {
                    grid.innerHTML = "<p>Sizda hali tovuqlar yo'q.</p>";
                } else {
                    for (let i = 0; i < chickenCount; i++) {
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
