import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

const INCOME_PER_CHICKEN = 0.00002;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 soat
const LIFESPAN_MS = 100 * 24 * 60 * 60 * 1000; // 100 kun

async function renderFarm() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return;

    let data = snapshot.val();
    const now = Date.now();
    const container = document.getElementById('chicken-container');
    container.innerHTML = '';

    let chickens = data.chickens_list || [];
    
    // 1. O'lgan tovuqlarni filtrdan o'tkazamiz
    const activeChickens = chickens.filter(ch => (now - ch.created) < LIFESPAN_MS);

    if (activeChickens.length !== chickens.length) {
        await update(userRef, { chickens_list: activeChickens });
        chickens = activeChickens;
    }

    document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
    document.getElementById('chicken-count').innerText = chickens.length;

    // 2. Har bir tovuqni render qilish
    chickens.forEach((chicken, index) => {
        const lastCol = chicken.last_collected || 0;
        const timePassed = now - lastCol;
        const canCollect = timePassed >= COOLDOWN_MS;
        
        // Qolgan umrni hisoblash
        const lifeUsed = now - chicken.created;
        const lifeRemaining = LIFESPAN_MS - lifeUsed;
        const daysLeft = Math.floor(lifeRemaining / (24 * 60 * 60 * 1000));

        const item = document.createElement('div');
        item.className = 'chicken-item';
        
        let actionContent = '';
        if (canCollect) {
            actionContent = `<button class="collect-mini-btn" data-index="${index}">Yig'ish</button>`;
        } else {
            const remaining = COOLDOWN_MS - timePassed;
            actionContent = `<span class="timer-text" data-remain="${remaining}">${formatTime(remaining)}</span>`;
        }

        item.innerHTML = `
            <div class="chicken-info">
                <span>🐔 Tovuq #${index + 1}</span>
                <span class="life-text">Umri: ${daysLeft} kun qoldi</span>
            </div>
            ${actionContent}
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.collect-mini-btn').forEach(btn => {
        btn.onclick = () => collectFromChicken(parseInt(btn.dataset.index));
    });
}

async function collectFromChicken(index) {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();
    
    if (!data.chickens_list[index]) return;

    data.balance = (parseFloat(data.balance) || 0) + INCOME_PER_CHICKEN;
    data.chickens_list[index].last_collected = Date.now();

    await update(userRef, {
        balance: data.balance,
        chickens_list: data.chickens_list
    });

    tg.showAlert(`Daromad yig'ildi: ${INCOME_PER_CHICKEN} USDT`);
    renderFarm();
}

function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

setInterval(() => {
    document.querySelectorAll('.timer-text').forEach(el => {
        let remain = parseInt(el.dataset.remain) - 1000;
        if (remain <= 0) {
            renderFarm();
        } else {
            el.dataset.remain = remain;
            el.innerText = formatTime(remain);
        }
    });
}, 1000);

renderFarm();