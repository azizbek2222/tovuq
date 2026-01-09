import { db, ref, get, update } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

const INCOME_PER_CHICKEN = 0.00002;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 soat
const LIFESPAN_MS = 100 * 24 * 60 * 60 * 1000; // 100 kun

// Yig'ish jarayoni ketayotganini tekshirish uchun bayroq
let isCollecting = false;

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
        
        const lifeUsed = now - chicken.created;
        const lifeRemaining = LIFESPAN_MS - lifeUsed;
        const daysLeft = Math.floor(lifeRemaining / (24 * 60 * 60 * 1000));

        const item = document.createElement('div');
        item.className = 'chicken-item';
        
        let actionContent = '';
        if (canCollect) {
            // Tugmani ID bilan yaratamizki, keyin uni oson o'chiraylik
            actionContent = `<button class="collect-mini-btn" id="btn-${index}" data-index="${index}">Assembly</button>`;
        } else {
            const remaining = COOLDOWN_MS - timePassed;
            actionContent = `<span class="timer-text" data-remain="${remaining}">${formatTime(remaining)}</span>`;
        }

        item.innerHTML = `
            <div class="chicken-info">
                <span>🐔 Chicken #${index + 1}</span>
                <span class="life-text">Lifespan: ${daysLeft > 0 ? daysLeft : 0} days left</span>
            </div>
            ${actionContent}
        `;
        container.appendChild(item);
    });

    // Tugmalarga event listener qo'shish
    document.querySelectorAll('.collect-mini-btn').forEach(btn => {
        btn.onclick = (e) => {
            const index = parseInt(e.target.dataset.index);
            collectFromChicken(index, e.target);
        };
    });
}

async function collectFromChicken(index, buttonElement) {
    // Agar jarayon ketayotgan bo'lsa yoki tugma o'chirilgan bo'lsa, funksiyani to'xtatamiz
    if (isCollecting || (buttonElement && buttonElement.disabled)) return;

    try {
        isCollecting = true; // Jarayon boshlandi
        if (buttonElement) {
            buttonElement.disabled = true; // Tugmani darhol o'chirish
            buttonElement.innerText = "Wait...";
        }

        const userRef = ref(db, 'users/' + userId);
        const snapshot = await get(userRef);
        let data = snapshot.val();
        
        if (!data || !data.chickens_list || !data.chickens_list[index]) {
            throw new Error("Information not found");
        }

        const now = Date.now();
        const lastCol = data.chickens_list[index].last_collected || 0;

        // Baza darajasida vaqtni qayta tekshirish (xavfsizlik uchun)
        if (now - lastCol < COOLDOWN_MS) {
            tg.showAlert("The time has not come yet.!");
            renderFarm();
            return;
        }

        const newBalance = (parseFloat(data.balance) || 0) + INCOME_PER_CHICKEN;
        data.chickens_list[index].last_collected = now;

        // Bazani yangilash
        await update(userRef, {
            balance: newBalance,
            chickens_list: data.chickens_list
        });

        tg.showAlert(`Revenue collected: ${INCOME_PER_CHICKEN} USDT`);
        
    } catch (error) {
        console.error("Xatolik:", error);
        tg.showAlert("The internet connection is slow, please try again..");
    } finally {
        isCollecting = false; // Jarayon tugadi
        renderFarm(); // Ekranni qayta chizish
    }
}

function formatTime(ms) {
    if (ms <= 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Timer yangilanishi
setInterval(() => {
    document.querySelectorAll('.timer-text').forEach(el => {
        let remain = parseInt(el.dataset.remain) - 1000;
        if (remain <= 0) {
            // Faqat bitta taymer tugasa ham hammasini render qilmaslik uchun tekshiruv
            if (!el.dataset.reloading) {
                el.dataset.reloading = "true";
                renderFarm();
            }
        } else {
            el.dataset.remain = remain;
            el.innerText = formatTime(remain);
        }
    });
}, 1000);

renderFarm();