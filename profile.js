import { getUserData } from './auth.js';

const tg = window.Telegram.WebApp;

async function loadProfile() {
    // Telegram ma'lumotlarini UI ga chiqarish
    const user = tg.initDataUnsafe?.user || { id: "000000", first_name: "Foydalanuvchi", photo_url: "" };
    
    document.getElementById('user-id').innerText = user.id;
    document.getElementById('user-full-name').innerText = user.first_name + (user.last_name ? " " + user.last_name : "");
    
    if (user.photo_url) {
        document.getElementById('user-photo').src = user.photo_url;
    } else {
        document.getElementById('user-photo').src = "https://ui-avatars.com/api/?name=" + user.first_name;
    }

    try {
        // auth.js orqali Firebasedagi ma'lumotlarni olish
        const userData = await getUserData();
        
        if (userData) {
            document.getElementById('p-balance').innerText = parseFloat(userData.balance || 0).toFixed(7) + " TON";
            document.getElementById('p-chickens').innerText = (userData.chickens || 0) + " dona";
        }
    } catch (error) {
        console.error("Profil ma'lumotlarini yuklashda xato:", error);
    }
}

// Telegram WebApp ni sozlash
tg.expand();
loadProfile();
