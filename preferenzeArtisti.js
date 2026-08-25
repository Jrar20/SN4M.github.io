// --- 1. CONFIGURAZIONE E CREDENZIALI ---
// INSERISCI QUI LE TUE CHIAVI
const client_id = "5ab00f23703146009915fd12013c5b01";
const client_secret = "f726d49ee5dc418c96e26cdf03b6acb2";

// Artisti mostrati al caricamento della pagina
const artistiDefault = [
    "Taylor Swift", "Bad Bunny", "Drake", "The Weeknd", "Ariana Grande", "Ed Sheeran",
    "Justin Bieber", "Eminem", "Kanye West", "Rihanna", "Coldplay", "Bruno Mars"
];

// Variabile globale per salvare la lista degli artisti selezionati
let preferenzeArtisti = []; 

// --- 2. GESTIONE AUTENTICAZIONE (Con salvataggio e scadenza) ---
async function ottieniTokenSpotify() {
    const tokenSalvato = localStorage.getItem('spotify_token');
    const scadenzaToken = localStorage.getItem('spotify_token_expires');

    // Se esiste un token e la data di scadenza (in millisecondi) non è ancora passata, usiamo quello!
    if (tokenSalvato && scadenzaToken && Date.now() < parseInt(scadenzaToken)) {
        return tokenSalvato;
    }

    // Se non c'è, è scaduto, o mancano i dati, ne chiediamo uno nuovo
    const url = "https://accounts.spotify.com/api/token";
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + btoa(`${client_id}:${client_secret}`),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
        });

        const tokenResponse = await response.json();
        
        // Calcoliamo il timestamp esatto in cui scadrà (ora attuale + 3600 secondi)
        const scadenzaInMillisecondi = Date.now() + (tokenResponse.expires_in * 1000);
        
        // Salviamo tutto nel Local Storage
        localStorage.setItem('spotify_token', tokenResponse.access_token);
        localStorage.setItem('spotify_token_expires', scadenzaInMillisecondi.toString());

        return tokenResponse.access_token;
    } catch (error) {
        console.error("Errore nel recupero del token:", error);
        return null;
    }
}

// --- 3. FUNZIONI DI SUPPORTO ---

// Crea l'HTML di una singola card
function generaCardHTML(artista) {
    const nomeVerificato = artista.name;
    const idSpotify = artista.id;
    const imageUrl = artista.images.length > 0 ? artista.images[0].url : 'immagini/musicgender.png';

    // Controlliamo se l'artista è già nella nostra lista dei preferiti, 
    // così se facciamo una ricerca la card resta visivamente "selezionata"
    const isSelected = preferenzeArtisti.some(a => a.id === idSpotify) ? 'selected' : '';

    return `
        <div class="card text-white artist-card ${isSelected}" data-id="${idSpotify}" style="cursor: pointer;">
            <img src="${imageUrl}" class="card-img-top" alt="${nomeVerificato}" style="height: 200px; object-fit: cover;">
            <div class="card-body text-center">
                <h5 class="card-title">${nomeVerificato}</h5>
            </div>
        </div>
    `;
}

// Chiama le API di Spotify per cercare il nome di un artista
async function fetchDatiArtista(nomeArtista, token) {
    try {
        const query = encodeURIComponent(nomeArtista);
        const url = `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`;
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();

        if (data.artists && data.artists.items.length > 0) {
            return data.artists.items[0]; // Restituisce l'oggetto artista grezzo
        }
    } catch (error) {
        console.error(`Errore caricamento ${nomeArtista}:`, error);
    }
    return null;
}

// --- 4. FUNZIONI PRINCIPALI (Caricamento e Ricerca) ---

// Carica la griglia iniziale
async function caricaArtistiIniziali() {
    const griglia = document.querySelector('.griglia');
    griglia.innerHTML = '<p class="text-center w-100 mt-5">Caricamento artisti in corso...</p>';

    const token = await ottieniTokenSpotify();
    if (!token) return;

    // Chiamate parallele
    const promesseArtisti = artistiDefault.map(nome => fetchDatiArtista(nome, token));
    const risultatiArtisti = await Promise.all(promesseArtisti);

    // Unisce tutte le card generate
    const htmlCompleto = risultatiArtisti
        .filter(artista => artista !== null)
        .map(artista => generaCardHTML(artista))
        .join('');

    griglia.innerHTML = htmlCompleto;
}

// Cerca artisti specifici tramite la barra
async function eseguiRicerca(testoCercato) {
    const griglia = document.querySelector('.griglia');
    griglia.innerHTML = '<p class="text-center w-100 mt-5">Ricerca in corso...</p>';

    const token = await ottieniTokenSpotify();
    if (!token) return;

    try {
        const query = encodeURIComponent(testoCercato);
        // Cerchiamo 10 risultati correlati alla parola inserita dall'utente
        const url = `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=10`;
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();

        if (data.artists && data.artists.items.length > 0) {
            const htmlCompleto = data.artists.items
                .map(artista => generaCardHTML(artista))
                .join('');
            griglia.innerHTML = htmlCompleto;
        } else {
            griglia.innerHTML = '<p class="text-center w-100 mt-5">Nessun artista trovato. Riprova!</p>';
        }
    } catch (error) {
        console.error("Errore durante la ricerca:", error);
    }
}

// --- 5. GESTIONE EVENTI (Al caricamento della pagina) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Controllo base utente
    const emailUtenteAttuale = localStorage.getItem('utente_in_registrazione');
    if (!emailUtenteAttuale) {
        alert("Nessun utente in fase di registrazione. Torna alla home.");
        window.location.href = 'index.html';
        return;
    }

    // 2. Caricamento Default
    caricaArtistiIniziali();

    // 3. Gestione click sulle card (Event Delegation)
    const griglia = document.querySelector('.griglia');
    griglia.addEventListener('click', (event) => {
        const cardCliccata = event.target.closest('.card');
        
        if (cardCliccata) {
            cardCliccata.classList.toggle('selected');
            
            const idSpotify = cardCliccata.dataset.id;
            const nomeVerificato = cardCliccata.querySelector('.card-title').textContent.trim();

            if (cardCliccata.classList.contains('selected')) {
                // Aggiungiamo l'artista all'array se non è già presente
                if (!preferenzeArtisti.some(a => a.id === idSpotify)) {
                    preferenzeArtisti.push({ id: idSpotify, nome: nomeVerificato });
                }
            } else {
                // Rimuoviamo l'artista dall'array
                preferenzeArtisti = preferenzeArtisti.filter(a => a.id !== idSpotify);
            }
        }
    });

    // 4. Gestione Barra di Ricerca
    const bottoneCerca = document.querySelector('form button[type="submit"]:first-of-type');
    const inputRicerca = document.querySelector('input[type="search"]');
    
    if (bottoneCerca) {
        bottoneCerca.addEventListener('click', (e) => {
            e.preventDefault(); 
            const testo = inputRicerca.value.trim();
            if (testo !== '') {
                eseguiRicerca(testo);
            } else {
                caricaArtistiIniziali(); // Se fa "Cerca" su campo vuoto, torna ai default
            }
        });
    }

    // 5. Salvataggio finale e chiusura
    const btnSalva = document.getElementById('btnSalvaGeneri');
    if (btnSalva) {
        btnSalva.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            if (preferenzeArtisti.length === 0) {
                alert('Seleziona almeno un artista o gruppo musicale!');
                return;
            }

            let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti')) || [];
            const indice = utentiSalvati.findIndex(u => u.email === emailUtenteAttuale);

            if (indice !== -1) {
                utentiSalvati[indice].preferenzeArtisti = preferenzeArtisti;
                localStorage.setItem('sn4m_utenti', JSON.stringify(utentiSalvati));
                
                // SOSTITUISCI QUESTO URL CON LA TUA PROSSIMA PAGINA
                window.location.href = 'home.html'; 
            }
        });
    }
});