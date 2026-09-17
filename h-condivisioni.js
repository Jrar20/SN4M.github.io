// Funzione per popolare le select del modale di condivisione
function preparaModalCondividi() {
    const utenteEmail = localStorage.getItem('utente_loggato');
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
    const tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];

    // Filtra solo le playlist di proprietà dell'utente
    const miePlaylists = tutteLePlaylists.filter(pl => pl.utente === utenteEmail);
    // Filtra solo le comunità in cui l'utente risulta iscritto[cite: 8]
    const mieComunita = tutteLeComunita.filter(c => c.membri && c.membri.includes(utenteEmail));

    const selectPlaylist = document.getElementById('selectMiaPlaylist');
    const selectComunita = document.getElementById('selectComunitaDestinazione');

    // Popolamento select Playlist
    if (miePlaylists.length === 0) {
        selectPlaylist.innerHTML = '<option value="" disabled selected>Nessuna playlist creata</option>';
        selectPlaylist.disabled = true;
    } else {
        selectPlaylist.disabled = false;
        selectPlaylist.innerHTML = '<option value="" disabled selected>Seleziona una delle tue playlist...</option>' + 
            miePlaylists.map(pl => `<option value="${pl.id}">${pl.titolo}</option>`).join('');
    }

    // Popolamento select Comunità
    if (mieComunita.length === 0) {
        selectComunita.innerHTML = '<option value="" disabled selected>Non sei iscritto a nessuna comunità</option>';
        selectComunita.disabled = true;
    } else {
        selectComunita.disabled = false;
        selectComunita.innerHTML = '<option value="" disabled selected>Seleziona una comunità di destinazione...</option>' + 
            mieComunita.map(c => `<option value="${c.id}">${c.titolo}</option>`).join('');
    }
}

// Funzione per elaborare e salvare la condivisione nel LocalStorage
function confermaCondivisionePlaylist() {
    const idPlaylist = document.getElementById('selectMiaPlaylist').value;
    const idComunita = document.getElementById('selectComunitaDestinazione').value;

    if (!idPlaylist || !idComunita) {
        alert("Seleziona sia una playlist che una comunità.");
        return;
    }

    const utenteEmail = localStorage.getItem('utente_loggato');
    const tutteLePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
    const tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    let playlistCondivise = JSON.parse(localStorage.getItem('playlist_condivise')) || [];

    // Recupero degli oggetti originali per estrarre i dati
    const playlistDaCondividere = tutteLePlaylists.find(pl => pl.id === idPlaylist);
    const comunitaDestinazione = tutteLeComunita.find(c => c.id === idComunita);

    if (!playlistDaCondividere || !comunitaDestinazione) {
        alert("Errore nel recupero dei dati.");
        return;
    }

    // Controllo per evitare che lo stesso utente pubblichi la stessa playlist due volte nella stessa comunità
    const giaCondivisa = playlistCondivise.some(pc => pc.idPlaylistOriginale === idPlaylist && pc.idComunita === idComunita);
    if (giaCondivisa) {
        alert("Hai già condiviso questa playlist in questa comunità.");
        return;
    }

    // Creazione del nuovo oggetto condivisione clonando i dati statici al momento della pubblicazione[cite: 8]
    const nuovaCondivisione = {
        id: 'share_' + Date.now(),
        idPlaylistOriginale: playlistDaCondividere.id,
        idComunita: comunitaDestinazione.id,
        titoloComunita: comunitaDestinazione.titolo,
        autoreEmail: utenteEmail,
        titolo: playlistDaCondividere.titolo,
        descrizione: playlistDaCondividere.descrizione,
        tag: playlistDaCondividere.tag || [],
        canzoni: playlistDaCondividere.canzoni || [],
        dataCondivisione: new Date().toISOString()
    };

    // Salvataggio nel web storage[cite: 8]
    playlistCondivise.push(nuovaCondivisione);
    localStorage.setItem('playlist_condivise', JSON.stringify(playlistCondivise));

    // Chiusura del modale Bootstrap
    const modalElement = document.getElementById('modalCondividiPlaylist');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();

    // Reset del form per utilizzi futuri
    document.getElementById('formCondividiPlaylist').reset();

    // Ricarica la vista della bacheca se la funzione è già stata creata
    if (typeof mostraCondivisioni === 'function') {
        mostraCondivisioni();
    } else {
        alert(`Playlist "${nuovaCondivisione.titolo}" condivisa con successo nella comunità "${nuovaCondivisione.titoloComunita}"!`);
    }
}

// Funzione per mostrare le condivisioni relative alle comunità dell'utente
function mostraCondivisioni() {
    const utenteEmail = localStorage.getItem('utente_loggato');
    const tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    const tutteLeCondivisioni = JSON.parse(localStorage.getItem('playlist_condivise')) || [];
    const filtroComunita = document.getElementById('filtroComunitaCondivisioni');
    const griglia = document.getElementById('griglia-condivisioni');

    if (!griglia) return;

    // Filtra solo le comunità a cui l'utente appartiene
    const mieComunita = tutteLeComunita.filter(c => c.membri && c.membri.includes(utenteEmail));
    const idsMieComunita = mieComunita.map(c => c.id);

    // Aggiorna e popola dinamicamente il filtro delle comunità
    if (filtroComunita) {
        const valoreSelezionato = filtroComunita.value || 'tutte';
        filtroComunita.innerHTML = '<option value="tutte">Tutte le mie comunità</option>' +
            mieComunita.map(c => `<option value="${c.id}">${c.titolo}</option>`).join('');
        
        // Mantiene la selezione precedente se ancora valida
        if (mieComunita.some(c => c.id === valoreSelezionato)) {
            filtroComunita.value = valoreSelezionato;
        } else {
            filtroComunita.value = 'tutte';
        }
    }

    const idComunitaSelezionata = filtroComunita ? filtroComunita.value : 'tutte';

    // Filtra le playlist: mostra solo quelle appartenenti alle comunità dell'utente
    const condivisioniVisibili = tutteLeCondivisioni.filter(pc => {
        const faParteDelleMieComunita = idsMieComunita.includes(pc.idComunita);
        if (!faParteDelleMieComunita) return false;

        if (idComunitaSelezionata !== 'tutte') {
            return pc.idComunita === idComunitaSelezionata;
        }
        return true;
    });

    // Se non ci sono condivisioni visualizza messaggio vuoto
    if (condivisioniVisibili.length === 0) {
        griglia.innerHTML = `
            <div class="col-12 text-center py-5 text-secondary">
                <i class="bi bi-music-note-list display-1 mb-3 d-block"></i>
                <p class="fs-5 mb-0">Nessuna playlist condivisa trovata nelle tue comunità.</p>
            </div>`;
        return;
    }

    // Generazione dinamica delle card
    griglia.innerHTML = condivisioniVisibili.map(pc => {
        const eAutore = pc.autoreEmail === utenteEmail;
        const tagHTML = pc.tag && pc.tag.length > 0 
            ? pc.tag.map(t => `<span class="badge bg-secondary me-1 mb-1">${t}</span>`).join('') 
            : '';
        const numBrani = pc.canzoni ? pc.canzoni.length : 0;
        const dataFormattata = pc.dataCondivisione 
            ? new Date(pc.dataCondivisione).toLocaleDateString() 
            : 'Recente';

        return `
            <div class="col">
                <div class="card h-100 bg-dark text-white border-secondary shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge bg-success text-truncate" style="max-width: 150px;">
                                <i class="bi bi-people-fill me-1"></i>${pc.titoloComunita}
                            </span>
                            <small class="text-secondary">${dataFormattata}</small>
                        </div>
                        <h5 class="card-title fw-bold text-truncate">${pc.titolo}</h5>
                        <p class="card-subtitle mb-2 text-secondary small">
                            Condivisa da: <strong class="text-light">${pc.autoreEmail}</strong>
                        </p>
                        <p class="card-text text-secondary small flex-grow-1">${pc.descrizione || 'Nessuna descrizione.'}</p>
                        <div class="mb-3">
                            ${tagHTML}
                        </div>
                        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary mt-auto">
                            <span class="small text-secondary"><i class="bi bi-disc me-1"></i>${numBrani} brani</span>
                            ${eAutore 
                                ? `<span class="badge bg-dark text-secondary border border-secondary">Tua condivisione</span>`
                                : `<button class="btn btn-outline-success btn-sm fw-semibold" onclick="importaPlaylistInProfilo('${pc.id}')">
                                    <i class="bi bi-download me-1"></i> Importa
                                   </button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Funzione richiamata al cambio valore della select filtro
function filtraCondivisioniPerComunita() {
    mostraCondivisioni();
}

// Funzione per clonare una playlist condivisa nel proprio profilo utente
function importaPlaylistInProfilo(idCondivisa) {
    const utenteEmail = localStorage.getItem('utente_loggato');
    if (!utenteEmail) {
        alert("Devi effettuare il login per importare una playlist.");
        return;
    }

    const tutteLeCondivisioni = JSON.parse(localStorage.getItem('playlist_condivise')) || [];
    const condivisione = tutteLeCondivisioni.find(pc => pc.id === idCondivisa);

    if (!condivisione) {
        alert("Playlist condivisa non trovata.");
        return;
    }

    let miePlaylists = JSON.parse(localStorage.getItem('playlists')) || [];

    // Estraggo il nome dell'autore prima del simbolo @ per un titolo pulito
    const nomeAutore = condivisione.autoreEmail.split('@')[0];

    // Crea un nuovo oggetto playlist indipendente salvato a nome dell'utente loggato
    const nuovaPlaylist = {
        id: 'pl_' + Date.now(),
        utente: utenteEmail,
        titolo: `${condivisione.titolo} (da ${nomeAutore})`,
        descrizione: `Importata dalla comunità "${condivisione.titoloComunita}". ${condivisione.descrizione || ''}`.trim(),
        tag: Array.isArray(condivisione.tag) ? [...condivisione.tag] : [],
        canzoni: Array.isArray(condivisione.canzoni) ? [...condivisione.canzoni] : [],
        dataInserimento: new Date().toISOString()
    };

    miePlaylists.push(nuovaPlaylist);
    localStorage.setItem('playlists', JSON.stringify(miePlaylists));

    alert(`La playlist "${condivisione.titolo}" è stata importata con successo nella tua libreria!`);

    // Aggiorna la vista delle playlist personali se attiva
    if (typeof mostraMiePlaylists === 'function') {
        mostraMiePlaylists();
    }
}