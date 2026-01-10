import { db, ref, get, update, set } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

const arena = document.getElementById('arena');
const statusText = document.getElementById('status-text');
const actionBtns = document.getElementById('action-btns');
const timerDisplay = document.getElementById('timer-display');
const chickenLeft = document.getElementById('chicken-left');
const chickenRight = document.getElementById('chicken-right');

// Tovuq borligini tekshirish funksiyasi
async function checkChicken() {
    const snap = await get(ref(db, 'users/' + userId));
    const data = snap.val();
    if (!data || !data.chickens_list || data.chickens_list.length < 1) {
        tg.showAlert("❌ You have no chickens! Buy one in the Market first.");
        location.href = 'market.html'; // Tovuq bo'lmasa marketga jo'natadi
        return false;
    }
    return true;
}

// 1. Jang yaratish
async function createBattle() {
    if (!(await checkChicken())) return;

    statusText.innerText = "⏳ Looking for an opponent...";
    actionBtns.style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';

    await set(ref(db, 'active_battles/' + userId), {
        creator: userId,
        status: 'waiting',
        timestamp: Date.now()
    });

    const checkInterval = setInterval(async () => {
        const battleSnap = await get(ref(db, 'active_battles/' + userId));
        const battleData = battleSnap.val();
        if (battleData && battleData.opponent) {
            clearInterval(checkInterval);
            startVisualBattle(userId, battleData.opponent);
        }
    }, 3000);
}

// 2. Tasodifiy jangga qo'shilish
async function joinRandomBattle() {
    if (!(await checkChicken())) return;

    const battlesRef = ref(db, 'active_battles');
    const snap = await get(battlesRef);
    const battles = snap.val();

    const availableBattleId = battles ? Object.keys(battles).find(id => battles[id].status === 'waiting' && id !== userId.toString()) : null;

    if (availableBattleId) {
        await update(ref(db, 'active_battles/' + availableBattleId), {
            opponent: userId,
            status: 'fighting'
        });
        startVisualBattle(availableBattleId, userId);
    } else {
        tg.showAlert("No active battles. Create your own arena!");
    }
}

// 3. 30 Soniya Jang Animatsiyasi
function startVisualBattle(p1, p2) {
    arena.style.display = 'block';
    actionBtns.style.display = 'none';
    timerDisplay.style.display = 'block';
    statusText.innerText = "⚔️ THE CLASH HAS BEGUN!";

    chickenLeft.classList.add('attack-left');
    chickenRight.classList.add('attack-right');
    
    let timeLeft = 30; // 30 sekundlik jang
    const countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft + "s";
        
        // Tasodifiy sakrashlar
        chickenLeft.style.bottom = (20 + Math.random() * 10) + "%";
        chickenRight.style.bottom = (20 + Math.random() * 10) + "%";

        if (timeLeft <= 0) {
            clearInterval(countdown);
            chickenLeft.classList.remove('attack-left');
            chickenRight.classList.remove('attack-right');
            finishBattle(p1, p2);
        }
    }, 1000);
}

async function finishBattle(p1, p2) {
    statusText.innerText = "Calculating results...";
    
    const winnerId = Math.random() > 0.5 ? p1 : p2;
    const loserId = (winnerId === p1) ? p2 : p1;

    const winnerRef = ref(db, 'users/' + winnerId);
    const loserRef = ref(db, 'users/' + loserId);

    const [wSnap, lSnap] = await Promise.all([get(winnerRef), get(loserRef)]);
    let wData = wSnap.val();
    let lData = lSnap.val();

    // Mag'lubdan tovuq o'lishi (ayirish)
    let lChickens = lData.chickens_list || [];
    lChickens.pop(); 

    // G'olibga tovuq berilishi (qo'shish)
    let wChickens = wData.chickens_list || [];
    wChickens.push({ id: Date.now(), created: Date.now(), source: 'battle_win' });

    await Promise.all([
        update(winnerRef, { chickens_list: wChickens }),
        update(loserRef, { chickens_list: lChickens }),
        set(ref(db, 'active_battles/' + p1), null)
    ]);

    if (userId.toString() === winnerId.toString()) {
        statusText.innerHTML = "<h1 style='color:gold'>VICTORY! 🏆</h1>";
        tg.showAlert("You won! Your farm has a new champion.");
    } else {
        statusText.innerHTML = "<h1 style='color:red'>DEFEAT 💀</h1>";
        tg.showAlert("Oh no! Your chicken was defeated.");
    }

    setTimeout(() => location.reload(), 4000);
}

document.getElementById('createBattleBtn').onclick = createBattle;
document.getElementById('randomBattleBtn').onclick = joinRandomBattle;
