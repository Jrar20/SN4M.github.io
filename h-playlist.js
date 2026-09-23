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
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
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

    // 1. CHIAVE CORRETTA: 'playlist' (senza 's' finale)
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];

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
            idOriginale: null,       // Mantiene la struttura coerente con le importate
            autoreOriginale: null,   // Mantiene la struttura coerente con le importate
            utente: utenteEmail,
            titolo: titolo,
            descrizione: descrizione,
            tag: tagArray,
            dataCreazione: new Date().toISOString(),
            canzoni: [] 
        };
        tutteLePlaylists.push(nuovaPlaylist);
    }

    // 2. SALVATAGGIO SULLA CHIAVE CORRETTA 'playlist'
    localStorage.setItem('playlist', JSON.stringify(tutteLePlaylists));

    // NUOVO: Sincronizza i dati anagrafici se eravamo in modifica
    if (playlistInModificaId) {
        const indexModificata = tutteLePlaylists.findIndex(pl => pl.id === playlistInModificaId);
        if (indexModificata !== -1) {
            sincronizzaPlaylistCondivise(tutteLePlaylists[indexModificata]);
        }
    }

    // Assicurati che anche mostraPlaylists() legga da 'playlist'
    if (typeof mostraPlaylists === 'function') {
        mostraPlaylists();
    }
}

// Funzione per generare e mostrare le Card a schermo
function mostraPlaylists() {
    const contenitore = document.getElementById('griglia-playlist');
    const utenteEmail = localStorage.getItem('utente_loggato');
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
    
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
        // 2. ELIMINAZIONE DALLE PLAYLIST PERSONALI ('playlist')
        const tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
        const playlistAggiornate = tutteLePlaylists.filter(pl => pl.id !== id);
        localStorage.setItem('playlist', JSON.stringify(playlistAggiornate));
        
        // 3. ELIMINAZIONE DALLE PLAYLIST CONDIVISE ('playlist_condivise')
        // Rimuove la playlist se il suo ID coincide oppure se l'idOriginale coincide
        const condivise = JSON.parse(localStorage.getItem('playlist_condivise')) || [];
        const condiviseAggiornate = condivise.filter(pc => pc.id !== id && pc.idOriginale !== id);
        localStorage.setItem('playlist_condivise', JSON.stringify(condiviseAggiornate));
        
        // 4. Ricarica la griglia per aggiornare la visualizzazione
        mostraPlaylists();
    }
}

// Restituisce tutte le playlist salvate nel browser
function getTutteLePlaylist() {
    return JSON.parse(localStorage.getItem('playlist'));
}

// Restituisce solo le playlist create dall'utente attualmente loggato
function getPlaylistUtente() {
    const utenteSalvato = localStorage.getItem('utente_loggato');
    const tutte = getTutteLePlaylist();
    return tutte.filter(pl => pl.utente === utenteSalvato);
}

// Variabile temporanea per memorizzare il brano che l'utente vuole aggiungere
let branoSelezionatoCorrente = null;

// Funzione richiamata dal pulsante "+ Aggiungi a Playlist" nella card della canzone
function aggiungiAFormPlaylist(brano) {
    branoSelezionatoCorrente = brano;
    
    const utenteEmail = localStorage.getItem('utente_loggato');
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
    const miePlaylists = tutteLePlaylists.filter(pl => pl.utente === utenteEmail);

    const containerLista = document.getElementById('listaPlaylistPerAggiunta');
    
    if (miePlaylists.length === 0) {
        containerLista.innerHTML = `
            <div class="p-3 text-center text-secondary">
                Non hai ancora creato nessuna playlist.<br>
                <a href="#vista-playlist" class="text-success fw-bold text-decoration-none" data-bs-dismiss="modal">Crea prima una playlist</a>
            </div>`;
    } else {
        containerLista.innerHTML = '';
        miePlaylists.forEach(pl => {
            containerLista.innerHTML += `
                <button type="button" class="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center hover-grey" onclick="confermaAggiuntaBrano('${pl.id}')">
                    <span class="fw-semibold">${pl.titolo}</span>
                    <span class="badge bg-success rounded-pill">+ Aggiungi</span>
                </button>
            `;
        });
    }

    // Mostra il modale di scelta
    const modalElement = document.getElementById('modalAggiungiBrano');
    const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Funzione che esegue il salvataggio effettivo dentro la playlist scelta
function confermaAggiuntaBrano(playlistId) {
    if (!branoSelezionatoCorrente) return;

    let tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
    const index = tutteLePlaylists.findIndex(pl => pl.id === playlistId);

    if (index !== -1) {
        // Inizializza l'array canzoni se per caso non esiste
        if (!tutteLePlaylists[index].canzoni) {
            tutteLePlaylists[index].canzoni = [];
        }

        // Controlla se il brano è già presente nella playlist per evitare duplicati
        const esisteGia = tutteLePlaylists[index].canzoni.some(b => b.id === branoSelezionatoCorrente.id);
        
        if (esisteGia) {
            alert("Questo brano è già presente in questa playlist!");
            return;
        }

        // Aggiunge il brano
        tutteLePlaylists[index].canzoni.push(branoSelezionatoCorrente);

        // Salva nel localStorage
        localStorage.setItem('playlist', JSON.stringify(tutteLePlaylists));

        // NUOVO: Sincronizza con la bacheca condivisioni
        sincronizzaPlaylistCondivise(tutteLePlaylists[index]);

        // Chiude il modale
        const modalElement = document.getElementById('modalAggiungiBrano');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        alert(`Brano "${branoSelezionatoCorrente.titolo}" aggiunto con successo alla playlist "${tutteLePlaylists[index].titolo}"!`);
    }

    branoSelezionatoCorrente = null;
}

// Funzione per aprire e visualizzare i dettagli della playlist occupando tutta la dashboard
function apriPlaylist(id) {
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
    const playlist = tutteLePlaylists.find(pl => pl.id === id);
    
    if (!playlist) {
        alert("Playlist non trovata.");
        return;
    }

    const contenitore = document.getElementById('griglia-playlist');
    if (!contenitore) return;

    // Genera i badge per i tag della playlist
    const tagHTML = playlist.tag ? playlist.tag.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('') : '';

    // Genera le righe della tabella con le specifiche richieste dal PDF
    let canzoniHTML = '';
    if (!playlist.canzoni || playlist.canzoni.length === 0) {
        canzoniHTML = `<tr><td colspan="7" class="text-center text-secondary py-4">Nessuna canzone presente in questa playlist. Cerca e aggiungi dei brani!</td></tr>`;
    } else {
        playlist.canzoni.forEach((canzone) => {
            canzoniHTML += `
                <tr>
                    <td class="align-middle text-center" style="width: 60px;">
                        ${canzone.copertina ? `<img src="${canzone.copertina}" alt="Cover" width="40" height="40" class="rounded">` : '<div class="bg-secondary rounded mx-auto" style="width:40px;height:40px;"></div>'}
                    </td>
                    <td class="align-middle fw-bold text-white">${canzone.titolo || 'N/D'}</td>
                    <td class="align-middle text-light">${canzone.cantante || 'N/D'}</td>
                    <td class="align-middle text-light">${canzone.genere || 'Non specificato'}</td>
                    <td class="align-middle text-light">${canzone.durata || 'N/D'}</td>
                    <td class="align-middle text-light">${canzone.anno || 'N/D'}</td>
                    <td class="align-middle text-end" style="width: 80px;">
                        <button class="btn btn-outline-danger btn-sm" onclick="rimuoviBranoDaPlaylist('${playlist.id}', '${canzone.id}')" title="Rimuovi brano">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Renderizza la vista a tutta larghezza (container-fluid)
    contenitore.innerHTML = `
        <div class="container-fluid px-0 w-100">
            <div class="card bg-dark text-white border-secondary shadow-lg p-4 w-100">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <button class="btn btn-outline-light btn-sm mb-3" onclick="mostraPlaylists()">
                            <i class="bi bi-arrow-left"></i> Torna alle Playlist
                        </button>
                        <h2 class="fw-bold text-success mb-1">${playlist.titolo}</h2>
                        <p class="text-secondary mb-2">${playlist.descrizione}</p>
                        <div class="mb-2">${tagHTML}</div>
                        <small class="text-muted">Creata il: ${new Date(playlist.dataCreazione).toLocaleDateString()}</small>
                    </div>
                </div>

                <hr class="border-secondary">

                <h4 class="fw-bold mb-3 text-light">Brani in questa Playlist</h4>
                
                <!-- Contenitore con scroll verticale per liste di brani lunghe -->
                <div class="table-responsive playlist-table-container">
                    <table class="table table-dark table-hover align-middle border-secondary mb-0">
                        <thead class="sticky-top bg-dark">
                            <tr>
                                <th scope="col" style="width: 60px;">Copertina</th>
                                <th scope="col">Titolo</th>
                                <th scope="col">Cantante</th>
                                <th scope="col">Genere</th>
                                <th scope="col">Durata</th>
                                <th scope="col">Anno</th>
                                <th scope="col" class="text-end" style="width: 80px;">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${canzoniHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Funzione per rimuovere una canzone dalla playlist corrente
function rimuoviBranoDaPlaylist(playlistId, branoId) {
    if (!confirm("Vuoi rimuovere questo brano dalla playlist?")) return;

    let tutteLePlaylists = JSON.parse(localStorage.getItem('playlist')) || [];
    const index = tutteLePlaylists.findIndex(pl => pl.id === playlistId);

    if (index !== -1) {
        tutteLePlaylists[index].canzoni = tutteLePlaylists[index].canzoni.filter(b => b.id !== branoId);
        localStorage.setItem('playlist', JSON.stringify(tutteLePlaylists));
        
        // NUOVO: Sincronizza la rimozione
        sincronizzaPlaylistCondivise(tutteLePlaylists[index]);
        
        // Aggiorna la vista ricaricando la schermata di dettaglio
        apriPlaylist(playlistId);
    }
}

function importaPlaylistInProfilo(idPlaylistCondivisa) {
    const utenteLoggato = localStorage.getItem('utente_loggato');
    
    if (!utenteLoggato) {
        alert("Devi effettuare il login per poter importare una playlist.");
        return;
    }

    // 1. Recupera la playlist dalla bacheca delle condivise
    const condivise = JSON.parse(localStorage.getItem('playlist_condivise')) || [];
    const playlistDaImportare = condivise.find(p => p.id === idPlaylistCondivisa);

    if (!playlistDaImportare) {
        alert("Playlist non trovata tra quelle condivise.");
        return;
    }

    // CONTROLLO 1: L'utente è l'autore della playlist?
    if (playlistDaImportare.autoreEmail === utenteLoggato) {
        alert("Non puoi importare una playlist creata da te! Fa già parte del tuo profilo.");
        return;
    }

    // 2. Recupera le playlist personali dell'utente
    const miePlaylist = JSON.parse(localStorage.getItem('playlist')) || [];

    // CONTROLLO 2: L'utente ha già importato questa playlist in precedenza?
    const giaImportata = miePlaylist.some(p => 
        p.utenteEmail === utenteLoggato && 
        (p.idOriginale === playlistDaImportare.id || 
        (p.titolo === playlistDaImportare.titolo && p.autoreOriginale === playlistDaImportare.autoreEmail))
    );

    if (giaImportata) {
        alert("Hai già importato questa playlist tra le tue playlist personali!");
        return;
    }

    // 3. Creazione della nuova playlist personale (copia indipendente nel profilo)
    const nuovaPlaylist = {
        id: 'pl_' + Date.now(), // Nuovo ID univoco per la copia personale
        idOriginale: playlistDaImportare.id, // Salva il riferimento per prevenire futuri duplicati
        autoreOriginale: playlistDaImportare.autoreEmail,
        utente: utenteLoggato, // Appartiene all'utente correntemente loggato
        titolo: playlistDaImportare.titolo,
        descrizione: playlistDaImportare.descrizione || '',
        tag: playlistDaImportare.tag || [],
        canzoni: playlistDaImportare.canzoni || playlistDaImportare.brani || []
    };

    // 4. Salva nel LocalStorage delle playlist personali
    miePlaylist.push(nuovaPlaylist);
    localStorage.setItem('playlist', JSON.stringify(miePlaylist));

    alert(`La playlist "${playlistDaImportare.titolo}" è stata importata con successo nella tua libreria!`);
}