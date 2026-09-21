// Variabile globale per tracciare se stiamo modificando una comunità esistente
let comunitaInModificaId = null;

// Prepara il modale per una nuova comunità
function preparaNuovaComunita() {
    comunitaInModificaId = null;
    document.getElementById('formNuovaComunita').reset();
    document.getElementById('titoloModaleComunita').textContent = "Crea Comunità";
    document.getElementById('btnSalvaComunita').textContent = "Crea";
}

// Funzione per salvare o aggiornare una comunità
function salvaComunita() {
    const titolo = document.getElementById('titoloComunita').value.trim();
    const descrizione = document.getElementById('descrizioneComunita').value.trim();
    const rawTag = document.getElementById('tagComunita').value.trim();

    if (!titolo || !descrizione || !rawTag) {
        alert("Compila tutti i campi obbligatori.");
        return;
    }

    const tagArray = rawTag.split(/\s+/).map(t => t.replace(/[,#]/g, '').trim()).filter(t => t.length > 0).map(t => `#${t}`);
    if (tagArray.length === 0) return alert("Inserisci almeno un tag valido.");

    let tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    const utenteEmail = localStorage.getItem('utente_loggato');

    if (comunitaInModificaId) {
        // Modifica
        const index = tutteLeComunita.findIndex(c => c.id === comunitaInModificaId);
        if (index !== -1) {
            tutteLeComunita[index].titolo = titolo;
            tutteLeComunita[index].descrizione = descrizione;
            tutteLeComunita[index].tag = tagArray;
        }
    } else {
        // Creazione
        const nuovaComunita = {
            id: 'com_' + Date.now(),
            creatore: utenteEmail,
            titolo: titolo,
            descrizione: descrizione,
            tag: tagArray,
            membri: [utenteEmail], // Il creatore si unisce automaticamente
            dataCreazione: new Date().toISOString()
        };
        tutteLeComunita.push(nuovaComunita);
    }

    localStorage.setItem('comunita', JSON.stringify(tutteLeComunita));

    const modalElement = document.getElementById('modalNuovaComunita');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();

    mostraComunita();
}

// Funzione per visualizzare le comunità nella griglia
function mostraComunita() {
    const contenitore = document.getElementById('griglia-comunita');
    if (!contenitore) return;

    const tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    const utenteEmail = localStorage.getItem('utente_loggato');

    if (tutteLeComunita.length === 0) {
        contenitore.innerHTML = `<div class="col-12"><p class="text-secondary">Nessuna comunità disponibile al momento. Creane una tu!</p></div>`;
        return;
    }

    contenitore.innerHTML = '';

    tutteLeComunita.forEach(c => {
        const tagHTML = c.tag ? c.tag.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('') : '';
        const sonoMembro = c.membri && c.membri.includes(utenteEmail);
        const sonoCreatore = c.creatore === utenteEmail;

        const cardHTML = `
            <div class="col">
                <div class="card h-100 bg-dark text-white border-secondary shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-success">${c.titolo}</h5>
                        <p class="card-text small text-light opacity-75">${c.descrizione}</p>
                        <div class="mb-3">${tagHTML}</div>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="badge bg-dark border border-secondary text-light">Membri: ${c.membri ? c.membri.length : 1}</span>
                            
                            <!-- Azioni per la comunità -->
                            <div class="d-flex gap-2">
                                ${sonoMembro ? `
                                    <button class="btn btn-outline-info btn-sm" onclick="apriDettaglio('${c.id}')">
                                        <i class="bi bi-eye"></i> Dettagli
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="gestisciIscrizioneComunita('${c.id}', 'lascia', 'griglia')">Lascia</button>
                                ` : `
                                    <button class="btn btn-success btn-sm" onclick="gestisciIscrizioneComunita('${c.id}', 'uniti', 'griglia')">Unisciti</button>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    ${sonoCreatore ? `
                        <div class="card-footer border-secondary d-flex justify-content-end gap-2">
                            <button class="btn btn-outline-secondary btn-sm" onclick="modificaComunita('${c.id}')" title="Modifica">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="eliminaComunita('${c.id}')" title="Elimina">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        contenitore.innerHTML += cardHTML;
    });
}

// Gestione iscrizione/disiscrizione a una comunità
function gestisciIscrizioneComunita(id, azione, origine = 'griglia') {
    let tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    const index = tutteLeComunita.findIndex(c => c.id === id);
    const utenteEmail = localStorage.getItem('utente_loggato');

    if (index !== -1) {
        if (!tutteLeComunita[index].membri) {
            tutteLeComunita[index].membri = [];
        }

        if (azione === 'uniti') {
            if (!tutteLeComunita[index].membri.includes(utenteEmail)) {
                tutteLeComunita[index].membri.push(utenteEmail);
            }
        } else if (azione === 'lascia') {
            // Impedisci al creatore di abbandonare la propria comunità (o gestiscilo a piacimento)
            if (tutteLeComunita[index].creatore === utenteEmail) {
                alert("Essendo il creatore, puoi eliminare la comunità ma non abbandonarla.");
                return;
            }
            tutteLeComunita[index].membri = tutteLeComunita[index].membri.filter(m => m !== utenteEmail);
        }

        localStorage.setItem('comunita', JSON.stringify(tutteLeComunita));
        
        // Aggiorna la vista corretta in base all'origine della chiamata
        if (origine === 'ricerca') {
            // Recupera il testo attualmente cercato nella barra e riesegue la ricerca
            const barraRicerca = document.getElementById('testoRicerca'); // Assicurati che l'ID della barra di ricerca sia corretto
            const query = barraRicerca ? barraRicerca.value : '';
            cercaComunitaLocali(query);
        } else {
            mostraComunita();
        }
    }
}

// Modifica comunità
function modificaComunita(id) {
    const tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    const c = tutteLeComunita.find(com => com.id === id);
    if (!c) return;

    comunitaInModificaId = id;
    document.getElementById('titoloComunita').value = c.titolo;
    document.getElementById('descrizioneComunita').value = c.descrizione;
    document.getElementById('tagComunita').value = c.tag.map(t => t.replace('#', '')).join(' ');

    document.getElementById('titoloModaleComunita').textContent = "Modifica Comunità";
    document.getElementById('btnSalvaComunita').textContent = "Salva Modifiche";

    const modalElement = document.getElementById('modalNuovaComunita');
    const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Elimina comunità
function eliminaComunita(id) {
    if (!confirm("Sei sicuro di voler eliminare questa comunità?")) return;

    let tutteLeComunita = JSON.parse(localStorage.getItem('comunita')) || [];
    tutteLeComunita = tutteLeComunita.filter(c => c.id !== id);
    localStorage.setItem('comunita', JSON.stringify(tutteLeComunita));

    mostraComunita();
}

function apriDettaglio(id, tipoRicerca) {
    const contenitore = document.getElementById('vista-risultati-ricerca');
    if (!contenitore) return;

    // Recupera l'utente usando la tua chiave esatta
    const utenteEmail = localStorage.getItem('utente_loggato');

    if (tipoRicerca === 'Comunità') {
        const listaComunita = JSON.parse(localStorage.getItem('comunita')) || [];
        const comunita = listaComunita.find(c => c.id === id || c.titolo === id);
        
        if (!comunita) return alert("Comunità non trovata.");

        // Gestione corretta dell'array tag (come nel tuo codice)
        const tagHTML = comunita.tag ? comunita.tag.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('') : '';
        
        // Verifica se l'utente è membro usando il TUO array 'membri'
        const sonoMembro = comunita.membri && comunita.membri.includes(utenteEmail);
        const numeroMembri = comunita.membri ? comunita.membri.length : 1;
        
        // Genera il bottone corretto collegato alla tua funzione gestisciIscrizioneComunita.
        // Aggiungo la chiamata per ricaricare la vista dettaglio così il tasto si aggiorna subito.
        const azioneHTML = sonoMembro 
            ? `<button class="btn btn-outline-danger" onclick="gestisciIscrizioneComunita('${comunita.id}', 'lascia'); apriDettaglio('${comunita.id}', 'Comunità');">
                 <i class="bi bi-box-arrow-right"></i> Lascia la Comunità
               </button>`
            : `<button class="btn btn-success" onclick="gestisciIscrizioneComunita('${comunita.id}', 'uniti'); apriDettaglio('${comunita.id}', 'Comunità');">
                 <i class="bi bi-person-plus"></i> Unisciti alla Comunità
               </button>`;

        contenitore.innerHTML = `
            <div class="container-fluid px-0 w-100">
                <div class="card bg-dark text-white border-secondary shadow-lg p-4 w-100">
                    <div class="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <button class="btn btn-outline-light btn-sm mb-3" onclick="eseguiRicercaGenerale()">
                                <i class="bi bi-arrow-left"></i> Torna ai Risultati
                            </button>
                            <h2 class="fw-bold text-success mb-1">${comunita.titolo}</h2>
                            <p class="text-secondary mb-2">Creata da: ${comunita.creatore || 'Utente Sconosciuto'}</p>
                            <div class="mb-3">${tagHTML}</div>
                            
                            <!-- Aggiunto il conteggio dei membri nella vista dettaglio -->
                            <div class="mb-4">
                                <span class="badge bg-dark border border-secondary text-light">Membri iscritti: ${numeroMembri}</span>
                            </div>
                            
                            <p class="text-light mb-4">${comunita.descrizione || 'Nessuna descrizione disponibile.'}</p>
                            ${azioneHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;

    } else if (tipoRicerca === 'Playlist Condivise') {
        // [QUI RIMANE INVARIATO IL CODICE DELLE PLAYLIST DEL MESSAGGIO PRECEDENTE]
        // ... (Usa la struttura della playlist del blocco if precedente)
    }
}