import { db, ref, get } from './firebase.js';

const loadingEl = document.getElementById('loading-overlay');
const podiumEl = document.getElementById('podium-view');
const listContainer = document.getElementById('ranking-list-container');

async function initRanking() {
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            loadingEl.innerText = "No players in the ranking yet.";
            return;
        }

        const data = snapshot.val();
        let players = [];

        Object.keys(data).forEach(uid => {
            const user = data[uid];
            players.push({
                id: uid,
                referrals: user.referrals_count || 0,
                chickens: user.chickens_list ? user.chickens_list.length : 0
            });
        });

        // Sort by referrals, then by chicken count
        players.sort((a, b) => b.referrals - a.referrals || b.chickens - a.chickens);

        const top100 = players.slice(0, 100);

        loadingEl.style.display = 'none';
        podiumEl.style.display = 'flex';
        listContainer.innerHTML = '';

        // Render Top 3 Podium
        for (let i = 0; i < 3; i++) {
            const p = top100[i];
            const card = document.getElementById(`rank-${i + 1}`);
            if (p) {
                card.querySelector('.uid').innerText = `ID: ${p.id}`;
                card.querySelector('.stats').innerHTML = `👥 ${p.referrals} Refs<br>🐔 ${p.chickens} Chickens`;
            } else {
                card.style.visibility = 'hidden';
            }
        }

        // Render remaining list (from 4th place)
        top100.slice(3).forEach((p, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="item-rank">#${index + 4}</div>
                <div class="item-info">
                    <div class="item-uid">ID: ${p.id}</div>
                    <div class="item-sub">🐔 ${p.chickens} Chickens owned</div>
                </div>
                <div class="item-refs">${p.referrals} Refs</div>
            `;
            listContainer.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        loadingEl.innerHTML = `<span style="color:red">Error loading data. Check your connection.</span>`;
    }
}

initRanking();
