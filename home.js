document.addEventListener('DOMContentLoaded', () => {
    // CONTROLLO ACCESSO: Se non c'è la sessione, butta l'utente al login
    const emailLoggata = localStorage.getItem('utente_loggato');
    if (!emailLoggata) {
        window.location.href = 'login.html'; // Assicurati che il nome del file sia corretto
        return; // Ferma l'esecuzione di tutto il resto dello script
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

    // Gestore globale per rimuovere il focus prima che il modale si chiuda (evita l'avviso ARIA)
    const modalNuovaPlaylist = document.getElementById('modalNuovaPlaylist');
    if (modalNuovaPlaylist) {
        modalNuovaPlaylist.addEventListener('hide.bs.modal', () => {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        });
    }

    // Carica la vista corretta all'apertura della pagina
    aggiornaVistaDaHash();

    mostraPlaylists();
});

// Ascolta il cambio di URL (#): scatta una sola volta per ogni cambio schermata
window.addEventListener('hashchange', aggiornaVistaDaHash);

function aggiornaVistaDaHash() {
    let vistaDaHash = window.location.hash.replace('#', '');

    // Se l'hash non esiste o non corrisponde a una sezione valida, usa la home
    if (!vistaDaHash || !document.getElementById(vistaDaHash)) {
        vistaDaHash = 'vista-riepilogo';
    }

    // 1. Mostra solo la sezione richiesta e nascondi le altre
    document.querySelectorAll('.sezione-app').forEach(sezione => {
        if (sezione.id === vistaDaHash) {
            sezione.classList.remove('d-none');
        } else {
            sezione.classList.add('d-none');
        }
    });

    // 2. Aggiorna lo stato visivo (classe active) sui menu
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
}

function getNomeUtente() {
    let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti')) || [];
    const indice = utentiSalvati.findIndex(u => u.email === emailUtenteAttuale);

    if (indice !== -1) {
        return utentiSalvati[indice].username;
    } else {
        alert("errore nel trovare l'utente loggato");
    }
}