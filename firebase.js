// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const db = getDatabase(app);

// Ma'lumotlarni olish va saqlash funksiyalarini eksport qilamiz
export { db, ref, get, update, set };
