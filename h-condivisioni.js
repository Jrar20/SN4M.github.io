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