import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración de Firebase
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
// LÓGICA DEL MENÚ HAMBURGUESA
// =========================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// =========================================================
// 1. LÓGICA PÚBLICA (Para los visitantes)
// =========================================================

// A) Generar "El Club de los 10"
const carnetsContainer = document.getElementById('carnets-container');
if (carnetsContainer) {
    carnetsContainer.innerHTML = '';
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
    const root = document.documentElement;
    
    if (tema === 'light') {
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--text-main', '#0a0a0a');
        root.style.setProperty('--text-muted', '#4a5568');
        root.style.setProperty('--accent', '#e53e3e');
    } else if (tema === 'matchday') {
        root.style.setProperty('--bg-color', '#1a0505'); 
        root.style.setProperty('--text-main', '#ffffff');
        root.style.setProperty('--text-muted', '#e2e8f0');
        root.style.setProperty('--accent', '#ffcc00'); 
    } else { // Dark por defecto
        root.style.setProperty('--bg-color', '#0a0a0a');
        root.style.setProperty('--text-main', '#ffffff');
        root.style.setProperty('--text-muted', '#a0aec0');
        root.style.setProperty('--accent', '#e53e3e');
    }
}, (error) => {
    console.error("Error al sincronizar el tema desde Firebase:", error);
});

// C) Escuchar la Porra / Partido Actual
const partidoContainer = document.getElementById('partido-container');
if (partidoContainer) {
    onValue(ref(db, 'partido_actual'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            partidoContainer.innerHTML = `
                <div style="color: #a0aec0; font-size: 1rem; margin-bottom: 10px; text-transform: uppercase;">COMPETICIÓN: ${data.competicion || 'La Liga'}</div>
                <span style="color: var(--text-main); font-size: 1.8rem;">${data.equipoLocal}</span> 
                <span style="color: var(--accent); margin: 0 15px; font-size: 2rem; font-weight: bold;">VS</span> 
                <span style="color: var(--text-main); font-size: 1.8rem;">${data.equipoVisitante}</span>
                <div style="font-size: 1rem; color: #a0aec0; margin-top: 15px; font-weight: normal;">
                    ¡Vota el resultado en WhatsApp y participa en la porra!
                </div>
            `;
        } else {
            partidoContainer.innerHTML = "<p>Preparando el próximo encuentro...</p>";
        }
    }, (error) => {
        console.error("Error al cargar el partido:", error);
        partidoContainer.innerHTML = "<p>No se pudo conectar con las porras en este momento.</p>";
    });
}

// D) Escuchar las Noticias
const newsContainer = document.getElementById('news-container');
if (newsContainer) {
    onValue(ref(db, 'noticias'), (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
            newsContainer.innerHTML = '';
            Object.keys(data).reverse().forEach((key) => {
                const noticia = data[key];
                newsContainer.innerHTML += `
                    <div class="news-card">
                        <div class="news-content">
                            <span style="color: var(--accent); font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${noticia.categoria || 'Actualidad'}</span>
                            <h3 class="news-title" style="margin: 8px 0;">${noticia.titulo}</h3>
                            <p class="news-desc">${noticia.resumen}</p>
                            <a href="URL_DE_TU_WHATSAPP" target="_blank" class="btn-read">Opinar en la comunidad &rarr;</a>
                        </div>
                    </div>
                `;
            });
        } else {
            newsContainer.innerHTML = '<p class="loading-text">No hay noticias publicadas aún.</p>';
        }
    }, (error) => {
        console.error("Error al cargar noticias:", error);
        newsContainer.innerHTML = '<p class="loading-text">Error al cargar las noticias. Revisa las reglas de Firebase.</p>';
    });
}

// =========================================================
// 2. LÓGICA DE ADMINISTRACIÓN (Solo ejecutada en admin.html)
// =========================================================

// A) Cambiar Tema
const btnDark = document.getElementById('btn-tema-oscuro');
const btnLight = document.getElementById('btn-tema-claro');
const btnMatch = document.getElementById('btn-tema-match');

if (btnDark) btnDark.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'dark'));
if (btnLight) btnLight.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'light'));
if (btnMatch) btnMatch.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'matchday'));

// B) Conexión a la API de API-Football
const btnFetchApi = document.getElementById('btn-fetch-api');
if (btnFetchApi) {
    btnFetchApi.addEventListener('click', async () => {
        const contenedor = document.getElementById('lista-partidos-api');
        if (!contenedor) return;

        contenedor.innerHTML = "Consultando partidos...";

        const apiKey = '894e5d37c2e991638f73695972b9b890';
        const URL = 'https://v3.football.api-sports.io/fixtures?league=140&season=2025&next=5';
        
        const opciones = {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey,
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
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
                    div.style.cssText = "background: #111; padding: 12px; margin-bottom: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; color: white; border: 1px solid #333;";
                    div.innerHTML = `
                        <span><strong>${local}</strong> vs <strong>${visitante}</strong></span>
                        <button class="btn-seleccionar-porra" style="background: var(--accent, #e53e3e); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;" 
                                data-local="${local}" data-visitante="${visitante}">
                            Publicar Porra
                        </button>
                    `;
                    contenedor.appendChild(div);
                });

                // Asignar evento a cada botón
                contenedor.querySelectorAll('.btn-seleccionar-porra').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const targetBtn = e.currentTarget;
                        const l = targetBtn.getAttribute('data-local');
                        const v = targetBtn.getAttribute('data-visitante');
                        
                        set(ref(db, 'partido_actual'), {
                            competicion: "La Liga",
                            equipoLocal: l,
                            equipoVisitante: v,
                            estado: "abierto"
                        }).then(() => {
                            alert(`¡Partido ${l} vs ${v} publicado en la porra!`);
                        }).catch(err => {
                            alert('Error al publicar en Firebase: ' + err.message);
                        });
                    });
                });
            } else {
                contenedor.innerHTML = "<p>No se encontraron partidos próximos en la API.</p>";
            }

        } catch (error) {
            contenedor.innerHTML = "<p style='color: #e53e3e;'>Error al conectar con la API de fútbol.</p>";
            console.error("Error API Football:", error);
        }
    });
}

// C) Publicar Novedades / Noticias
const btnPublicarNews = document.getElementById('btn-publicar-news');
if (btnPublicarNews) {
    btnPublicarNews.addEventListener('click', () => {
        const catElem = document.getElementById('news-cat');
        const titleElem = document.getElementById('news-title');
        const descElem = document.getElementById('news-desc');

        const categoria = catElem ? catElem.value : 'Actualidad';
        const titulo = titleElem ? titleElem.value.trim() : '';
        const desc = descElem ? descElem.value.trim() : '';

        if (titulo && desc) {
            push(ref(db, 'noticias'), {
                categoria: categoria || 'Actualidad',
                titulo: titulo,
                resumen: desc,
                fecha: new Date().toISOString()
            }).then(() => {
                alert('¡Novedad publicada en la web!');
                if (titleElem) titleElem.value = '';
                if (descElem) descElem.value = '';
            }).catch(err => {
                alert('Error al publicar noticia: ' + err.message);
            });
        } else {
            alert('Por favor, rellenar el título y la descripción.');
        }
    });
}
