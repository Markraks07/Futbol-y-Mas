import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGxLmQDmohUivV1XxIsLIWAvDATLRROgE",
  authDomain: "fuego-en-la-isla.firebaseapp.com",
  databaseURL: "https://fuego-en-la-isla-default-rtdb.firebaseio.com",
  projectId: "fuego-en-la-isla",
  storageBucket: "fuego-en-la-isla.firebasestorage.app",
  messagingSenderId: "837575806373",
  appId: "1:837575806373:web:d823ec3986cfee375cec4c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// CARGAR SOCIOS
const grid = document.getElementById('grid-carnets');
const contador = document.getElementById('contador');

if(grid){
  const sociosRef = ref(db, 'socios');
  onValue(sociosRef, (snapshot) => {
    const data = snapshot.val();
    grid.innerHTML = '';
    let activos = 0;
    for (let i = 1; i <= 10; i++) {
      const numero = i.toString().padStart(3, '0');
      const socio = data? data[numero] : null;
      if (socio) {
        activos++;
        grid.innerHTML += `<div class="carnet"><div class="badge">#${numero}</div><img src="${socio.imagen}"><h3>${socio.nombre}</h3><p>${socio.privilegio || 'Socio Oficial'}</p></div>`;
      } else {
        grid.innerHTML += `<div class="carnet bloqueado"><div class="badge">#${numero}</div><img src="https://via.placeholder.com/300x200/222/888?text=CARNET+B/N"><h3>Por conseguir</h3><p>🔒</p></div>`;
      }
    }
    if(contador) contador.innerText = `${activos}/10`;
  });
}

// ADMIN
const form = document.getElementById('form-socio');
if(form){
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const num = document.getElementById('numero').value.padStart(3, '0');
    const nombre = document.getElementById('nombre').value;
    const imagen = document.getElementById('imagen').value;
    const privilegio = document.getElementById('privilegio').value;
    set(ref(db, 'socios/' + num), { nombre, imagen, privilegio });
    alert(`Socio #${num} guardado ✅`);
    form.reset();
  });
}