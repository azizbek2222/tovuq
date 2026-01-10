import { db, ref, get, update, set } from './firebase.js';
import { onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id || "test_user";

// Elementlarni olish
const balanceEl = document.getElementById('balance');
const statusText = document.getElementById('status-text');
const actionBtns = document.getElementById('action-btns');
const hpSection = document.getElementById('hp-section');
const arena = document.getElementById('arena');
const instruction = document.getElementById('instruction');
const tapZone = document.getElementById('tap-zone');

let battleId = null;
let role = ""; 
let isBattleRunning = false;

// 1. Balansni real vaqtda yuklash (onValue orqali)
const userRef = ref(db, 'users/' + userId);
onValue(userRef, (snap) => {
    if (snap.exists()) {
        const userData = snap.val();
        balanceEl.innerText = parseFloat(userData.balance || 0).toFixed(5);
    }
});

// 2. Tovuq borligini tekshirish
async function checkChickens() {
    const snap = await get(userRef);
    const data = snap.val();
    if (!data?.chickens_list || data.chickens_list.length < 1) {
        tg.showAlert("❌ No chickens! Buy one in the Market first.");
        return false;
    }
    return true;
}

// 3. Jang yaratish
document.getElementById('createBattleBtn').onclick = async () => {
    if (!(await checkChickens())) return;

    role = "creator";
    battleId = userId.toString();
    actionBtns.style.display = 'none';
    statusText.innerText = "WAITING FOR RIVAL...";

    await set(ref(db, 'active_battles/' + battleId), {
        creator: userId,
        status: 'waiting',
        creatorTap: 0,
        opponentTap: 0
    });

    // Raqib kelishini kutish
    const bRef = ref(db, 'active_battles/' + battleId);
    onValue(bRef, (snap) => {
        const bData = snap.val();
        if (bData?.status === 'fighting' && !isBattleRunning) {
            startBattleProcess(bData);
        }
    });
};

// 4. Jangga qo'shilish
document.getElementById('randomBattleBtn').onclick = async () => {
    if (!(await checkChickens())) return;

    const battlesSnap = await get(ref(db, 'active_battles'));
    const allBattles = battlesSnap.val();
    
    let foundId = null;
    if (allBattles) {
        foundId = Object.keys(allBattles).find(id => allBattles[id].status === 'waiting' && id !== userId.toString());
    }

    if (foundId) {
        role = "opponent";
        battleId = foundId;
        await update(ref(db, 'active_battles/' + battleId), {
            opponent: userId,
            status: 'fighting'
        });
        // Listener ulaymiz
        onValue(ref(db, 'active_battles/' + battleId), (snap) => {
            const bData = snap.val();
            if (bData?.status === 'fighting' && !isBattleRunning) {
                startBattleProcess(bData);
            }
        });
    } else {
        tg.showAlert("No rooms available. Create your own!");
    }
};

// 5. Jang jarayoni
function startBattleProcess() {
    isBattleRunning = true;
    arena.style.display = 'block';
    hpSection.style.display = 'flex';
    instruction.style.display = 'block';
    tapZone.style.display = 'block';
    statusText.innerText = "FIGHT!";

    // Tap urish
    tapZone.onclick = () => {
        if (!isBattleRunning) return;
        const tapKey = (role === "creator") ? 'creatorTap' : 'opponentTap';
        const currentBattleRef = ref(db, 'active_battles/' + battleId);
        
        get(currentBattleRef).then(snap => {
            const val = snap.val();
            if (val) {
                update(currentBattleRef, { [tapKey]: (val[tapKey] || 0) + 1 });
            }
        });
    };

    // HP va harakatlarni kuzatish
    onValue(ref(db, 'active_battles/' + battleId), (snap) => {
        const bData = snap.val();
        if (!bData || !isBattleRunning) return;

        const myTaps = (role === "creator") ? bData.creatorTap : bData.opponentTap;
        const rivalTaps = (role === "creator") ? bData.opponentTap : bData.creatorTap;

        const myHP = Math.max(0, 100 - (rivalTaps * 2.5)); // 40 ta tapda o'ladi
        const rivalHP = Math.max(0, 100 - (myTaps * 2.5));

        document.getElementById('hp-left').style.width = myHP + "%";
        document.getElementById('hp-right').style.width = rivalHP + "%";

        // Tovuqlarni markazga siljitish
        document.getElementById('chicken-left').style.left = (5 + myTaps/2) + "%";
        document.getElementById('chicken-right').style.right = (5 + rivalTaps/2) + "%";

        if (myHP <= 0 || rivalHP <= 0) {
            isBattleRunning = false;
            finishGame(myHP > 0);
        }
    });
}

async function finishGame(isWin) {
    tapZone.style.display = 'none';
    instruction.style.display = 'none';
    statusText.innerHTML = isWin ? "<h2 style='color:gold'>VICTORY! 🏆</h2>" : "<h2 style='color:red'>DEFEAT! 💀</h2>";

    const snap = await get(userRef);
    let chickens = snap.val().chickens_list || [];

    if (isWin) {
        chickens.push({ id: Date.now(), created: Date.now(), source: 'battle' });
        tg.showAlert("You won a new chicken!");
    } else {
        chickens.pop();
        tg.showAlert("You lost a chicken in battle!");
    }

    await update(userRef, { chickens_list: chickens });
    
    // Yaratuvchi xonani tozalaydi
    if (role === "creator") {
        setTimeout(() => set(ref(db, 'active_battles/' + battleId), null), 3000);
    }
    
    setTimeout(() => location.href = 'profile.html', 5000);
}
