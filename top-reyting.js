import { db, ref, get } from './firebase.js';

const tg = window.Telegram.WebApp;

async function loadRanking() {
    const rankingContainer = document.getElementById('ranking-container');
    const loadingText = document.getElementById('loading');
    
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Obyektni massivga o'tkazamiz
            let usersArray = Object.keys(data).map(key => {
                return {
                    id: key,
                    referrals_count: data[key].referrals_count || 0,
                    chickens_count: data[key].chickens_list ? data[key].chickens_list.length : 0
                };
            });

            // Referallar soni bo'yicha saralash (kamayish tartibida)
            usersArray.sort((a, b) => b.referrals_count - a.referrals_count);

            // Faqat top 100 tasini olamiz
            const top100 = usersArray.slice(0, 100);

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
            loadingText.innerText = "Hozircha ma'lumot yo'q.";
        }
    } catch (error) {
        console.error("Reyting yuklashda xato:", error);
        loadingText.innerText = "Ma'lumot yuklashda xatolik yuz berdi.";
    }
}

// Ilovani ochishda reytingni yuklash
loadRanking();
tg.expand();
