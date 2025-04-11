let db;
const DB_NAME = 'NotasDB';
const STORE_NAME = 'notas';

// Abrir o crear la base de datos
const request = indexedDB.open(DB_NAME, 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    cargarNotas();
};

request.onerror = function(event) {
    console.error('Error al abrir la base de datos', event.target.error);
};

// Función para guardar una nota
function guardarNota(nota) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.add({ texto: nota });
}

// Función para actualizar una nota
function actualizarNota(id, nuevaNota) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: id, texto: nuevaNota });

    request.onsuccess = function(event) {
        console.log('Nota actualizada:', id);
        cargarNotas(); // Recargar las notas después de actualizar
    };

    request.onerror = function(event) {
        console.error('Error al actualizar la nota:', event.target.error);
    };
}

// Función para cargar las notas
function cargarNotas() {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function(event) {
        const notas = event.target.result;
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        notas.forEach(nota => {
            const li = document.createElement('li');
            li.textContent = nota.texto;

            // Botón para editar la nota
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => {
                document.getElementById('note-input').value = nota.texto;
                document.getElementById('save-note').style.display = 'none';
                document.getElementById('update-note').style.display = 'inline';
                document.getElementById('update-note').dataset.id = nota.id;
            });

            li.appendChild(editButton);
            notesList.appendChild(li);
        });
    };
}

// Evento para guardar la nota
document.getElementById('save-note').addEventListener('click', () => {
    const nota = document.getElementById('note-input').value;
    if (nota) {
        if (estaEnLinea()) {
            enviarNotaAlServidor(nota);
        } else {
            guardarNota(nota);
        }
        document.getElementById('note-input').value = '';
        cargarNotas();
    }
});

// Evento para actualizar la nota
document.getElementById('update-note').addEventListener('click', () => {
    const id = parseInt(document.getElementById('update-note').dataset.id);
    const nuevaNota = document.getElementById('note-input').value;
    if (nuevaNota) {
        actualizarNota(id, nuevaNota);
        document.getElementById('note-input').value = '';
        document.getElementById('save-note').style.display = 'inline';
        document.getElementById('update-note').style.display = 'none';
    }
});

// Función para verificar la conexión
function estaEnLinea() {
    return navigator.onLine;
}

// Función para enviar la nota al servidor (simulación)
function enviarNotaAlServidor(nota) {
    console.log('Nota enviada al servidor:', nota);
}