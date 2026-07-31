import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, push, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// ==========================================
// 1. ARREGLO DEFINITIVO DEL MENÚ HAMBURGUESA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
});

// ==========================================
// 2. SISTEMA DE TRACKING (Métricas)
// ==========================================
// Contar visita solo si estamos en el index (si existe el contenedor de noticias)
if (document.getElementById('news-container')) {
    const visitasRef = ref(db, 'estadisticas/visitas');
    get(visitasRef).then((snapshot) => {
        let visitasActuales = snapshot.val() || 0;
        set(visitasRef, visitasActuales + 1);
    });
}

// Contar clics al botón de WhatsApp
document.querySelectorAll('.track-wa').forEach(boton => {
    boton.addEventListener('click', () => {
        const clicksRef = ref(db, 'estadisticas/clicks');
        get(clicksRef).then((snapshot) => {
            let clicksActuales = snapshot.val() || 0;
            set(clicksRef, clicksActuales + 1);
        });
    });
});

// ==========================================
// 3. CARGA DE DATOS PÚBLICOS
// ==========================================
// A) Carnets VIP
const carnetsContainer = document.getElementById('carnets-container');
if (carnetsContainer) {
    carnetsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const isFirst = i === 1;
        carnetsContainer.innerHTML += `
            <div class="carnet ${isFirst ? 'active' : 'locked'}">
                <div class="carnet-num">#${i.toString().padStart(3, '0')}</div>
                <h3 style="margin-bottom: 5px; font-size:1.1rem;">${isFirst ? 'Hugo Bolívar' : '---'}</h3>
            </div>
        `;
    }
}

// B) Tema Dinámico
onValue(ref(db, 'configuracion/tema_actual'), (snapshot) => {
    const tema = snapshot.val();
    const root = document.documentElement;
    if (tema === 'light') {
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--text-main', '#0a0a0a');
        root.style.setProperty('--text-muted', '#4a5568');
        root.style.setProperty('--panel-bg', '#f5f5f5');
    } else if (tema === 'matchday') {
        root.style.setProperty('--bg-color', '#1a0505'); 
        root.style.setProperty('--accent', '#ffcc00'); 
        root.style.setProperty('--panel-bg', '#2a0a0a');
    } else {
        root.style.setProperty('--bg-color', '#0a0a0a');
        root.style.setProperty('--text-main', '#ffffff');
        root.style.setProperty('--text-muted', '#a0aec0');
        root.style.setProperty('--panel-bg', '#111111');
        root.style.setProperty('--accent', '#e53e3e');
    }
});

// C) Partido Actual
const partidoContainer = document.getElementById('partido-container');
if (partidoContainer) {
    onValue(ref(db, 'partido_actual'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            partidoContainer.innerHTML = `
                <div style="color: #a0aec0; font-size: 0.9rem; margin-bottom: 10px;">${data.competicion || 'LA LIGA'}</div>
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoLocal}</span> 
                <span style="color: var(--accent); margin: 0 10px; font-size: 1.5rem;">VS</span> 
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoVisitante}</span>
            `;
        }
    });
}

// D) Noticias / Debates
const newsContainer = document.getElementById('news-container');
if (newsContainer) {
    onValue(ref(db, 'noticias'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            newsContainer.innerHTML = '';
            Object.keys(data).reverse().forEach((key) => {
                const n = data[key];
                newsContainer.innerHTML += `
                    <div class="news-card">
                        <span class="news-cat">${n.categoria}</span>
                        <h3>${n.titulo}</h3>
                        <p>${n.resumen}</p>
                        <a href="URL_DE_TU_WHATSAPP" target="_blank" class="btn-action track-wa">Responder en el grupo</a>
                    </div>
                `;
            });
        }
    });
}

// ==========================================
// 4. LÓGICA DEL PANEL DE ADMINISTRADOR
// ==========================================

// Guardar seguidores manuales
const btnGuardarSeguidores = document.getElementById('btn-guardar-seguidores');
if (btnGuardarSeguidores) {
    btnGuardarSeguidores.addEventListener('click', () => {
        const num = document.getElementById('input-seguidores').value;
        if(num) set(ref(db, 'estadisticas/seguidores'), Number(num));
    });
}

// Leer métricas y hacer los cálculos en tiempo real
const statsCard = document.getElementById('admin-visitas');
if (statsCard) {
    onValue(ref(db, 'estadisticas'), (snapshot) => {
        const stats = snapshot.val() || {};
        const visitas = stats.visitas || 0;
        const clicks = stats.clicks || 0;
        const seguidores = stats.seguidores || 0;

        document.getElementById('admin-visitas').innerText = visitas;
        document.getElementById('admin-clicks').innerText = clicks;
        if(document.getElementById('input-seguidores').value === '') {
            document.getElementById('input-seguidores').value = seguidores;
        }

        // --- LAS MATEMÁTICAS CLAVE ---
        // 1. ¿Cuánta gente que entra a la web le da al botón? (Conversión Web)
        let convWeb = visitas > 0 ? ((clicks / visitas) * 100).toFixed(1) : 0;
        
        // 2. ¿Cuántos de los que pinchan el botón de verdad se quedan en WhatsApp? (Efectividad)
        let efectividad = clicks > 0 ? ((seguidores / clicks) * 100).toFixed(1) : 0;
        // Ojo: Si ya tenías seguidores antes de la web, la efectividad puede dar más del 100%, 
        // pero sirve para ver la relación clics/crecimiento.

        document.getElementById('calc-conversion').innerHTML = 
            `<strong>Porcentaje de clics:</strong> De cada 100 visitas, <strong>${convWeb}%</strong> pulsa el botón de WhatsApp.`;
            
        document.getElementById('calc-efectividad').innerHTML = 
            `<strong>Ratio Seguidores/Clics:</strong> Equivale al <strong>${efectividad}%</strong> de los clics (te ayuda a saber si pinchan pero luego no se unen).`;
    });
}

// Resto de la lógica Admin (Tema, API, Novedades) que ya tenías
const btnFetchApi = document.getElementById('btn-fetch-api');
if (btnFetchApi) {
    btnFetchApi.addEventListener('click', async () => {
        const contenedor = document.getElementById('lista-partidos-api');
        contenedor.innerHTML = "Buscando...";
        try {
            const resp = await fetch('https://v3.football.api-sports.io/fixtures?league=140&season=2025&next=5', {
                method: 'GET',
                headers: { 'x-apisports-key': '894e5d37c2e991638f73695972b9b890' }
            });
            const data = await resp.json();
            contenedor.innerHTML = '';
            data.response.forEach(p => {
                const l = p.teams.home.name; const v = p.teams.away.name;
                const div = document.createElement('div');
                div.style.cssText = "background: #222; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between;";
                div.innerHTML = `<span>${l} vs ${v}</span> <button class="btn-poner-porra" data-l="${l}" data-v="${v}">Poner</button>`;
                contenedor.appendChild(div);
            });
            contenedor.querySelectorAll('.btn-poner-porra').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    set(ref(db, 'partido_actual'), { 
                        equipoLocal: e.currentTarget.getAttribute('data-l'), 
                        equipoVisitante: e.currentTarget.getAttribute('data-v') 
                    });
                    alert("Porra actualizada");
                });
            });
        } catch (e) { contenedor.innerHTML = "Error al conectar con la API."; }
    });
}

const btnPublicarNews = document.getElementById('btn-publicar-news');
if (btnPublicarNews) {
    btnPublicarNews.addEventListener('click', () => {
        const t = document.getElementById('news-title').value;
        const d = document.getElementById('news-desc').value;
        if(t && d) {
            push(ref(db, 'noticias'), {
                categoria: document.getElementById('news-cat').value || 'DEBATE',
                titulo: t, resumen: d
            }).then(() => { alert("Publicado!"); });
        }
    });
}

document.getElementById('btn-tema-oscuro')?.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'dark'));
document.getElementById('btn-tema-claro')?.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'light'));
document.getElementById('btn-tema-match')?.addEventListener('click', () => set(ref(db, 'configuracion/tema_actual'), 'matchday'));
