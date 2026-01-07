import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBAZ9Edi3Rh5qWf-AYesrQS6P2U51tvBs",
    authDomain: "coco-49573.firebaseapp.com",
    projectId: "coco-49573",
    databaseURL: "https://coco-49573-default-rtdb.firebaseio.com",
    storageBucket: "coco-49573.firebasestorage.app",
    messagingSenderId: "771160329024",
    appId: "1:771160329024:web:9bceae5db86b158ca388a5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Balansni yangilash
                document.getElementById('balance').innerText = parseFloat(data.balance || 0).toFixed(7);
                
                // Tovuqlar sonini yangilash
                const chickenCount = data.chickens || 0;
                document.getElementById('chicken-count').innerText = chickenCount;
                
                // Tuxumlar (yig'ilmagan)
                document.getElementById('uncollected-eggs').innerText = data.uncollectedEggs || 0;

                // Tovuqlarni vizual ko'rsatish
                renderChickens(chickenCount);
            }
        });

        // Hammasini yig'ish tugmasi
        document.getElementById('btn-collect-all').onclick = async () => {
            const snapshot = await update(userRef, {
                // Bu yerda mantiq: yig'ilmagan tuxumlarni asosiy tuxumlar safiga o'tkazish
                // Hozircha oddiy alert
            });
            alert("Barcha tuxumlar savatchaga yig'ildi!");
        };
    } else {
        window.location.href = "login.html";
    }
});

function renderChickens(count) {
    const grid = document.getElementById('farm-grid');
    grid.innerHTML = ""; // Tozalash

    if (count === 0) {
        grid.innerHTML = "<p style='grid-column: 1/4;'>Sizda hali tovuqlar yo'q. Bozorga o'ting!</p>";
        return;
    }

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'chicken-item';
        div.innerHTML = `
            <i class="fa-solid fa-kiwi-bird"></i>
            <small>Tovuq #${i + 1}</small>
        `;
        grid.appendChild(div);
    }
}
