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

// Inicializar Firebase si aún no está inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// ==========================================
// CONTROL DE REDIRECCIÓN SI YA ESTÁ LOGUEADO
// ==========================================
auth.onAuthStateChanged(user => {
    if (user) {
        // Redirigir al inicio o perfil
        window.location.href = 'index.html';
    }
});

// ==========================================
// INTERFAZ DE USUARIO (TABS & TOASTS)
// ==========================================
function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('form-login').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('form-register').classList.add('active');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
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
    const userRef = db.ref(`users/${user.uid}`);
    const statsRef = db.ref(`userStats/${user.uid}`);

    const snapshot = await userRef.once('value');

    // Si el usuario es totalmente nuevo en la BD, creamos su perfil
    if (!snapshot.exists()) {
        const nameToSave = customName || user.displayName || 'Usuario';
        
        // 1. Perfil Principal
        await userRef.set({
            uid: user.uid,
            displayName: nameToSave,
            email: user.email,
            role: 'usuario',
            favoriteTeam: '',
            bio: '',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });

        // 2. Estadísticas Iniciales
        await statsRef.set({
            xp: 0,
            level: 1,
            points: 0,
            comments: 0,
            predictions: 0,
            streak: 1
        });
    }
}

// ==========================================
// MANEJADORES DE AUTENTICACIÓN
// ==========================================

// 1. Iniciar Sesión con Email
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login');

    btn.disabled = true;
    btn.innerText = 'Verificando...';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('¡Bienvenido de nuevo!');
    } catch (error) {
        console.error("Error en Login:", error);
        showToast(getErrorMessage(error.code), 'error');
        btn.disabled = false;
        btn.innerText = 'Entrar a la Plataforma';
    }
}

// 2. Registro con Email
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('btn-register');

    btn.disabled = true;
    btn.innerText = 'Creando cuenta...';

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        await syncUserData(userCredential.user, name);
        
        showToast('¡Cuenta creada correctamente!');
    } catch (error) {
        console.error("Error en Registro:", error);
        showToast(getErrorMessage(error.code), 'error');
        btn.disabled = false;
        btn.innerText = 'Crear Mi Cuenta';
    }
}

// 3. Autenticación con Google
async function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await auth.signInWithPopup(provider);
        await syncUserData(result.user);
        showToast('¡Sesión iniciada con Google!');
    } catch (error) {
        console.error("Error Google Auth:", error);
        showToast('No se pudo completar el inicio de sesión con Google.', 'error');
    }
}

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
