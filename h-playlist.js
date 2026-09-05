// Variabile globale: se è null stiamo creando, se ha un valore stiamo modificando
let playlistInModificaId = null;

// Prepara il modale per una NUOVA playlist
function preparaNuovaPlaylist() {
    playlistInModificaId = null;
    document.getElementById('formNuovaPlaylist').reset();
    document.getElementById('titoloModalePlaylist').textContent = "Nuova Playlist";
    document.getElementById('btnSalvaPlaylist').textContent = "Crea Playlist";
}

// Prepara il modale per la MODIFICA
function modificaPlaylist(id) {
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = tutteLePlaylists.find(pl => pl.id === id);
    if (!playlist) return;

    playlistInModificaId = id;

    // Popola i campi del form esistente
    document.getElementById('titoloPlaylist').value = playlist.titolo;
    document.getElementById('descrizionePlaylist').value = playlist.descrizione;
    document.getElementById('tagPlaylist').value = playlist.tag.map(t => t.replace('#', '')).join(' ');

    // Cambia i testi del modale
    document.getElementById('titoloModalePlaylist').textContent = "Modifica Playlist";
    document.getElementById('btnSalvaPlaylist').textContent = "Salva Modifiche";

    // Apri il modale
    const modalElement = document.getElementById('modalNuovaPlaylist');
    const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Funzione unificata per salvare (Crea o Aggiorna)
function salvaPlaylist() {
    const titolo = document.getElementById('titoloPlaylist').value.trim();
    const descrizione = document.getElementById('descrizionePlaylist').value.trim();
    const rawTag = document.getElementById('tagPlaylist').value.trim();

    if (!titolo || !descrizione || !rawTag) {
        alert("Compila tutti i campi obbligatori.");
        return;
    }

    const tagArray = rawTag.split(/\s+/).map(t => t.replace(/[,#]/g, '').trim()).filter(t => t.length > 0).map(t => `#${t}`);
    if (tagArray.length === 0) return alert("Inserisci almeno un tag valido.");

    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];

    if (playlistInModificaId) {
        // MODIFICA
        const index = tutteLePlaylists.findIndex(pl => pl.id === playlistInModificaId);
        if (index !== -1) {
            tutteLePlaylists[index].titolo = titolo;
            tutteLePlaylists[index].descrizione = descrizione;
            tutteLePlaylists[index].tag = tagArray;
        }
    } else {
        // CREAZIONE NUOVA
        const utenteEmail = localStorage.getItem('utente_loggato');
        const nuovaPlaylist = {
            id: 'pl_' + Date.now(),
            utente: utenteEmail,
            titolo: titolo,
            descrizione: descrizione,
            tag: tagArray,
            dataCreazione: new Date().toISOString(),
            canzoni: [] // Predisposizione per la fase successiva
        };
        tutteLePlaylists.push(nuovaPlaylist);
    }

    localStorage.setItem('playlists', JSON.stringify(tutteLePlaylists));

    const modalElement = document.getElementById('modalNuovaPlaylist');
    bootstrap.Modal.getInstance(modalElement).hide();

    mostraPlaylists();
}

// Funzione per generare e mostrare le Card a schermo
function mostraPlaylists() {
    const contenitore = document.getElementById('griglia-playlist');
    const utenteEmail = localStorage.getItem('utente_loggato');
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
    
    // Filtra solo le playlist dell'utente loggato
    const miePlaylists = tutteLePlaylists.filter(pl => pl.utente === utenteEmail);

    // Se non ci sono playlist, mostra un messaggio
    if (miePlaylists.length === 0) {
        contenitore.innerHTML = `<p class="text-secondary">Non hai ancora creato nessuna playlist. Inizia ora!</p>`;
        return;
    }

    // Pulisce il contenitore e genera le card
    contenitore.innerHTML = '';
    
    miePlaylists.forEach(pl => {
        // Genera dei badge HTML per i tag
        const tagHTML = pl.tag.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('');
        
        const cardHTML = `
            <div class="col">
                <div class="card h-100 bg-dark text-white border-secondary shadow-sm hover-grey">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-success">${pl.titolo}</h5>
                        <p class="card-text small text-light opacity-75">${pl.descrizione}</p>
                        <div class="mt-auto">
                            ${tagHTML}
                        </div>
                    </div>
                    <div class="card-footer border-secondary d-flex justify-content-between align-items-center">
                        <button class="btn btn-sm btn-outline-light rounded-pill" onclick="apriPlaylist('${pl.id}')">Apri</button>
                        
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="modificaPlaylist('${pl.id}')" title="Modifica">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="eliminaPlaylist('${pl.id}')" title="Elimina">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenitore.innerHTML += cardHTML;
    });
}

// Funzione per eliminare una playlist
function eliminaPlaylist(id) {
    // 1. Mostra una finestra di conferma all'utente
    const conferma = confirm("Sei sicuro di voler eliminare questa playlist? L'azione è irreversibile.");
    
    if (conferma) {
        // 2. Recupera l'array corrente dal localStorage
        const tutteLePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
        
        // 3. Filtra le playlist escludendo quella con l'ID passato
        const playlistAggiornate = tutteLePlaylists.filter(pl => pl.id !== id);
        
        // 4. Salva il nuovo array aggiornato nel localStorage
        localStorage.setItem('playlists', JSON.stringify(playlistAggiornate));
        
        // 5. Ricarica la griglia per aggiornare la visualizzazione
        mostraPlaylists();
    }
}

// Restituisce tutte le playlist salvate nel browser
function getTutteLePlaylist() {
    return JSON.parse(localStorage.getItem('playlists'));
}

// Restituisce solo le playlist create dall'utente attualmente loggato
function getPlaylistUtente() {
    const utenteSalvato = localStorage.getItem('utente_loggato');
    const tutte = getTutteLePlaylist();
    return tutte.filter(pl => pl.utente === utenteSalvato);
}