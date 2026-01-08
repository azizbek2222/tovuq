import { db, ref, get, set, update } from './firebase.js';

const tg = window.Telegram.WebApp;
// Telegram orqali kirgan foydalanuvchi ID-si
const userId = tg.initDataUnsafe?.user?.id || "test_user";
// Taklif qilgan odamning ID-sini start_param orqali olamiz
const inviterId = tg.initDataUnsafe?.start_param;

async function initHome() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        // Foydalanuvchi bazada bor bo'lsa, faqat balansni yangilaymiz
        const data = snapshot.val();
        document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(5);
    } else {
        // Yangi foydalanuvchi ro'yxatdan o'tayotgan holat
        let initialBalance = 0.00000;
        let initialChickens = [{
            created: Date.now(),
            last_collected: Date.now()
        }];

        // REFERAL TEKSHIRISH
        if (inviterId && inviterId !== userId.toString()) {
            const inviterRef = ref(db, 'users/' + inviterId);
            const inviterSnapshot = await get(inviterRef);

            if (inviterSnapshot.exists()) {
                const inviterData = inviterSnapshot.val();
                
                // Taklif qilgan odamning balansini va referallar sonini yangilaymiz
                await update(inviterRef, {
                    balance: (parseFloat(inviterData.balance) || 0) + 0.00005,
                    referrals_count: (inviterData.referrals_count || 0) + 1
                });
                
                console.log("Referal mukofoti inviterga berildi:", inviterId);
            }
        }

        // Yangi foydalanuvchi ma'lumotlarini saqlash
        const newData = { 
            balance: initialBalance, 
            chickens_list: initialChickens,
            referrals_count: 0,
            created_at: Date.now()
        };
        
        await set(userRef, newData);
        document.getElementById('balance').innerText = initialBalance.toFixed(5);
    }
}

// Havola va kontekst menyuni bloklash (Xavfsizlik uchun)
function protectApp() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());
}

// Ilovani ishga tushirish
protectApp();
initHome();
tg.expand();
