import { db, ref, get, update, set, onValue } from './firebase.js';

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

// 1. Load Balance Real-time
onValue(ref(db, 'users/' + userId), (snap) => {
    if (snap.exists()) {
        const data = snap.val();
        balanceEl.innerText = parseFloat(data.balance || 0).toFixed(5);
    }
});

async function canFight() {
    const snap = await get(ref(db, 'users/' + userId));
    const data = snap.val();
    if (!data?.chickens_list || data.chickens_list.length < 1) {
        tg.showAlert("❌ No chickens found! Visit Market first.");
        return false;
    }
    return true;
}

// 2. Create Battle
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
        const bData = snap.val();
        if (bData?.status === 'fighting' && !isBattleRunning) {
            startFight();
        }
    });
};

// 3. Join Random
document.getElementById('randomBattleBtn').onclick = async () => {
    if (!(await canFight())) return;

    const snap = await get(ref(db, 'active_battles'));
    const battles = snap.val();
    const foundId = battles ? Object.keys(battles).find(id => battles[id].status === 'waiting' && id !== userId.toString()) : null;

    if (foundId) {
        role = "opponent";
        battleId = foundId;
        await update(ref(db, 'active_battles/' + battleId), {
            opponent: userId,
            status: 'fighting'
        });
        startFight();
    } else {
        tg.showAlert("No active rooms. Create your own!");
    }
};

// 4. Combat Logic
function startFight() {
    isBattleRunning = true;
    arena.style.display = 'block';
    hpSection.style.display = 'flex';
    instruction.style.display = 'block';
    tapOverlay.style.display = 'block';
    statusText.innerText = "FIGHT STARTED!";

    tapOverlay.onclick = () => {
        const tapKey = (role === "creator") ? 'creatorTap' : 'opponentTap';
        const bRef = ref(db, 'active_battles/' + battleId);
        get(bRef).then(s => {
            const d = s.val();
            if(d) update(bRef, { [tapKey]: (d[tapKey] || 0) + 1 });
        });
    };

    onValue(ref(db, 'active_battles/' + battleId), (snap) => {
        const bData = snap.val();
        if (!bData || !isBattleRunning) return;

        const myTaps = (role === "creator") ? bData.creatorTap : bData.opponentTap;
        const enemyTaps = (role === "creator") ? bData.opponentTap : bData.creatorTap;

        const myHP = Math.max(0, 100 - (enemyTaps * 2.5)); // 40 taps to die
        const enemyHP = Math.max(0, 100 - (myTaps * 2.5));

        document.getElementById('hp-left').style.width = myHP + "%";
        document.getElementById('hp-right').style.width = enemyHP + "%";

        // Animation
        document.getElementById('chicken-left').style.left = (5 + myTaps/1.5) + "%";
        document.getElementById('chicken-right').style.right = (5 + enemyTaps/1.5) + "%";

        if (myHP <= 0 || enemyHP <= 0) {
            isBattleRunning = false;
            endGame(myHP > 0);
        }
    });
}

async function endGame(isWin) {
    statusText.innerHTML = isWin ? "<span style='color:gold'>VICTORY! 🏆</span>" : "<span style='color:red'>DEFEAT! 💀</span>";
    tapOverlay.style.display = 'none';
    instruction.style.display = 'none';

    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    const uData = snap.val();
    let chickens = uData.chickens_list || [];

    if (isWin) {
        chickens.push({ id: Date.now(), created: Date.now(), source: 'battle_win' });
        tg.showAlert("Congrats! You won a chicken!");
    } else {
        chickens.pop();
        tg.showAlert("Sorry! Your chicken died.");
    }

    await update(userRef, { chickens_list: chickens });
    if (role === "creator") setTimeout(() => set(ref(db, 'active_battles/' + battleId), null), 2000);
    
    setTimeout(() => location.href = 'profile.html', 4000);
}
