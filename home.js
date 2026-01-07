import { getUserData, db, ref, onValue } from './auth.js';

async function startApp() {
    const user = await getUserData();
    
    // UI elementlarni bazadan kelgan ma'lumotga qarab yangilash
    const userRef = ref(db, 'users/' + user.id);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(7);
            document.getElementById('user-display-name').innerText = data.name;
            
            // Faqat bazada 'role' admin bo'lsa tugma chiqadi
            if (data.role === "admin") {
                document.getElementById('admin-area').innerHTML = `
                    <a href="admin-deposit-withdraw.html" class="admin-link">
                        <i class="fa-solid fa-shield-check"></i>
                    </a>`;
            }
        }
    });
}
startApp();
