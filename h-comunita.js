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
        const tagHTML = c.tag.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('');
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
                            
                            <!-- Pulsante Unisciti / Lascia -->
                            <div>
                                ${sonoMembro ? 
                                    `<button class="btn btn-outline-danger btn-sm" onclick="gestisciIscrizioneComunita('${c.id}', 'lascia')">Lascia</button>` : 
                                    `<button class="btn btn-success btn-sm" onclick="gestisciIscrizioneComunita('${c.id}', 'uniti')">Unisciti</button>`
                                }
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
function gestisciIscrizioneComunita(id, azione) {
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
        mostraComunita();
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