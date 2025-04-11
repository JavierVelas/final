let db;
const DB_NAME = 'NotasDB';
const STORE_NAME = 'notas';

const request = indexedDB.open(DB_NAME, 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        console.log('ObjectStore creado:', STORE_NAME); 
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('Base de datos abierta correctamente'); 
    cargarNotas();
};

request.onerror = function(event) {
    console.error('Error al abrir la base de datos:', event.target.error); 
};

// Función para guardar una nota
function guardarNota(nota) {
    console.log('Guardando nota en IndexedDB:', nota); 
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({ texto: nota });

    request.onsuccess = function(event) {
        console.log('Nota guardada en IndexedDB:', nota); 
    };

    request.onerror = function(event) {
        console.error('Error al guardar la nota en IndexedDB:', event.target.error); 
    };
}

// Función para cargar las notas
function cargarNotas() {
    console.log('Cargando notas desde IndexedDB'); 
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function(event) {
        const notas = event.target.result;
        console.log('Notas recuperadas de IndexedDB:', notas); 
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        notas.forEach(nota => {
            const li = document.createElement('li');
            li.textContent = nota.texto;
            notesList.appendChild(li);
        });
    };
}

// Evento para guardar la nota
document.getElementById('save-note').addEventListener('click', () => {
    const nota = document.getElementById('note-input').value;
    console.log('Botón Guardar Nota clickeado. Nota:', nota); 
    if (nota) {
        if (estaEnLinea()) {
            console.log('Hay conexión a Internet. Enviando nota al servidor...'); 
            enviarNotaAlServidor(nota);
        } else {
            console.log('No hay conexión a Internet. Guardando nota en IndexedDB...'); 
            guardarNota(nota);
        }
        document.getElementById('note-input').value = '';
        cargarNotas();
    }
});

// Función para verificar la conexión
function estaEnLinea() {
    const enLinea = navigator.onLine;
    console.log('Verificando conexión a Internet:', enLinea); 
    return enLinea;
}

// Función para enviar la nota al servidor
function enviarNotaAlServidor(nota) {
    console.log('Enviando nota al servidor:', nota);
    fetch('http://localhost:3000/guardar-nota', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nota: nota }),
    })
    .then(response => response.text())
    .then(data => {
        console.log('Respuesta del servidor:', data); 
    })
    .catch(error => {
        console.error('Error al enviar la nota:', error); 
    });
}


window.addEventListener('online', () => {
    console.log('Conexión a Internet recuperada. Sincronizando notas...'); 
    solicitarSincronizacion();
});

// Función para solicitar sincronización
function solicitarSincronizacion() {
    console.log('Solicitando sincronización de notas...'); 
    navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-notas')
            .then(() => {
                console.log('Sincronización solicitada correctamente'); 
            })
            .catch((error) => {
                console.error('Error al solicitar sincronización:', error); 
            });
    });
}

// Función para obtener y mostrar notas en pantalla
async function obtenerNotas() {
    try {
        const response = await fetch('http://localhost:3000/obtener-notas');
        const notas = await response.json();
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';

        notas.forEach(nota => {
            const li = document.createElement('li');
            li.textContent = `${nota.texto} (Fecha: ${new Date(nota.fecha).toLocaleString()})`;
            notesList.appendChild(li);
        });

        console.log('Notas cargadas en la página.');
    } catch (error) {
        console.error("Error al obtener notas:", error);
    }
}

// Cargar notas al inicio
document.addEventListener('DOMContentLoaded', obtenerNotas);
