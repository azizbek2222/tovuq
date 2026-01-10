import { db, ref, get, update, set } from './firebase.js';
import { onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

const balanceEl = document.getElementById('balance');
const statusText = document.getElementById('status-text');
const actionBtns = document.getElementById('action-btns');
const hpSection = document.getElementById('hp-section');
const arena = document.getElementById('arena');
const instruction = document.getElementById('instruction');
const tapOverlay = document.getElementById('tap-overlay');

let battleId = null;
let role = ""; 
let isBattleRunning = false;

// 1. BALANSNI REAL-TIME YUKLASH (XATOLIK TUZATILDI)
onValue(ref(db, 'users/' + userId), (snap) => {
    if (snap.exists()) {
        const val = snap.val();
        balanceEl.innerText = parseFloat(val.balance || 0).toFixed(5);
    }
});

async function canFight() {
    const snap = await get(ref(db, 'users/' + userId));
    const data = snap.val();
    if (!data?.chickens_list || data.chickens_list.length < 1) {
        tg.showAlert("❌ You need at least 1 chicken! Visit the Market.");
        return false;
    }
    return true;
}

// 2. JANG YARATISH
document.getElementById('createBattleBtn').onclick = async () => {
    if (!(await canFight())) return;

    role = "creator";
    battleId = userId.toString();
    actionBtns.style.display = 'none';
    statusText.innerText = "WAITING FOR OPPONENT...";

    await set(ref(db, 'active_battles/' + battleId), {
        creator: userId,
        status: 'waiting',
        creatorTap: 0,
        opponentTap: 0,
        timestamp: Date.now()
    });

    onValue(ref(db, 'active_battles/' + battleId), (snap) => {
        const data = snap.val();
        if (data?.status === 'fighting' && !isBattleRunning) {
            startTheFight(data);
        }
    });
};

// 3. JANGGA QO'SHILISH
document.getElementById('randomBattleBtn').onclick = async () => {
    if (!(await canFight())) return;

    const snap = await get(ref(db, 'active_battles'));
    const all = snap.val();
    const foundId = all ? Object.keys(all).find(id => all[id].status === 'waiting' && id !== userId.toString()) : null;

    if (foundId) {
        role = "opponent";
        battleId = foundId;
        await update(ref(db, 'active_battles/' + battleId), {
            opponent: userId,
            status: 'fighting'
        });
        
        onValue(ref(db, 'active_battles/' + battleId), (snap) => {
            const data = snap.val();
            if (data?.status === 'fighting' && !isBattleRunning) {
                startTheFight(data);
            }
        });
    } else {
        tg.showAlert("No active rooms. Create one!");
    }
};

// 4. JANG MEXANIKASI (TAP-TO-WIN)
function startTheFight() {
    isBattleRunning = true;
    arena.style.display = 'block';
    hpSection.style.display = 'flex';
    instruction.style.display = 'block';
    tapOverlay.style.display = 'block';
    statusText.innerText = "BATTLE IN PROGRESS!";

    tapOverlay.onclick = () => {
        const tapKey = (role === "creator") ? 'creatorTap' : 'opponentTap';
        const battleRef = ref(db, 'active_battles/' + battleId);
        get(battleRef).then(s => {
            const d = s.val();
            if (d) update(battleRef, { [tapKey]: (d[tapKey] || 0) + 1 });
        });
    };

    onValue(ref(db, 'active_battles/' + battleId), (snap) => {
        const b = snap.val();
        if (!b || !isBattleRunning) return;

        const myTaps = (role === "creator") ? b.creatorTap : b.opponentTap;
        const enemyTaps = (role === "creator") ? b.opponentTap : b.creatorTap;

        // Har bir tap 2.5% jon oladi
        const myHP = Math.max(0, 100 - (enemyTaps * 2.5));
        const enemyHP = Math.max(0, 100 - (myTaps * 2.5));

        document.getElementById('hp-left').style.width = myHP + "%";
        document.getElementById('hp-right').style.width = enemyHP + "%";

        // Tovuqlar harakati
        document.getElementById('chicken-left').style.left = (5 + myTaps/2) + "%";
        document.getElementById('chicken-right').style.right = (5 + enemyTaps/2) + "%";

        if (myHP <= 0 || enemyHP <= 0) {
            isBattleRunning = false;
            concludeBattle(myHP > 0);
        }
    });
}

async function concludeBattle(isWin) {
    statusText.innerHTML = isWin ? "<h2 style='color:gold'>VICTORY! 🏆</h2>" : "<h2 style='color:red'>DEFEAT! 💀</h2>";
    tapOverlay.style.display = 'none';
    instruction.style.display = 'none';

    const userRef = ref(db, 'users/' + userId);
    const userSnap = await get(userRef);
    let chickens = userSnap.val().chickens_list || [];

    if (isWin) {
        chickens.push({ id: Date.now(), created: Date.now(), source: 'battle' });
        tg.showAlert("Victory! You won a chicken!");
    } else {
        chickens.pop();
        tg.showAlert("Defeat! You lost a chicken.");
    }

    await update(userRef, { chickens_list: chickens });
    if (role === "creator") setTimeout(() => set(ref(db, 'active_battles/' + battleId), null), 3000);
    
    setTimeout(() => location.href = 'profile.html', 5000);
}
