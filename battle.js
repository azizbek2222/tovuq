import { db, ref, get, update, set, onValue } from './firebase.js';

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

// Elementlar
const balanceEl = document.getElementById('balance');
const hpSection = document.getElementById('hp-section');
const arena = document.getElementById('arena');
const statusText = document.getElementById('status-text');
const actionBtns = document.getElementById('action-btns');
const instruction = document.getElementById('instruction');

let myHP = 100;
let enemyHP = 100;
let battleActive = false;
let battleId = null;
let role = ""; // "creator" yoki "opponent"

// 1. Balansni real vaqtda yuklash
function loadBalance() {
    onValue(ref(db, 'users/' + userId), (snap) => {
        if (snap.exists()) {
            balanceEl.innerText = parseFloat(snap.val().balance || 0).toFixed(5);
        }
    });
}
loadBalance();

async function checkChicken() {
    const snap = await get(ref(db, 'users/' + userId));
    const data = snap.val();
    if (!data?.chickens_list || data.chickens_list.length < 1) {
        tg.showAlert("❌ You need a chicken to fight!");
        return false;
    }
    return true;
}

// 2. Jang yaratish
document.getElementById('createBattleBtn').onclick = async () => {
    if (!(await checkChicken())) return;
    role = "creator";
    battleId = userId;
    actionBtns.style.display = 'none';
    statusText.innerText = "Waiting for rival...";
    
    await set(ref(db, 'active_battles/' + userId), {
        creator: userId,
        status: 'waiting',
        creatorTap: 0,
        opponentTap: 0
    });

    onValue(ref(db, 'active_battles/' + userId), (snap) => {
        const data = snap.val();
        if (data?.status === 'fighting' && !battleActive) {
            startBattleFlow(data);
        }
    });
};

// 3. Jangga qo'shilish
document.getElementById('randomBattleBtn').onclick = async () => {
    if (!(await checkChicken())) return;
    const snap = await get(ref(db, 'active_battles'));
    const battles = snap.val();
    const foundId = battles ? Object.keys(battles).find(id => battles[id].status === 'waiting') : null;

    if (foundId) {
        role = "opponent";
        battleId = foundId;
        await update(ref(db, 'active_battles/' + foundId), {
            opponent: userId,
            status: 'fighting'
        });
    } else {
        tg.showAlert("No battles found. Create one!");
    }
};

// 4. Jangni boshlash
function startBattleFlow(data) {
    battleActive = true;
    arena.style.display = 'block';
    hpSection.style.display = 'flex';
    instruction.style.display = 'block';
    statusText.innerText = "FIGHT!";
    actionBtns.style.display = 'none';

    // Tap mexanikasi
    document.getElementById('tap-zone').onclick = () => {
        if (!battleActive) return;
        const tapKey = (role === "creator") ? 'creatorTap' : 'opponentTap';
        update(ref(db, 'active_battles/' + battleId), {
            [tapKey]: data[tapKey] + 1
        });
    };

    // HP yangilanishini kuzatish
    onValue(ref(db, 'active_battles/' + battleId), (snap) => {
        const bData = snap.val();
        if (!bData) return;

        const myTaps = (role === "creator") ? bData.creatorTap : bData.opponentTap;
        const enemyTaps = (role === "creator") ? bData.opponentTap : bData.creatorTap;

        // Vizual HP hisoblash
        enemyHP = 100 - (myTaps * 2); 
        myHP = 100 - (enemyTaps * 2);

        document.getElementById('hp-right').style.width = Math.max(0, enemyHP) + "%";
        document.getElementById('hp-left').style.width = Math.max(0, myHP) + "%";

        // Tovuqlar harakati
        document.getElementById('chicken-left').style.left = (5 + myTaps/2) + "%";
        document.getElementById('chicken-right').style.right = (5 + enemyTaps/2) + "%";

        if ((myHP <= 0 || enemyHP <= 0) && battleActive) {
            battleActive = false;
            finishBattle(myHP > enemyHP);
        }
    });
}

async function finishBattle(isWinner) {
    statusText.innerText = isWinner ? "YOU WON! 🏆" : "YOU LOST! 💀";
    instruction.style.display = 'none';
    
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    const data = snap.val();
    let chickens = data.chickens_list || [];

    if (isWinner) {
        chickens.push({ id: Date.now(), created: Date.now(), source: 'battle' });
        tg.showAlert("Victory! You got a new chicken!");
    } else {
        chickens.pop();
        tg.showAlert("Defeat! You lost a chicken.");
    }

    await update(userRef, { chickens_list: chickens });
    if (role === "creator") await set(ref(db, 'active_battles/' + battleId), null);
    
    setTimeout(() => location.reload(), 3000);
}
