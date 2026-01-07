import { getUserBalance, updateBalanceInDB } from './firebase-config.js';

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const balanceEl = document.getElementById('balance');
const resultText = document.getElementById('result-text');

const rewards = [
    "0.0001", "0.000005", "0.00005", "0.0005", 
    "0.0001", "0.000005", "0.00005", "0.0005"
];

let currentRotation = 0;

async function init() {
    const bal = await getUserBalance();
    // null yoki NaN emasligini tekshirish
    if (bal !== null && !isNaN(bal)) {
        balanceEl.innerText = bal.toFixed(6);
    } else {
        balanceEl.innerText = "0.000000";
    }
}

spinBtn.addEventListener('click', async () => {
    spinBtn.disabled = true;
    resultText.innerText = "Omad kutilmoqda...";

    const randomDeg = Math.floor(Math.random() * 360);
    const totalSpin = 1800 + randomDeg; 
    currentRotation += totalSpin;
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(async () => {
        const actualDeg = currentRotation % 360;
        const winningAngle = (360 - actualDeg) % 360;
        const sectorIndex = Math.floor(winningAngle / 45);
        const winAmount = parseFloat(rewards[sectorIndex]);

        let currentBal = await getUserBalance();
        // Hisob-kitob qilishdan oldin son ekanligiga ishonch hosil qilish
        if (isNaN(currentBal)) currentBal = 0;
        
        const newBal = (currentBal + winAmount).toFixed(6);
        
        await updateBalanceInDB(newBal);
        
        balanceEl.innerText = newBal;
        resultText.innerText = `Yutuq: +${winAmount.toFixed(6)} USDT`;
        spinBtn.disabled = false;
    }, 4000);
});

init();
