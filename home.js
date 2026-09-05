// --- CREDENZIALI ---
const client_id = "5ab00f23703146009915fd12013c5b01";
const client_secret = "f726d49ee5dc418c96e26cdf03b6acb2";

document.addEventListener('DOMContentLoaded', () => {
    // CONTROLLO ACCESSO
    const emailLoggata = localStorage.getItem('utente_loggato');
    if (!emailLoggata) {
        window.location.href = 'login.html';
        return;
    }

    // --- GESTIONE LOGOUT ---
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('utente_loggato');
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_token_expires');
            window.location.href = 'index.html';
        });
    }

    const inputRicerca = document.querySelector('.search-group input');
    const navbar = document.querySelector('.topbar-musica');
    const isMobile = window.matchMedia('(max-width: 767.98px)');

    // Gestione barra di ricerca mobile
    if (inputRicerca && navbar) {
        inputRicerca.addEventListener('focus', () => {
            if (isMobile.matches) navbar.classList.add('search-expanded');
        });
        inputRicerca.addEventListener('blur', () => {
            navbar.classList.remove('search-expanded');
        });
    }

    // Modali
    const modalNuovaPlaylist = document.getElementById('modalNuovaPlaylist');
    if (modalNuovaPlaylist) {
        modalNuovaPlaylist.addEventListener('hide.bs.modal', () => {
            if (document.activeElement) document.activeElement.blur();
        });
    }
    const modalAggiungiBrano = document.getElementById('modalAggiungiBrano');
    if (modalAggiungiBrano) {
        modalAggiungiBrano.addEventListener('hide.bs.modal', () => {
            if (document.activeElement) document.activeElement.blur();
        });
    }

    // Intercetta i click sui link della sidebar (per gestire il reset della ricerca)
    document.querySelectorAll('.nav-link-app').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetHash = this.getAttribute('href');
            if (window.location.hash === targetHash) {
                e.preventDefault();
                const inputRicercaBarra = document.getElementById('id-input-ricerca');
                if (inputRicercaBarra) {
                    inputRicercaBarra.value = '';
                }
                aggiornaVistaDaHash();
            }
        });
    });

    // 1. Carica la vista e i dati corretti all'apertura della pagina
    aggiornaVistaDaHash();

    // 2. Token Spotify
    ottieniTokenSpotify();
});

// Ascolta il cambio di URL (#)
window.addEventListener('hashchange', aggiornaVistaDaHash);

function aggiornaVistaDaHash() {
    let vistaDaHash = window.location.hash.replace('#', '');

    if (!vistaDaHash || !document.getElementById(vistaDaHash)) {
        vistaDaHash = 'vista-riepilogo';
    }

    // 1. Gestione visibilità delle sezioni
    document.querySelectorAll('.sezione-app').forEach(sezione => {
        if (sezione.id === vistaDaHash) {
            sezione.classList.remove('d-none');
        } else {
            sezione.classList.add('d-none');
        }
    });

    // 2. Gestione classi attive su sidebar e barra mobile
    document.querySelectorAll('.nav-link-app').forEach(link => {
        const eAttivo = link.getAttribute('href') === `#${vistaDaHash}`;
        
        if (eAttivo) {
            link.classList.add('active');
            if (link.closest('.sidebar')) {
                link.classList.add('bg-secondary', 'bg-opacity-25');
            }
        } else {
            link.classList.remove('active', 'bg-secondary', 'bg-opacity-25');
        }
    });

    // 3. AGGIORNAMENTO DINAMICO DEI CONTENUTI A SECONDA DELLA VISTA
    if (vistaDaHash === 'vista-playlist') {
        if (typeof mostraPlaylists === 'function') {
            mostraPlaylists();
        }
    } else if (vistaDaHash === 'vista-comunita') {
        // Sostituisci 'mostraComunita' con il nome reale della funzione che usi in h-comunita.js
        if (typeof mostraComunita === 'function') {
            mostraComunita(); 
        }
    } else if (vistaDaHash === 'vista-condivisioni') {
        // Sostituisci 'mostraCondivisioni' con il nome reale della funzione in h-condivisioni.js
        if (typeof mostraCondivisioni === 'function') {
            mostraCondivisioni(); 
        }
    }
}

function getNomeUtente() {
    let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti')) || [];
    const emailUtenteAttuale = localStorage.getItem('utente_loggato');
    const indice = utentiSalvati.findIndex(u => u.email === emailUtenteAttuale);

    if (indice !== -1) {
        return utentiSalvati[indice].username;
    } else {
        alert("Errore nel trovare l'utente loggato");
    }
}

// --- GESTIONE AUTENTICAZIONE SPOTIFY ---
async function ottieniTokenSpotify() {
    let tokenSalvato = localStorage.getItem('spotify_token');
    const scadenzaToken = localStorage.getItem('spotify_token_expires');

    // Sistema di sicurezza: distrugge eventuali token corrotti rimasti in memoria
    if (!tokenSalvato || tokenSalvato === "undefined" || tokenSalvato === "null" || tokenSalvato.includes("[object")) {
        localStorage.removeItem('spotify_token');
        tokenSalvato = null;
    }

    if (tokenSalvato && scadenzaToken && Date.now() < parseInt(scadenzaToken)) {
        return tokenSalvato;
    }

    const url = "https://accounts.spotify.com/api/token";
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + btoa(`${client_id}:${client_secret}`),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) throw new Error("Errore nel recupero del token (Credenziali non valide?)");

        const tokenResponse = await response.json();
        const scadenzaInMillisecondi = Date.now() + (tokenResponse.expires_in * 1000);
        
        localStorage.setItem('spotify_token', tokenResponse.access_token);
        localStorage.setItem('spotify_token_expires', scadenzaInMillisecondi.toString());

        return tokenResponse.access_token;
    } catch (error) {
        console.error("Errore Autenticazione Spotify:", error);
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_token_expires');
        return null;
    }
}

function eseguiRicercaGenerale(event) {
    event.preventDefault();

    const contesto = document.getElementById('contestoRicerca').value;
    const query = document.getElementById('testoRicerca').value.trim();

    if (!query) return;

    document.querySelectorAll('.sezione-app').forEach(el => el.classList.add('d-none'));

    if (contesto.startsWith('canzone_')) {
        cercaSuSpotify(query, contesto);
    } else if (contesto === 'comunita') {
        cercaComunitaLocali(query);
    } else if (contesto.startsWith('playlist_')) {
        cercaPlaylistCondivise(query, contesto);
    }
}

// --- FUNZIONE DI RICERCA BRANI ---
async function cercaSuSpotify(query, tipoRicerca) {
    const token = await ottieniTokenSpotify();
    if (!token) {
        alert("Errore durante la connessione alle API di Spotify.");
        return;
    }

    let spotifyQuery = '';
    switch (tipoRicerca) {
        case 'canzone_titolo': spotifyQuery = query; break;
        case 'canzone_artista': spotifyQuery = `artist:${query}`; break;
        case 'canzone_genere': spotifyQuery = `genre:${query}`; break;
        default: spotifyQuery = query;
    }

    const queryEncoded = encodeURIComponent(spotifyQuery);
    const url = `https://api.spotify.com/v1/search?q=${queryEncoded}&type=track&limit=10`;

    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

        if (!response.ok) {
            const errorLog = await response.json();
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_token_expires');
            throw new Error(`Spotify ha rifiutato la richiesta: ${errorLog.error?.message || response.status}`);
        }

        const data = await response.json();
        const brani = data.tracks?.items || [];

        // Mappatura diretta senza chiamate API secondarie che generano errore 403
        const braniCompleti = brani.map((track) => {
            return {
                id: track.id,
                titolo: track.name,
                cantante: track.artists ? track.artists.map(a => a.name).join(', ') : 'Sconosciuto',
                genere: 'Non specificato (API Limitata)', // Fallback pulito
                durata: msToMinSec(track.duration_ms),
                anno: track.album?.release_date ? track.album.release_date.split('-')[0] : 'N/D',
                copertina: track.album?.images[0]?.url || '',
                previewUrl: track.preview_url
            };
        });

        mostraRisultatiCanzoni(braniCompleti);

    } catch (error) {
        console.error('Errore durante il recupero delle canzoni:', error);
    }
}

function msToMinSec(ms) {
    const totalSeconds = Math.round(ms / 1000);
    const minuti = Math.floor(totalSeconds / 60);
    const secondi = totalSeconds % 60;
    return `${minuti}:${secondi < 10 ? '0' : ''}${secondi}`;
}

function mostraRisultatiCanzoni(brani) {
    let container = document.getElementById('vista-risultati-ricerca');

    if (!container) {
        const main = document.querySelector('.main-content');
        container = document.createElement('div');
        container.id = 'vista-risultati-ricerca';
        container.className = 'sezione-app';
        main.appendChild(container);
    }

    container.classList.remove('d-none');

    if (brani.length === 0) {
        container.innerHTML = `<h3 class="fw-bold mb-4">Risultati della Ricerca</h3><p class="text-secondary">Nessun brano trovato su Spotify.</p>`;
        return;
    }

    let html = `
        <h3 class="fw-bold mb-4">Risultati Brani (Spotify)</h3>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
    `;

    brani.forEach(brano => {
        // Se c'è l'anteprima API mostriamo il player, altrimenti non stampiamo nulla
        const playerNativo = brano.previewUrl 
            ? `<audio controls class="w-100 mb-2" style="height: 35px;"><source src="${brano.previewUrl}" type="audio/mpeg"></audio>` 
            : ``;

        html += `
            <div class="col">
                <div class="card h-100 bg-dark text-white border-secondary shadow-sm">
                    <img src="${brano.copertina}" class="card-img-top p-2 rounded" alt="${brano.titolo}" style="height: 180px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title fw-bold text-truncate mb-1" title="${brano.titolo}">${brano.titolo}</h6>
                        <p class="card-text text-secondary small mb-1">${brano.cantante}</p>
                        <hr class="border-secondary my-2">
                        <div class="small text-secondary mb-3">
                            <div><strong>Genere:</strong> ${brano.genere}</div>
                            <div><strong>Anno:</strong> ${brano.anno}</div>
                            <div><strong>Durata:</strong> ${brano.durata} min</div>
                        </div>
                        
                        ${playerNativo}

                        <button class="btn btn-outline-success btn-sm mt-auto w-100" onclick='aggiungiAFormPlaylist(${JSON.stringify(brano).replace(/'/g, "&apos;")})'>
                            + Aggiungi a Playlist
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function cercaComunitaLocali(query) {
    console.log(`Ricerca comunità interne contenenti: ${query}`);
}

function cercaPlaylistCondivise(query, tipoRicerca) {
    console.log(`Ricerca playlist pubbliche per: ${query} (Criterio: ${tipoRicerca})`);
}