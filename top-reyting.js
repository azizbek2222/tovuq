import { db, ref, get } from './firebase.js';

const tg = window.Telegram.WebApp;

async function loadRanking() {
    const rankingContainer = document.getElementById('ranking-container');
    const loadingText = document.getElementById('loading');
    
    try {
        // Ma'lumotlarni bazadan olish
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Obyektni massivga o'tkazish
            let usersArray = [];
            for (let id in data) {
                usersArray.push({
                    id: id,
                    referrals_count: data[id].referrals_count || 0,
                    chickens_count: data[id].chickens_list ? data[id].chickens_list.length : 0
                });
            }

            // Referallar bo'yicha saralash
            usersArray.sort((a, b) => b.referrals_count - a.referrals_count);

            // Top 100
            const top100 = usersArray.slice(0, 100);

            // Ekranni tozalash
            loadingText.style.display = 'none';
            rankingContainer.innerHTML = '';

            top100.forEach((user, index) => {
                const rank = index + 1;
                let rankClass = '';
                let medal = '';

                if (rank === 1) { rankClass = 'rank-1'; medal = '🥇'; }
                else if (rank === 2) { rankClass = 'rank-2'; medal = '🥈'; }
                else if (rank === 3) { rankClass = 'rank-3'; medal = '🥉'; }

                const item = document.createElement('div');
                item.className = `ranking-item ${rankClass}`;
                
                item.innerHTML = `
                    <div class="rank-number">${medal || rank}</div>
                    <div class="user-details">
                        <div class="user-id">ID: ${user.id}</div>
                        <div class="user-stats">
                            <span class="stat-item">👥 ${user.referrals_count} ref</span>
                            <span class="stat-item">🐔 ${user.chickens_count} ta</span>
                        </div>
                    </div>
                `;
                rankingContainer.appendChild(item);
            });
        } else {
            loadingText.innerText = "Hozircha foydalanuvchilar yo'q.";
        }
    } catch (error) {
        console.error("Xatolik:", error);
        loadingText.innerHTML = `<span style="color: red;">Xatolik yuz berdi: ${error.message}</span>`;
    }
}

// Ishga tushirish
loadRanking();
tg.expand();
