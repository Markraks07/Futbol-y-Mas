import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, push, get, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// 1. MENU Y METRICAS
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', (e) => { e.preventDefault(); navLinks.classList.toggle('active'); });
        navLinks.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => navLinks.classList.remove('active')); });
    }
});

if (document.getElementById('news-container')) {
    const visitasRef = ref(db, 'estadisticas/visitas');
    get(visitasRef).then((snapshot) => set(visitasRef, (snapshot.val() || 0) + 1));
}
document.querySelectorAll('.track-wa').forEach(boton => {
    boton.addEventListener('click', () => {
        const clicksRef = ref(db, 'estadisticas/clicks');
        get(clicksRef).then((snapshot) => set(clicksRef, (snapshot.val() || 0) + 1));
    });
});

// 2. ALERTAS (BANNER GLOBAL)
const alertBanner = document.getElementById('alert-banner');
if(alertBanner) {
    onValue(ref(db, 'configuracion/alerta'), (snapshot) => {
        const al = snapshot.val();
        if(al && al.activa) {
            alertBanner.style.display = 'block';
            document.getElementById('alert-banner-text').innerText = al.texto;
            alertBanner.href = al.link || '#';
            if(!al.link) alertBanner.removeAttribute('target');
        } else {
            alertBanner.style.display = 'none';
        }
    });
}

// 3. CARGA DE DATOS PÚBLICOS
// A) Carnets VIP (Socios reales desde Firebase)
const carnetsContainer = document.getElementById('carnets-container');
if (carnetsContainer) {
    onValue(ref(db, 'socios'), (snapshot) => {
        carnetsContainer.innerHTML = '';
        const socios = snapshot.val() || {};
        for (let i = 1; i <= 10; i++) {
            const s = socios[i] || { nombre: '---', status: 'locked' };
            const isActive = s.status === 'active';
            carnetsContainer.innerHTML += `
                <div class="carnet ${isActive ? 'active' : 'locked'}">
                    <div class="carnet-num">#${i.toString().padStart(3, '0')}</div>
                    <h3 style="margin-bottom: 5px; font-size:1.1rem; color: var(--text-main);">${s.nombre}</h3>
                </div>
            `;
        }
    });
}

// B) Motor de Temas y Auto-Tema
onValue(ref(db, 'configuracion/tema_actual'), (snapshot) => {
    const tema = snapshot.val() || 'dark';
    const root = document.documentElement;
    
    // Resetear a modo oscuro siempre primero
    root.style.setProperty('--bg-color', '#0a0a0a');
    root.style.setProperty('--text-main', '#ffffff');
    root.style.setProperty('--text-muted', '#a0aec0');
    root.style.setProperty('--panel-bg', '#111111');
    root.style.setProperty('--card-bg', '#000000');
    root.style.setProperty('--card-border', '#222222');
    root.style.setProperty('--nav-bg', '#0a0a0a');
    root.style.setProperty('--accent', '#e53e3e');

    if (tema === 'light') {
        root.style.setProperty('--bg-color', '#f0f2f5');
        root.style.setProperty('--text-main', '#1a1a1a');
        root.style.setProperty('--text-muted', '#4a5568');
        root.style.setProperty('--panel-bg', '#ffffff');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--card-border', '#cbd5e0');
        root.style.setProperty('--nav-bg', '#ffffff');
    } 
    else if (tema === 'matchday') {
        root.style.setProperty('--bg-color', '#1a0505'); 
        root.style.setProperty('--panel-bg', '#2a0a0a');
        root.style.setProperty('--card-bg', '#1c0707');
        root.style.setProperty('--accent', '#ffcc00'); 
    }
    else if (tema === 'champions') {
        root.style.setProperty('--bg-color', '#000c24'); 
        root.style.setProperty('--panel-bg', '#00163b');
        root.style.setProperty('--card-bg', '#001f4d');
        root.style.setProperty('--card-border', '#003366');
        root.style.setProperty('--accent', '#00ccff'); 
    }
    else if (tema === 'mundial') {
        root.style.setProperty('--bg-color', '#240000'); 
        root.style.setProperty('--panel-bg', '#3b0000');
        root.style.setProperty('--card-bg', '#4d0000');
        root.style.setProperty('--card-border', '#660000');
        root.style.setProperty('--accent', '#ecc94b'); 
    }
});

// C) Partido Actual
const partidoContainer = document.getElementById('partido-container');
if (partidoContainer) {
    onValue(ref(db, 'partido_actual'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            partidoContainer.innerHTML = `
                <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase;">${data.competicion || 'AMISTOSO'}</div>
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoLocal}</span> 
                <span style="color: var(--accent); margin: 0 10px; font-size: 1.5rem;">VS</span> 
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoVisitante}</span>
            `;
        }
    });
}

// D) Noticias
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
                        <a href="URL_DE_TU_WHATSAPP" target="_blank" class="btn-action track-wa">Opinar en el grupo</a>
                    </div>
                `;
            });
        }
    });
}

// 4. LÓGICA EXCLUSIVA DEL ADMIN
// Alertas
document.getElementById('btn-publicar-alerta')?.addEventListener('click', () => {
    const texto = document.getElementById('alert-text').value;
    const link = document.getElementById('alert-link').value;
    if(texto) set(ref(db, 'configuracion/alerta'), { activa: true, texto, link });
});
document.getElementById('btn-quitar-alerta')?.addEventListener('click', () => {
    set(ref(db, 'configuracion/alerta/activa'), false);
});

// Guardar Socios
document.getElementById('btn-guardar-socio')?.addEventListener('click', () => {
    const num = document.getElementById('socio-num').value;
    const nombre = document.getElementById('socio-name').value;
    const status = document.getElementById('socio-status').value;
    if(num >= 1 && num <= 10 && nombre) {
        set(ref(db, 'socios/' + num), { nombre, status });
        alert(`Socio #${num} guardado correctamente.`);
        document.getElementById('socio-name').value = '';
    }
});

// Calculadora
const statsCard = document.getElementById('admin-visitas');
if (statsCard) {
    onValue(ref(db, 'estadisticas'), (snapshot) => {
        const stats = snapshot.val() || {};
        document.getElementById('admin-visitas').innerText = stats.visitas || 0;
        document.getElementById('admin-clicks').innerText = stats.clicks || 0;
        let conv = stats.visitas > 0 ? ((stats.clicks / stats.visitas) * 100).toFixed(1) : 0;
        document.getElementById('calc-conversion').innerHTML = `<strong>Conversión:</strong> ${conv}% tocan el botón WA.`;
    });
    document.getElementById('btn-guardar-seguidores').addEventListener('click', () => {
        const s = document.getElementById('input-seguidores').value;
        if(s) set(ref(db, 'estadisticas/seguidores'), Number(s));
    });
}

// Lógica de Temas (Botones)
const changeTheme = (themeName, isAuto) => {
    set(ref(db, 'configuracion/tema_actual'), themeName);
    set(ref(db, 'configuracion/tema_auto'), isAuto);
};
document.getElementById('btn-tema-oscuro')?.addEventListener('click', () => changeTheme('dark', false));
document.getElementById('btn-tema-claro')?.addEventListener('click', () => changeTheme('light', false));
document.getElementById('btn-tema-match')?.addEventListener('click', () => changeTheme('matchday', false));
document.getElementById('btn-tema-champions')?.addEventListener('click', () => changeTheme('champions', false));
document.getElementById('btn-tema-mundial')?.addEventListener('click', () => changeTheme('mundial', false));
document.getElementById('btn-tema-auto')?.addEventListener('click', () => {
    alert("Modo Automático activado. Se elegirá el tema en base al partido de la API.");
    // Chequear al instante
    get(ref(db, 'partido_actual')).then(snap => {
        const data = snap.val();
        if(data && data.competicion) checkAndSetAutoTheme(data.competicion);
    });
});

// Función central para leer qué competición es y asignar tema
function checkAndSetAutoTheme(competicionNombre) {
    set(ref(db, 'configuracion/tema_auto'), true);
    const comp = competicionNombre.toLowerCase();
    let newTheme = 'matchday'; // por defecto si hay partido
    
    if (comp.includes('champions') || comp.includes('uefa')) {
        newTheme = 'champions';
    } else if (comp.includes('world cup') || comp.includes('mundial') || comp.includes('euro')) {
        newTheme = 'mundial';
    }
    
    set(ref(db, 'configuracion/tema_actual'), newTheme);
}

// API y seteo de partido
const btnFetchApi = document.getElementById('btn-fetch-api');
if (btnFetchApi) {
    btnFetchApi.addEventListener('click', async () => {
        const contenedor = document.getElementById('lista-partidos-api');
        contenedor.innerHTML = "Cargando...";
        try {
            const resp = await fetch('https://v3.football.api-sports.io/fixtures?league=140&season=2025&next=5', {
                method: 'GET',
                headers: { 'x-apisports-key': '894e5d37c2e991638f73695972b9b890' }
            });
            const data = await resp.json();
            contenedor.innerHTML = '';
            data.response.forEach(p => {
                const l = p.teams.home.name; const v = p.teams.away.name; const comp = p.league.name;
                const div = document.createElement('div');
                div.style.cssText = "background: #222; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between;";
                div.innerHTML = `<span>${l} vs ${v} <small style="color:#aaa;">(${comp})</small></span> <button class="btn-poner-porra" data-l="${l}" data-v="${v}" data-c="${comp}">Poner</button>`;
                contenedor.appendChild(div);
            });
            contenedor.querySelectorAll('.btn-poner-porra').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const compNombre = e.currentTarget.getAttribute('data-c');
                    set(ref(db, 'partido_actual'), { 
                        equipoLocal: e.currentTarget.getAttribute('data-l'), 
                        equipoVisitante: e.currentTarget.getAttribute('data-v'),
                        competicion: compNombre
                    });
                    
                    // Si el auto-tema está activado, comprobamos la competición
                    get(ref(db, 'configuracion/tema_auto')).then(snap => {
                        if(snap.val() === true) checkAndSetAutoTheme(compNombre);
                    });
                    
                    alert("Porra y partido actualizado en la web.");
                });
            });
        } catch (e) { contenedor.innerHTML = "Error al conectar con la API."; }
    });
}

document.getElementById('btn-publicar-news')?.addEventListener('click', () => {
    const t = document.getElementById('news-title').value;
    const d = document.getElementById('news-desc').value;
    if(t && d) {
        push(ref(db, 'noticias'), {
            categoria: document.getElementById('news-cat').value || 'NOVEDAD',
            titulo: t, resumen: d
        }).then(() => { 
            alert("Noticia publicada!");
            document.getElementById('news-title').value = '';
            document.getElementById('news-desc').value = '';
        });
    }
});
