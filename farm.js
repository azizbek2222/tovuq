import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

const INCOME_PER_CHICKEN = 0.00002;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 soat millisoniyalarda
const LIFESPAN_MS = 100 * 24 * 60 * 60 * 1000; // 100 kun

async function renderFarm() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return;

    let data = snapshot.val();
    const now = Date.now();
    const container = document.getElementById('chicken-container');
    container.innerHTML = '';

    // 1. Tovuqlarni muddati bo'yicha filtrlaymiz
    let chickens = data.chickens_list || [];
    const activeChickens = chickens.filter(ch => (now - ch.created) < LIFESPAN_MS);

    // Agar o'lgan tovuqlar bo'lsa, bazani yangilaymiz
    if (activeChickens.length !== chickens.length) {
        await update(userRef, { chickens_list: activeChickens });
        chickens = activeChickens;
    }

    document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
    document.getElementById('chicken-count').innerText = chickens.length;

    // 2. Har bir tovuqni render qilamiz
    chickens.forEach((chicken, index) => {
        const lastCol = chicken.last_collected || 0;
        const timePassed = now - lastCol;
        const canCollect = timePassed >= COOLDOWN_MS;

        const item = document.createElement('div');
        item.className = 'chicken-item';
        
        let buttonHTML = '';
        if (canCollect) {
            buttonHTML = `<button class="collect-mini-btn" data-index="${index}">Yig'ish</button>`;
        } else {
            const remaining = COOLDOWN_MS - timePassed;
            buttonHTML = `<span class="timer-text" data-remain="${remaining}">${formatTime(remaining)}</span>`;
        }

        item.innerHTML = `
            <span>🐔 Tovuq #${index + 1}</span>
            ${buttonHTML}
        `;
        container.appendChild(item);
    });

    // Tugmalarga hodisa bog'lash
    document.querySelectorAll('.collect-mini-btn').forEach(btn => {
        btn.onclick = () => collectFromChicken(parseInt(btn.dataset.index));
    });
}

async function collectFromChicken(index) {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    let data = snapshot.val();
    
    if (!data.chickens_list[index]) return;

    // Balansni oshirish va vaqtni yangilash
    data.balance = (parseFloat(data.balance) || 0) + INCOME_PER_CHICKEN;
    data.chickens_list[index].last_collected = Date.now();

    await update(userRef, {
        balance: data.balance,
        chickens_list: data.chickens_list
    });

    tg.showAlert(`Daromad yig'ildi: ${INCOME_PER_CHICKEN} USDT`);
    renderFarm();
}

// Millisoniyalarni HH:MM:SS formatiga o'tkazish
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Taymerlarni har soniyada yangilab turish
setInterval(() => {
    document.querySelectorAll('.timer-text').forEach(el => {
        let remain = parseInt(el.dataset.remain) - 1000;
        if (remain <= 0) {
            renderFarm(); // Taymer tugasa sahifani yangilaymiz
        } else {
            el.dataset.remain = remain;
            el.innerText = formatTime(remain);
        }
    });
}, 1000);

renderFarm();
