import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Tu configuración de Firebase
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

// =========================================================
// 1. LÓGICA PÚBLICA (Para los visitantes)
// =========================================================

// A) Generar "El Club de los 10" (Gestión visual de usuarios VIP)
const carnetsContainer = document.getElementById('carnets-container');
if (carnetsContainer) {
    carnetsContainer.innerHTML = ''; // Limpiar antes de pintar
    for (let i = 1; i <= 10; i++) {
        const isFirst = i === 1;
        const numeroStr = i.toString().padStart(3, '0');
        
        carnetsContainer.innerHTML += `
            <div class="carnet ${isFirst ? 'active' : 'locked'}">
                <div class="carnet-num">#${numeroStr}</div>
                <h3 style="margin-bottom: 10px;">${isFirst ? 'Hugo Bolívar' : '---'}</h3>
                <p style="font-size: 0.8rem; color: #888;">
                    ${isFirst ? 'Socio Fundador' : '🔒 Bloqueado. Participa para desbloquear.'}
                </p>
            </div>
        `;
    }
}

// B) Escuchar el Tema de la Web en tiempo real
const temaRef = ref(db, 'configuracion/tema_actual');
onValue(temaRef, (snapshot) => {
    const tema = snapshot.val();
    
    if (tema === 'light') {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-main', '#0a0a0a');
        document.documentElement.style.setProperty('--text-muted', '#4a5568');
    } else if (tema === 'matchday') {
        document.documentElement.style.setProperty('--bg-color', '#1a0505'); 
        document.documentElement.style.setProperty('--accent', '#ffcc00'); 
    } else { // Dark por defecto
        document.documentElement.style.setProperty('--bg-color', '#0a0a0a');
        document.documentElement.style.setProperty('--text-main', '#ffffff');
        document.documentElement.style.setProperty('--text-muted', '#a0aec0');
        document.documentElement.style.setProperty('--accent', '#e53e3e');
    }
});

// C) Escuchar la Porra / Partido Actual
const partidoContainer = document.getElementById('partido-container');
if (partidoContainer) {
    onValue(ref(db, 'partido_actual'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            partidoContainer.innerHTML = `
                <div style="color: #a0aec0; font-size: 1rem; margin-bottom: 10px;">COMPETICIÓN: ${data.competicion}</div>
                <span style="color: white;">${data.equipoLocal}</span> 
                <span style="color: var(--accent); margin: 0 15px;">VS</span> 
                <span style="color: white;">${data.equipoVisitante}</span>
                <div style="font-size: 1rem; color: #a0aec0; margin-top: 15px; font-weight: normal;">
                    ¡Vota el resultado en WhatsApp y participa en la porra!
                </div>
            `;
        } else {
            partidoContainer.innerHTML = "<p>Preparando el próximo encuentro...</p>";
        }
    });
}

// D) Escuchar las Noticias
const newsContainer = document.getElementById('news-container');
if (newsContainer) {
    onValue(ref(db, 'noticias'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            newsContainer.innerHTML = '';
            Object.keys(data).reverse().forEach((key) => { // .reverse() para mostrar las más nuevas primero
                const noticia = data[key];
                newsContainer.innerHTML += `
                    <div class="news-card">
                        <div class="news-content">
                            <span style="color: var(--accent); font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${noticia.categoria}</span>
                            <h3 class="news-title">${noticia.titulo}</h3>
                            <p class="news-desc">${noticia.resumen}</p>
                            <a href="URL_DE_TU_WHATSAPP" target="_blank" class="btn-read">Opinar en la comunidad &rarr;</a>
                        </div>
                    </div>
                `;
            });
        }
    });
}


// =========================================================
// 2. LÓGICA DE ADMINISTRACIÓN (Solo funcionará donde existan los botones)
// =========================================================

// A) Cambiar Tema
const btnDark = document.getElementById('btn-tema-oscuro');
const btnLight = document.getElementById('btn-tema-claro');
const btnMatch = document.getElementById('btn-tema-match');

if (btnDark) btnDark.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'dark'));
if (btnLight) btnLight.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'light'));
if (btnMatch) btnMatch.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'matchday'));

// B) Conexión a la API de API-Football (RapidAPI)
const btnFetchApi = document.getElementById('btn-fetch-api');
if (btnFetchApi) {
    btnFetchApi.addEventListener('click', async () => {
        const contenedor = document.getElementById('lista-partidos-api');
        contenedor.innerHTML = "Consultando a la API...";

        // Configuración de API-Football. 
        // ID de liga 140 = La Liga España. ID 2 = Champions League.
        const URL = 'https://v3.football.api-sports.io/fixtures?league=140&season=2026&next=5';
        const opciones = {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': '894e5d37c2e991638f73695972b9b890' // <--- Pon aquí tu clave
            }
        };

        try {
            const response = await fetch(URL, opciones);
            const data = await response.json();
            
            contenedor.innerHTML = '';
            
            if (data.response && data.response.length > 0) {
                data.response.forEach(partido => {
                    const local = partido.teams.home.name;
                    const visitante = partido.teams.away.name;
                    
                    const div = document.createElement('div');
                    div.style = "background: #eee; padding: 10px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; color: black;";
                    div.innerHTML = `
                        <span><strong>${local}</strong> vs <strong>${visitante}</strong></span>
                        <button class="btn-seleccionar-porra" style="background: red; color: white; border: none; padding: 5px; cursor: pointer;" 
                                data-local="${local}" data-visitante="${visitante}">
                            Publicar Porra
                        </button>
                    `;
                    contenedor.appendChild(div);
                });

                // Añadir evento a los botones generados
                document.querySelectorAll('.btn-seleccionar-porra').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const l = e.target.getAttribute('data-local');
                        const v = e.target.getAttribute('data-visitante');
                        
                        set(ref(db, 'partido_actual'), {
                            competicion: "La Liga",
                            equipoLocal: l,
                            equipoVisitante: v,
                            estado: "abierto"
                        });
                        alert(`¡Partido ${l} vs ${v} publicado en la web!`);
                    });
                });
            } else {
                contenedor.innerHTML = "No se encontraron partidos.";
            }

        } catch (error) {
            contenedor.innerHTML = "Error al conectar con API-Football.";
            console.error(error);
        }
    });
}

// C) Publicar Novedades / Noticias
const btnPublicarNews = document.getElementById('btn-publicar-news');
if (btnPublicarNews) {
    btnPublicarNews.addEventListener('click', () => {
        const categoria = document.getElementById('news-cat').value;
        const titulo = document.getElementById('news-title').value;
        const desc = document.getElementById('news-desc').value;

        if(titulo && desc) {
            push(ref(db, 'noticias'), {
                categoria: categoria || 'Actualidad',
                titulo: titulo,
                resumen: desc,
                fecha: new Date().toISOString()
            });
            alert('Novedad publicada en la web');
            document.getElementById('news-title').value = '';
            document.getElementById('news-desc').value = '';
        } else {
            alert('Falta el título o la descripción.');
        }
    });
}

// --- LÓGICA DEL MENÚ HAMBURGUESA ---
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace (ideal para móviles)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}