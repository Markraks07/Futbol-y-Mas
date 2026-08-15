import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    set, 
    push, 
    get, 
    remove, 
    runTransaction 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDGxLmQDmohUivV1XxIsLIWAvDATLRROgE",
    authDomain: "fuego-en-la-isla.firebaseapp.com",
    databaseURL: "https://fuego-en-la-isla-default-rtdb.firebaseio.com",
    projectId: "fuego-en-la-isla",
    storageBucket: "fuego-en-la-isla.firebasestorage.app",
    messagingSenderId: "837575806373",
    appId: "1:837575806373:web:d823ec3986cfee375cec4c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

function showToast(mensaje) {
    alert(mensaje);
}

// Funciones globales expuestas antes de cualquier evento DOM
window.reusarEncuesta = function(key) {
    get(ref(db, "historial_encuestas/" + key)).then(function(snap) {
        if (snap.exists()) {
            set(ref(db, 'cuestionario_activo'), snap.val());
            set(ref(db, 'partido_actual'), null);
            alert("¡Encuesta restaurada y activa!");
        }
    });
};

window.borrarHistorial = function(path, key) {
    if (confirm("¿Seguro que quieres eliminar este elemento?")) {
        remove(ref(db, path + "/" + key)).then(function() {
            alert("Eliminado correctamente.");
        });
    }
};

window.abrirNoticiaModal = function(id) {
    console.log("Abrir noticia: " + id);
};

// ==========================================
// 1. INICIALIZACIÓN PRINCIPAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Menú Hamburguesa
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            navLinks.classList.toggle('active'); 
        });
        navLinks.querySelectorAll('a').forEach(link => { 
            link.addEventListener('click', () => navLinks.classList.remove('active')); 
        });
    }

    // Cargar noticias al iniciar
    cargarNoticias();

    // Navegación por pestañas en el Admin (PROTEGIDO)
    const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
    const adminSections = document.querySelectorAll('.admin-section');
    if (adminNavBtns.length > 0 && adminSections.length > 0) {
        adminNavBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.getAttribute('data-target');
                adminNavBtns.forEach(b => b.classList.remove('active'));
                adminSections.forEach(sec => sec.style.display = 'none');

                e.currentTarget.classList.add('active');
                const targetSec = document.getElementById(targetId);
                if (targetSec) targetSec.style.display = 'block';
            });
        });
        // Corrección del fallo: solo hace click si existe el botón
        if (adminNavBtns[0]) adminNavBtns[0].click();
    }

    // Escuchar el estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        const authZone = document.getElementById('user-auth-zone');
        
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            try {
                const userSnap = await get(userRef);
                let nombreFinal = user.displayName;

                if (userSnap.exists() && userSnap.val().displayName) {
                    nombreFinal = userSnap.val().displayName;
                } else if (!nombreFinal && user.email) {
                    nombreFinal = user.email.split('@')[0];
                }

                if (!nombreFinal) nombreFinal = 'Usuario';

                if (authZone) {
                    authZone.innerHTML = `
                        <span style="color: var(--text-main); font-weight: bold; margin-right: 10px; font-size: 0.9rem;">
                            ⚽ ${nombreFinal}
                        </span>
                        <button id="btn-logout" class="toggle-comments-btn" style="color: var(--accent); font-size: 0.85rem; margin:0; cursor:pointer;">
                            (Salir)
                        </button>
                    `;
                    document.getElementById('btn-logout')?.addEventListener('click', () => {
                        signOut(auth).then(() => window.location.reload());
                    });
                }
            } catch (error) {
                console.error("Error al obtener perfil de usuario:", error);
            }
        } else {
            if (authZone) {
                authZone.innerHTML = `
                    <a href="login.html" class="btn-action" style="padding: 6px 14px; font-size: 0.85rem; text-decoration: none;">
                        Iniciar Sesión
                    </a>
                `;
            }
        }
        
        // Cargar zona interactiva / porras
        escucharZonaInteractiva(user);
    });
});

// ==========================================
// 2. GESTIÓN DE NOTICIAS / DEBATES
// ==========================================
function cargarNoticias() {
    const destacadaContainer = document.getElementById('noticia-destacada-container');
    const listaTodasContainer = document.getElementById('lista-todas-noticias');
    const btnVerTodas = document.getElementById('btn-ver-todas-noticias');

    if (!destacadaContainer) return;

    onValue(ref(db, 'noticias'), (snapshot) => {
        if (!snapshot.exists()) {
            destacadaContainer.innerHTML = '<p class="no-data">No hay noticias publicadas aún.</p>';
            return;
        }

        const data = snapshot.val();
        const listaNoticias = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        })).reverse();

        const ultimaNoticia = listaNoticias[0];
        destacadaContainer.innerHTML = renderCardNoticia(ultimaNoticia, true);

        if (listaNoticias.length > 1 && listaTodasContainer) {
            listaTodasContainer.innerHTML = listaNoticias.slice(1).map(noticia => renderCardNoticia(noticia, false)).join('');
        } else if (btnVerTodas) {
            btnVerTodas.style.display = 'none';
        }
    });

    if (btnVerTodas) {
        btnVerTodas.addEventListener('click', (e) => {
            e.preventDefault();
            if (listaTodasContainer) {
                const isHidden = listaTodasContainer.style.display === 'none';
                listaTodasContainer.style.display = isHidden ? 'grid' : 'none';
                btnVerTodas.innerText = isHidden ? '← Ocultar noticias anteriores' : 'Ver todas las noticias →';
            }
        });
    }
}

function renderCardNoticia(noticia, esPrincipal = false) {
    return `
        <article class="noticia-card ${esPrincipal ? 'destacada' : ''}">
            ${noticia.imagen ? `<img src="${noticia.imagen}" alt="${noticia.titulo}" class="noticia-img">` : ''}
            <div class="noticia-content">
                <span class="noticia-fecha">${noticia.fecha || 'Reciente'}</span>
                <h3>${noticia.titulo}</h3>
                <p>${noticia.resumen || (noticia.contenido ? noticia.contenido.substring(0, 120) + '...' : '')}</p>
                <button class="btn-action" onclick="window.abrirNoticiaModal('${noticia.id}')">
                    Leer y Comentar 💬
                </button>
            </div>
        </article>
    `;
}

// ==========================================
// 3. ZONA INTERACTIVA (PARTIDOS Y PORRAS)
// ==========================================
function escucharZonaInteractiva(currentUser) {
    const partidoContainer = document.getElementById('partido-container');
    const tituloInteractivo = document.getElementById('panel-interactivo-titulo');
    if (!partidoContainer) return;

    onValue(ref(db, 'partido_actual'), (snapshot) => {
        const data = snapshot.val();
        if (data && data.equipoLocal) {
            if (tituloInteractivo) tituloInteractivo.innerText = "🔥 LA PORRA DE LA SEMANA";
            partidoContainer.innerHTML = `
                <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase;">${data.competicion || 'AMISTOSO'}</div>
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoLocal}</span> 
                <span style="color: var(--accent); margin: 0 10px; font-size: 1.5rem;">VS</span> 
                <span style="color: var(--text-main); font-size: 1.5rem; font-weight: bold;">${data.equipoVisitante}</span>
                <br>
                <a href="URL_DE_TU_WHATSAPP" target="_blank" class="btn-action track-wa" style="margin-top:20px; display:inline-block;">Dejar mi predicción en WhatsApp</a>
            `;
        } else {
            onValue(ref(db, 'cuestionario_activo'), async (quizSnap) => {
                const qData = quizSnap.val();
                if (!qData) {
                    if (tituloInteractivo) tituloInteractivo.innerText = "🔥 ZONA DE PARTICIPACIÓN";
                    partidoContainer.innerHTML = `<p style="color: var(--text-muted);">No hay partidos ni encuestas activas ahora mismo.</p>`;
                    return;
                }

                if (tituloInteractivo) tituloInteractivo.innerText = "📝 CUESTIONARIO ACTIVO";

                let yaVoto = false;
                let opcionVotada = null;

                if (currentUser) {
                    const userVotoSnap = await get(ref(db, `cuestionario_activo/votos_usuarios/${currentUser.uid}`));
                    if (userVotoSnap.exists()) {
                        yaVoto = true;
                        opcionVotada = userVotoSnap.val();
                    }
                }

                let totalVotos = 0;
                if (qData.votos) {
                    Object.values(qData.votos).forEach(v => totalVotos += (v || 0));
                }

                let opcionesHTML = '';
                if (qData.opciones) {
                    qData.opciones.forEach((opt, index) => {
                        if (!opt) return;
                        const votosOpcion = (qData.votos && qData.votos[index]) ? qData.votos[index] : 0;
                        const porcentaje = totalVotos > 0 ? Math.round((votosOpcion / totalVotos) * 100) : 0;

                        if (yaVoto) {
                            const esLaSeleccionada = (index == opcionVotada) ? ' 🌟 (Tu voto)' : '';
                            opcionesHTML += `
                                <div class="btn-quiz-option" style="background: linear-gradient(90deg, var(--accent) ${porcentaje}%, var(--panel-bg) ${porcentaje}%); opacity: 0.9; cursor: default; margin-bottom: 8px;">
                                    <span>${opt} ${esLaSeleccionada}</span>
                                    <strong style="float: right;">${porcentaje}% (${votosOpcion})</strong>
                                </div>
                            `;
                        } else if (currentUser) {
                            opcionesHTML += `
                                <button class="btn-quiz-option btn-votar" data-index="${index}" style="margin-bottom: 8px;">
                                    ${opt}
                                </button>
                            `;
                        } else {
                            opcionesHTML += `
                                <button class="btn-quiz-option" style="opacity: 0.7; margin-bottom: 8px;" onclick="window.location.href='login.html'">
                                    ${opt} (Inicia sesión para votar)
                                </button>
                            `;
                        }
                    });
                }

                partidoContainer.innerHTML = `
                    <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--text-main);">${qData.pregunta}</h3>
                    <div class="quiz-options">${opcionesHTML}</div>
                    <div style="margin-top: 15px; font-size: 0.85rem; color: var(--text-muted);">Total de votos: <strong>${totalVotos}</strong></div>
                `;

                partidoContainer.querySelectorAll('.btn-votar').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const idx = e.currentTarget.getAttribute('data-index');
                        await ejecutarVoto(currentUser, idx);
                    });
                });
            });
        }
    });
}

async function ejecutarVoto(user, opcionIdx) {
    if (!user) {
        showToast("Debes iniciar sesión para votar.");
        return;
    }

    const userVotoRef = ref(db, `cuestionario_activo/votos_usuarios/${user.uid}`);
    const contadorVotoRef = ref(db, `cuestionario_activo/votos/${opcionIdx}`);

    try {
        const snap = await get(userVotoRef);
        if (snap.exists()) {
            showToast("Ya has votado en esta encuesta.");
            return;
        }

        await set(userVotoRef, opcionIdx);
        await runTransaction(contadorVotoRef, (votosActuales) => {
            return (votosActuales || 0) + 1;
        });

        showToast("¡Voto registrado con éxito!");
    } catch (error) {
        console.error("Error al votar:", error);
        showToast("Hubo un error al guardar tu voto.");
    }
}

// ==========================================
// 4. CONFIGURACIONES DE TEMA Y ALERTAS
// ==========================================
const alertBanner = document.getElementById('alert-banner');
if (alertBanner) {
    onValue(ref(db, 'configuracion/alerta'), (snapshot) => {
        const al = snapshot.val();
        if (al && al.activa) {
            alertBanner.style.display = 'block';
            const alertTextEl = document.getElementById('alert-banner-text');
            if (alertTextEl) alertTextEl.innerText = al.texto;
            alertBanner.href = al.link || '#';
            if (!al.link) alertBanner.removeAttribute('target');
        } else {
            alertBanner.style.display = 'none';
        }
    });
}

// Cambios de tema
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
    } else if (tema === 'matchday') {
        root.style.setProperty('--bg-color', '#1a0505'); 
        root.style.setProperty('--panel-bg', '#2a0a0a');
        root.style.setProperty('--card-bg', '#1c0707');
        root.style.setProperty('--accent', '#ffcc00'); 
    } else if (tema === 'champions') {
        root.style.setProperty('--bg-color', '#000c24'); 
        root.style.setProperty('--panel-bg', '#00163b');
        root.style.setProperty('--card-bg', '#001f4d');
        root.style.setProperty('--card-border', '#003366');
        root.style.setProperty('--accent', '#00ccff'); 
    } else if (tema === 'mundial') {
        root.style.setProperty('--bg-color', '#240000'); 
        root.style.setProperty('--panel-bg', '#3b0000');
        root.style.setProperty('--card-bg', '#4d0000');
        root.style.setProperty('--card-border', '#660000');
        root.style.setProperty('--accent', '#ecc94b'); 
    }
});

// ==========================================
// 5. SOCIOS VIP
// ==========================================
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

// ==========================================
// 6. PANEL DE ADMINISTRACIÓN Y ACCIONES (PROTEGIDOS CON OPTIONAL CHAINING)
// ==========================================
document.getElementById('btn-publicar-alerta')?.addEventListener('click', () => {
    const texto = document.getElementById('alert-text')?.value;
    const link = document.getElementById('alert-link')?.value;
    if (texto) set(ref(db, 'configuracion/alerta'), { activa: true, texto, link: link || '' });
});

document.getElementById('btn-quitar-alerta')?.addEventListener('click', () => {
    set(ref(db, 'configuracion/alerta/activa'), false);
});

document.getElementById('btn-guardar-socio')?.addEventListener('click', () => {
    const num = document.getElementById('socio-num')?.value;
    const nombre = document.getElementById('socio-name')?.value;
    const status = document.getElementById('socio-status')?.value;
    if (num >= 1 && num <= 10 && nombre) {
        set(ref(db, 'socios/' + num), { nombre, status });
        alert(`Socio #${num} guardado.`);
        if (document.getElementById('socio-name')) document.getElementById('socio-name').value = '';
    }
});

// PUBLICAR NUEVA ENCUESTA
document.getElementById('btn-publicar-quiz')?.addEventListener('click', async () => {
    const pregunta = document.getElementById('quiz-question')?.value;
    const opt1 = document.getElementById('quiz-opt1')?.value;
    const opt2 = document.getElementById('quiz-opt2')?.value;
    const opt3 = document.getElementById('quiz-opt3')?.value;
    const opt4 = document.getElementById('quiz-opt4')?.value;

    if (pregunta && opt1 && opt2) {
        const actSnap = await get(ref(db, 'cuestionario_activo'));
        if (actSnap.exists()) {
            const encuestaAntigua = actSnap.val();
            let totalVotos = 0;
            if (encuestaAntigua.votos) {
                Object.values(encuestaAntigua.votos).forEach(v => totalVotos += (v || 0));
            }

            push(ref(db, 'cuestionarios_anteriores'), {
                ...encuestaAntigua,
                totalVotos,
                fechaFinalizado: new Date().toLocaleDateString()
            });
        }

        const nuevaEncuesta = { 
            pregunta, 
            opciones: [opt1, opt2, opt3, opt4].filter(o => o && o !== "") 
        };

        await set(ref(db, 'cuestionario_activo'), nuevaEncuesta);
        await push(ref(db, 'historial_encuestas'), nuevaEncuesta);
        await set(ref(db, 'partido_actual'), null);

        alert("¡Cuestionario publicado! La encuesta anterior se guardó en el historial.");
        if (document.getElementById('quiz-question')) document.getElementById('quiz-question').value = '';
        if (document.getElementById('quiz-opt1')) document.getElementById('quiz-opt1').value = '';
        if (document.getElementById('quiz-opt2')) document.getElementById('quiz-opt2').value = '';
        if (document.getElementById('quiz-opt3')) document.getElementById('quiz-opt3').value = '';
        if (document.getElementById('quiz-opt4')) document.getElementById('quiz-opt4').value = '';
    } else {
        alert("Rellena la pregunta y al menos 2 opciones.");
    }
});

// PUBLICAR NUEVA NOTICIA / DEBATE
document.getElementById('btn-publicar-news')?.addEventListener('click', () => {
    const titulo = document.getElementById('news-title')?.value;
    const resumen = document.getElementById('news-desc')?.value;
    const categoria = document.getElementById('news-cat')?.value || 'DEBATE';
    
    if (titulo && resumen) {
        const fechaActual = new Date().toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });

        push(ref(db, 'noticias'), { 
            categoria, 
            titulo, 
            resumen,
            fecha: fechaActual 
        }).then(() => { 
            alert("¡Debate publicado con éxito!");
            if (document.getElementById('news-title')) document.getElementById('news-title').value = '';
            if (document.getElementById('news-desc')) document.getElementById('news-desc').value = '';
        });
    } else {
        alert("Rellena el título y la descripción.");
    }
});

// Historiales en Panel Admin
const historialEncuestasDiv = document.getElementById('historial-encuestas');
const historialDebatesDiv = document.getElementById('historial-debates');

if (historialEncuestasDiv && historialDebatesDiv) {
    onValue(ref(db, 'historial_encuestas'), (snapshot) => {
        historialEncuestasDiv.innerHTML = '';
        const data = snapshot.val();
        if (data) {
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
        if (data) {
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

// Cambios de Tema en Admin
const changeTheme = (themeName, isAuto) => {
    set(ref(db, 'configuracion/tema_actual'), themeName);
    set(ref(db, 'configuracion/tema_auto'), isAuto);
};
document.getElementById('btn-tema-oscuro')?.addEventListener('click', () => changeTheme('dark', false));
document.getElementById('btn-tema-claro')?.addEventListener('click', () => changeTheme('light', false));
document.getElementById('btn-tema-match')?.addEventListener('click', () => changeTheme('matchday', false));
document.getElementById('btn-tema-champions')?.addEventListener('click', () => changeTheme('champions', false));
document.getElementById('btn-tema-mundial')?.addEventListener('click', () => changeTheme('mundial', false));

// Cambiar Contraseña Admin
document.getElementById('btn-cambiar-pass')?.addEventListener('click', () => {
    const passInput = document.getElementById('admin-new-pass');
    const nuevaPass = passInput ? passInput.value.trim() : '';
    if (nuevaPass.length >= 4) {
        set(ref(db, 'configuracion/admin_password'), nuevaPass).then(() => {
            alert("¡Contraseña actualizada!");
            if (passInput) passInput.value = '';
        });
    } else {
        alert("La contraseña debe tener al menos 4 caracteres.");
    }
});

// Ver votos activos en Admin
const adminVotosContainer = document.getElementById('admin-votos-activos');
if (adminVotosContainer) {
    onValue(ref(db, 'cuestionario_activo'), (snap) => {
        const qData = snap.val();
        if (qData && qData.opciones) {
            let total = 0;
            if (qData.votos) Object.values(qData.votos).forEach(v => total += v);
            
            let html = `<p><strong>Pregunta:</strong> ${qData.pregunta} (Total: ${total} votos)</p><ul>`;
            qData.opciones.forEach((opt, idx) => {
                if (opt) {
                    let v = (qData.votos && qData.votos[idx]) ? qData.votos[idx] : 0;
                    html += `<li>${opt}: <strong>${v} votos</strong></li>`;
                }
            });
            html += `</ul>`;
            adminVotosContainer.innerHTML = html;
        } else {
            adminVotosContainer.innerHTML = `<p style="color:var(--text-muted);">No hay cuestionario activo en este momento.</p>`;
        }
    });
}
