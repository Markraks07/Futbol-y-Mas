import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    get, 
    set, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ==========================================
// CONFIGURACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDGxLmQDmohUivV1XxIsLIWAvDATLRROgE",
    authDomain: "fuego-en-la-isla.firebaseapp.com",
    databaseURL: "https://fuego-en-la-isla-default-rtdb.firebaseio.com",
    projectId: "fuego-en-la-isla",
    storageBucket: "fuego-en-la-isla.firebasestorage.app",
    messagingSenderId: "837575806373",
    appId: "1:837575806373:web:d823ec3986cfee375cec4c"
};

// Inicializar Firebase, Auth y Database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ==========================================
// CONTROL DE REDIRECCIÓN SI YA ESTÁ LOGUEADO
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redirigir al inicio si ya hay sesión activa
        window.location.href = 'index.html';
    }
});

// ==========================================
// INTERFAZ DE USUARIO (TABS & TOASTS)
// ==========================================
window.switchTab = function(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0]?.classList.add('active');
        document.getElementById('form-login')?.classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1]?.classList.add('active');
        document.getElementById('form-register')?.classList.add('active');
    }
};

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        alert(message);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==========================================
// BASE DE DATOS: CREAR / SINCRONIZAR USUARIO
// ==========================================
async function syncUserData(user, customName = null) {
    const userRef = ref(db, `users/${user.uid}`);
    const statsRef = ref(db, `userStats/${user.uid}`);

    try {
        const snapshot = await get(userRef);

        // Si el usuario es totalmente nuevo en la BD, creamos su perfil
        if (!snapshot.exists()) {
            const nameToSave = customName || user.displayName || 'Usuario';

            // 1. Perfil Principal
            await set(userRef, {
                uid: user.uid,
                displayName: nameToSave,
                email: user.email || 'Sin email',
                role: 'usuario',
                favoriteTeam: '',
                bio: '',
                createdAt: serverTimestamp()
            });

            // 2. Estadísticas Iniciales
            await set(statsRef, {
                xp: 0,
                level: 1,
                points: 0,
                comments: 0,
                predictions: 0,
                streak: 1
            });
        }
    } catch (err) {
        console.error("Error al sincronizar datos de usuario:", err);
    }
}

// ==========================================
// EVENT LISTENERS & MANEJADORES DE AUTENTICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // 1. Iniciar Sesión con Email
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('btn-login');

            btn.disabled = true;
            btn.innerText = 'Verificando...';

            try {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('¡Bienvenido de nuevo!', 'success');
                // La redirección ocurrirá en onAuthStateChanged
            } catch (error) {
                console.error("Error en Login:", error);
                showToast(getErrorMessage(error.code), 'error');
                btn.disabled = false;
                btn.innerText = 'Entrar a la Plataforma';
            }
        });
    }

    // 2. Registro con Email
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const btn = document.getElementById('btn-register');

            btn.disabled = true;
            btn.innerText = 'Creando cuenta...';

            try {
                // Crear usuario
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Guardar nombre en el Perfil de Auth
                await updateProfile(user, { displayName: name });

                // Crear datos en /users y /userStats de Realtime Database
                await syncUserData(user, name);

                showToast('¡Cuenta creada correctamente!', 'success');
                // La redirección ocurrirá en onAuthStateChanged
            } catch (error) {
                console.error("Error en Registro:", error);
                showToast(getErrorMessage(error.code), 'error');
                btn.disabled = false;
                btn.innerText = 'Crear Mi Cuenta';
            }
        });
    }

    // 3. Autenticación con Google
    const btnGoogle = document.getElementById('btn-google-login');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                await syncUserData(result.user);
                showToast('¡Sesión iniciada con Google!', 'success');
            } catch (error) {
                console.error("Error Google Auth:", error);
                showToast('No se pudo completar el inicio de sesión con Google.', 'error');
            }
        });
    }
});

// ==========================================
// TRADUCCIÓN DE ERRORES DE FIREBASE
// ==========================================
function getErrorMessage(code) {
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Correo o contraseña incorrectos.';
        case 'auth/email-already-in-use':
            return 'Este correo ya está registrado en la plataforma.';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres.';
        case 'auth/invalid-email':
            return 'El formato de correo no es válido.';
        default:
            return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
    }
}
