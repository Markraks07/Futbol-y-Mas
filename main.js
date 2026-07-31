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

document.addEventListener('click', (e) => {
    if (e.target.closest('.track-wa')) {
        const clicksRef = ref(db, 'estadisticas/clicks');
        get(clicksRef).then((snapshot) => set(clicksRef, (snapshot.val() || 0) + 1));
    }
});

// 2. ALERTAS (BANNER GLOBAL)
const alertBanner = document.getElementById('alert-banner');
if(alertBanner) {
    onValue(ref(db, 'configuracion/alerta'), (snapshot) => {
        const al = snapshot.val();
        if(al && al.activa) {
            alertBanner.style.display = 'block';
            const alertTextEl = document.getElementById('alert-banner-text');
            if(alertTextEl) alertTextEl.innerText = al.texto;
            alertBanner.href = al.link || '#';
            if(!al.link) alertBanner.removeAttribute('target');
        } else {
            alertBanner.style.display = 'none';
        }
    });
}

// 3. SOCIOS VIP
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

// 4. TEMAS
onValue(ref(db, 'configuracion/tema_actual'), (snapshot) => {
    const tema = snapshot.val() || 'dark';
    const root = document.documentElement;
    
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

// 5. ZONA INTERACTIVA (PARTIDOS / CUESTIONARIOS)
const partidoContainer = document.getElementById('partido-container');
const tituloInteractivo = document.getElementById('panel-interactivo-titulo');
if (partidoContainer) {
    onValue(ref(db, 'partido_actual'), (snapshot) => {
        const data = snapshot.val();
        if (data && data.equipoLocal) {
            if(tituloInteractivo) tituloInteractivo.innerText = "🔥 LA PORRA DE LA SEMANA";
            partidoContainer.innerHTML = `
                <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase;">${data.competicion || 'AMISTOSO'}</div>
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoLocal}</span> 
                <span style="color: var(--accent); margin: 0 10px; font-size: 1.5rem;">VS</span> 
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoVisitante}</span>
                <a href="URL_DE_TU_WHATSAPP" target="_blank" class="btn-action track-wa" style="margin-top:20px;">Dejar mi predicción en WhatsApp</a>
            `;
        } else {
            onValue(ref(db, 'cuestionario_activo'), (quizSnap) => {
                const qData = quizSnap.val();
                if (qData) {
                    if(tituloInteractivo) tituloInteractivo.innerText = "📝 CUESTIONARIO ACTIVO";
                    let opcionesHTML = '';
                    qData.opciones.forEach((opt, index) => {
                        if(opt) {
                            opcionesHTML += `<button class="btn-quiz-option" data-index="${index}">${opt}</button>`;
                        }
                    });
                    partidoContainer.innerHTML = `
                        <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--text-main);">${qData.pregunta}</h3>
                        <div class="quiz-options">${opcionesHTML}</div>
                        <div id="quiz-resultado" style="margin-top: 15px; font-size: 0.9rem; color: var(--gold);"></div>
                    `;

                    partidoContainer.querySelectorAll('.btn-quiz-option').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const idx = e.currentTarget.getAttribute('data-index');
                            const votoRef = ref(db, `cuestionario_activo/votos/${idx}`);
                            get(votoRef).then(vSnap => {
                                const actuales = vSnap.val() || 0;
                                set(votoRef, actuales + 1);
                                document.getElementById('quiz-resultado').innerText = "¡Voto registrado con éxito!";
                            });
                        });
                    });
                } else {
                    if(tituloInteractivo) tituloInteractivo.innerText = "🔥 ZONA DE PARTICIPACIÓN";
                    partidoContainer.innerHTML = `<p style="color: var(--text-muted);">No hay partidos ni encuestas activas ahora mismo.</p>`;
                }
            });
        }
    });
}

// 6. DEBATES CON COMENTARIOS OCULTOS ("VER COMENTARIOS")
const newsContainer = document.getElementById('news-container');
if (newsContainer) {
    onValue(ref(db, 'noticias'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            newsContainer.innerHTML = '';
            Object.keys(data).reverse().forEach((key) => {
                const n = data[key];
                
                let comentariosHTML = '';
                let totalComentarios = 0;
                if(n.comentarios) {
                    totalComentarios = Object.values(n.comentarios).length;
                    Object.values(n.comentarios).forEach(c => {
                        comentariosHTML += `<div class="comment-item"><strong>${c.autor}</strong> ${c.texto}</div>`;
                    });
                } else {
                    comentariosHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">Sé el primero en opinar.</div>`;
                }

                newsContainer.innerHTML += `
                    <div class="news-card" data-id="${key}">
                        <span class="news-cat">${n.categoria}</span>
                        <h3>${n.titulo}</h3>
                        <p>${n.resumen}</p>
                        
                        <button class="toggle-comments-btn" data-id="${key}">💬 Ver comentarios (${totalComentarios})</button>
                        
                        <div class="comments-dropdown" id="dropdown-${key}">
                            <div class="comments-list">${comentariosHTML}</div>
                            <div class="comment-form">
                                <input type="text" id="author-${key}" placeholder="Nombre">
                                <input type="text" id="text-${key}" placeholder="Opinión...">
                                <button class="btn-enviar-comentario" data-id="${key}">Enviar</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            newsContainer.querySelectorAll('.toggle-comments-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const dropdown = document.getElementById(`dropdown-${id}`);
                    dropdown.classList.toggle('active');
                });
            });

            newsContainer.querySelectorAll('.btn-enviar-comentario').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const autorInput = document.getElementById(`author-${id}`);
                    const textoInput = document.getElementById(`text-${id}`);
                    const autor = autorInput.value.trim();
                    const texto = textoInput.value.trim();

                    if(autor && texto) {
                        push(ref(db, `noticias/${id}/comentarios`), { autor, texto }).then(() => {
                            autorInput.value = '';
                            textoInput.value = '';
                        });
                    } else {
                        alert("Introduce tu nombre y un comentario.");
                    }
                });
            });
        } else {
            newsContainer.innerHTML = `<p class="loading-text">No hay debates publicados.</p>`;
        }
    });
}

// 7. PANEL ADMIN & HISTORIAL DE CONTENIDO
const btnPubAlerta = document.getElementById('btn-publicar-alerta');
if(btnPubAlerta) {
    btnPubAlerta.addEventListener('click', () => {
        const texto = document.getElementById('alert-text').value;
        const link = document.getElementById('alert-link').value;
        if(texto) set(ref(db, 'configuracion/alerta'), { activa: true, texto, link });
    });
}

const btnQuitAlerta = document.getElementById('btn-quitar-alerta');
if(btnQuitAlerta) {
    btnQuitAlerta.addEventListener('click', () => {
        set(ref(db, 'configuracion/alerta/activa'), false);
    });
}

const btnGuarSocio = document.getElementById('btn-guardar-socio');
if(btnGuarSocio) {
    btnGuarSocio.addEventListener('click', () => {
        const num = document.getElementById('socio-num').value;
        const nombre = document.getElementById('socio-name').value;
        const status = document.getElementById('socio-status').value;
        if(num >= 1 && num <= 10 && nombre) {
            set(ref(db, 'socios/' + num), { nombre, status });
            alert(`Socio #${num} guardado.`);
            document.getElementById('socio-name').value = '';
        }
    });
}

const btnPubQuiz = document.getElementById('btn-publicar-quiz');
if(btnPubQuiz) {
    btnPubQuiz.addEventListener('click', () => {
        const pregunta = document.getElementById('quiz-question').value;
        const opt1 = document.getElementById('quiz-opt1').value;
        const opt2 = document.getElementById('quiz-opt2').value;
        const opt3 = document.getElementById('quiz-opt3').value;
        const opt4 = document.getElementById('quiz-opt4').value;

        if(pregunta && opt1 && opt2) {
            const quizData = { pregunta, opciones: [opt1, opt2, opt3, opt4].filter(o => o !== "") };
            set(ref(db, 'cuestionario_activo'), quizData);
            push(ref(db, 'historial_encuestas'), quizData);
            set(ref(db, 'partido_actual'), null);
            alert("¡Cuestionario lanzado y guardado en el historial!");
            document.getElementById('quiz-question').value = '';
            document.getElementById('quiz-opt1').value = '';
            document.getElementById('quiz-opt2').value = '';
            document.getElementById('quiz-opt3').value = '';
            document.getElementById('quiz-opt4').value = '';
        } else {
            alert("Rellena la pregunta y al menos 2 opciones.");
        }
    });
}

const btnPubNews = document.getElementById('btn-publicar-news');
if(btnPubNews) {
    btnPubNews.addEventListener('click', () => {
        const titulo = document.getElementById('news-title').value;
        const resumen = document.getElementById('news-desc').value;
        const categoria = document.getElementById('news-cat').value || 'DEBATE';
        if(titulo && resumen) {
            const noticiaData = { categoria, titulo, resumen };
            push(ref(db, 'noticias'), noticiaData).then(() => { 
                alert("¡Debate publicado con éxito!");
                document.getElementById('news-title').value = '';
                document.getElementById('news-desc').value = '';
            });
        }
    });
}

const historialEncuestasDiv = document.getElementById('historial-encuestas');
const historialDebatesDiv = document.getElementById('historial-debates');

if (historialEncuestasDiv && historialDebatesDiv) {
    onValue(ref(db, 'historial_encuestas'), (snapshot) => {
        historialEncuestasDiv.innerHTML = '';
        const data = snapshot.val();
        if(data) {
            Object.keys(data).forEach(key => {
                const enc = data[key];
                historialEncuestasDiv.innerHTML += `
                    <div class="history-item">
                        <span><strong>${enc.pregunta}</strong></span>
                        <div class="history-actions">
                            <button style="background:#2b6cb0;" onclick="window.reusarEncuesta('${key}')">Reutilizar</button>
                            <button style="background:#e53e3e;" onclick="window.borrarHistorial('historial_encuestas', '${key}')">Borrar</button>
                        </div>
                    </div>
                `;
            });
        } else {
            historialEncuestasDiv.innerHTML = '<p style="color:#666; font-size:0.85rem;">No hay encuestas en el historial.</p>';
        }
    });

    onValue(ref(db, 'noticias'), (snapshot) => {
        historialDebatesDiv.innerHTML = '';
        const data = snapshot.val();
        if(data) {
            Object.keys(data).forEach(key => {
                const deb = data[key];
                historialDebatesDiv.innerHTML += `
                    <div class="history-item">
                        <span>[${deb.categoria}] <strong>${deb.titulo}</strong></span>
                        <div class="history-actions">
                            <button style="background:#e53e3e;" onclick="window.borrarHistorial('noticias', '${key}')">Quitar de Web</button>
                        </div>
                    </div>
                `;
            });
        } else {
            historialDebatesDiv.innerHTML = '<p style="color:#666; font-size:0.85rem;">No hay debates activos o en historial.</p>';
        }
    });
}

window.reusarEncuesta = (key) => {
    get(ref(db, `historial_encuestas/${key}`)).then(snap => {
        if(snap.exists()) {
            set(ref(db, 'cuestionario_activo'), snap.val());
            set(ref(db, 'partido_actual'), null);
            alert("¡Encuesta restaurada y activa en la web!");
        }
    });
};

window.borrarHistorial = (path, key) => {
    if(confirm("¿Seguro que quieres eliminar este elemento?")) {
        remove(ref(db, `${path}/${key}`)).then(() => {
            alert("Eliminado correctamente.");
        });
    }
};

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
    alert("Modo Automático activado.");
    get(ref(db, 'partido_actual')).then(snap => {
        const data = snap.val();
        if(data && data.competicion) checkAndSetAutoTheme(data.competicion);
    });
});

function checkAndSetAutoTheme(competicionNombre) {
    set(ref(db, 'configuracion/tema_auto'), true);
    const comp = competicionNombre.toLowerCase();
    let newTheme = 'matchday';
    if (comp.includes('champions') || comp.includes('uefa')) {
        newTheme = 'champions';
    } else if (comp.includes('world cup') || comp.includes('mundial') || comp.includes('euro')) {
        newTheme = 'mundial';
    }
    set(ref(db, 'configuracion/tema_actual'), newTheme);
}

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
                    set(ref(db, 'cuestionario_activo'), null);
                    
                    get(ref(db, 'configuracion/tema_auto')).then(snap => {
                        if(snap.val() === true) checkAndSetAutoTheme(compNombre);
                    });
                    
                    alert("Partido fijado y actualizado en la web.");
                });
            });
        } catch (e) { contenedor.innerHTML = "Error al conectar con la API."; }
    });
                  }
