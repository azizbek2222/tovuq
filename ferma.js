import { getUser, db, ref, onValue } from './auth.js';

async function loadFarm() {
    const userData = await getUser();
    const userRef = ref(db, 'users/' + userData.id);

    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const grid = document.getElementById('farm-grid');
            grid.innerHTML = "";
            const count = data.chickens || 0;
            document.getElementById('chicken-count').innerText = count;

            for (let i = 0; i < count; i++) {
                grid.innerHTML += `
                    <div class="chicken-item">
                        <i class="fa-solid fa-kiwi-bird"></i>
                        <p>Tovuq #${i + 1}</p>
                    </div>`;
            }
        }
    });
}
loadFarm();
