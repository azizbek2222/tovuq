import { db, ref, get, update, set } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

const arena = document.getElementById('arena');
const statusText = document.getElementById('status-text');
const actionBtns = document.getElementById('action-btns');
const chickenLeft = document.getElementById('chicken-left');
const chickenRight = document.getElementById('chicken-right');

// 1. Jang yaratish
async function createBattle() {
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    const data = snap.val();

    if (!data.chickens_list || data.chickens_list.length < 1) {
        tg.showAlert("You need at least 1 chicken to fight!");
        return;
    }

    statusText.innerText = "Waiting for an opponent...";
    actionBtns.style.display = 'none';

    await set(ref(db, 'active_battles/' + userId), {
        creator: userId,
        status: 'waiting',
        timestamp: Date.now()
    });

    // Raqib kelishini kutish (oddiyroq bo'lishi uchun listener o'rniga pooling ishlatamiz)
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
    const battlesRef = ref(db, 'active_battles');
    const snap = await get(battlesRef);
    const battles = snap.val();

    if (!battles) {
        tg.showAlert("No active battles found. Create one!");
        return;
    }

    const availableBattleId = Object.keys(battles).find(id => battles[id].status === 'waiting' && id !== userId.toString());

    if (availableBattleId) {
        await update(ref(db, 'active_battles/' + availableBattleId), {
            opponent: userId,
            status: 'fighting'
        });
        startVisualBattle(availableBattleId, userId);
    } else {
        tg.showAlert("No opponents available right now.");
    }
}

// 3. Realistik Jang Animatsiyasi va Natija
async function startVisualBattle(p1, p2) {
    arena.style.display = 'block';
    actionBtns.style.display = 'none';
    statusText.innerText = "BATTLE STARTED!";

    // Animatsiya (tovuqlar bir-biriga yaqinlashadi)
    chickenLeft.classList.add('attack-anim');
    chickenRight.classList.add('attack-anim');
    
    let moveCount = 0;
    const fightEffect = setInterval(() => {
        chickenLeft.style.left = (10 + Math.random() * 20) + "%";
        chickenRight.style.right = (10 + Math.random() * 20) + "%";
        moveCount++;

        if (moveCount > 15) { // Jang 3 soniya davom etadi
            clearInterval(fightEffect);
            finishBattle(p1, p2);
        }
    }, 200);
}

async function finishBattle(p1, p2) {
    const winnerId = Math.random() > 0.5 ? p1 : p2;
    const loserId = (winnerId === p1) ? p2 : p1;

    // Firebase-da ma'lumotlarni yangilash
    const winnerRef = ref(db, 'users/' + winnerId);
    const loserRef = ref(db, 'users/' + loserId);

    const [wSnap, lSnap] = await Promise.all([get(winnerRef), get(loserRef)]);
    let wData = wSnap.val();
    let lData = lSnap.val();

    // Mag'lubdan tovuqni olish
    let lChickens = lData.chickens_list || [];
    lChickens.pop(); // Oxirgisini olib tashlash

    // G'olibga tovuq qo'shish
    let wChickens = wData.chickens_list || [];
    wChickens.push({ id: Date.now(), created: Date.now(), source: 'battle_win' });

    await Promise.all([
        update(winnerRef, { chickens_list: wChickens }),
        update(loserRef, { chickens_list: lChickens }),
        set(ref(db, 'active_battles/' + p1), null) // Jangni tozalash
    ]);

    if (userId.toString() === winnerId.toString()) {
        statusText.innerHTML = "<span style='color:gold'>YOU WON! 🏆 +1 Chicken</span>";
        tg.showAlert("Victory! You took the opponent's chicken!");
    } else {
        statusText.innerHTML = "<span style='color:red'>YOU LOST! 💀 -1 Chicken</span>";
        tg.showAlert("Defeat! Your chicken died in battle.");
    }

    setTimeout(() => location.reload(), 3000);
}

document.getElementById('createBattleBtn').onclick = createBattle;
document.getElementById('randomBattleBtn').onclick = joinRandomBattle;
