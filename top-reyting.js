import { db, ref, get } from './firebase.js';

const statusMsg = document.getElementById('status-msg');
const container = document.getElementById('ranking-container');
const podium = document.getElementById('podium-container');

async function fetchRanking() {
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            statusMsg.innerText = "No data yet..";
            return;
        }

        const allData = snapshot.val();
        let usersList = [];

        Object.keys(allData).forEach(key => {
            const user = allData[key];
            usersList.push({
                id: key,
                refs: user.referrals_count || 0,
                chickens: user.chickens_list ? user.chickens_list.length : 0
            });
        });

        // Referallar soni bo'yicha saralash
        usersList.sort((a, b) => b.refs - a.refs);

        const top100 = usersList.slice(0, 100);
        statusMsg.style.display = 'none';
        podium.style.display = 'flex';
        container.innerHTML = '';

        // Top 3 ni shohsupaga joylash
        for(let i=0; i<3; i++) {
            if(top100[i]) {
                const el = document.getElementById(`p-${i+1}`);
                el.querySelector('.podium-id').innerText = `ID: ${top100[i].id}`;
                el.querySelector('.podium-count').innerText = `${top100[i].refs} referal`;
            }
        }

        // 4-o'rindan boshlab ro'yxatga chiqarish
        top100.slice(3).forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            
            item.innerHTML = `
                <div class="rank-num">${index + 4}</div>
                <div class="user-info">
                    <div class="user-id">ID: ${user.id}</div>
                    <div class="user-stats">🐔 ${user.chickens} chicken</div>
                </div>
                <div class="score-box">
                    ${user.refs} ref
                </div>
            `;
            container.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        statusMsg.classList.add('error-msg');
        statusMsg.innerText = "Xatolik: " + error.message;
    }
}

fetchRanking();