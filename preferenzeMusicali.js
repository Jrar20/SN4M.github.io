document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONTROLLO UTENTE ---
    const emailUtenteAttuale = localStorage.getItem('utente_in_registrazione');
    if (!emailUtenteAttuale) {
        alert("Nessun utente in fase di registrazione. Torna alla pagina iniziale.");
        window.location.href = 'index.html';
        return;
    }

    // --- 2. GESTIONE SELEZIONE CARD ---
    let preferenzeMusicali = [];
    const cards = document.querySelectorAll('.griglia .card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            const cardSelezionate = document.querySelectorAll('.griglia .card.selected');
            preferenzeMusicali = Array.from(cardSelezionate).map(item => item.querySelector('.card-title').textContent.trim());
        });
    });

    // --- 3. FUNZIONAMENTO DELLA BARRA DI RICERCA ---
    // Prendi l'input di ricerca
    const inputRicerca = document.querySelector('input[type="search"]');
    
    // Ascoltiamo ogni volta che l'utente digita un tasto nell'input
    inputRicerca.addEventListener('input', (e) => {
        const testoCercato = e.target.value.toLowerCase(); // Converti in minuscolo per confronto facile

        // Controlla ogni card
        cards.forEach(card => {
            const titoloGenere = card.querySelector('.card-title').textContent.toLowerCase();
            
            // Se il titolo del genere include il testo cercato, mostra la card, altrimenti nascondila
            if (titoloGenere.includes(testoCercato)) {
                card.style.display = 'block'; // Mostra (o flex, a seconda del tuo CSS)
            } else {
                card.style.display = 'none'; // Nascondi
            }
        });
    });

    // Blocca il comportamento di default del form di ricerca (così non ricarica la pagina se si preme Invio)
    const formRicerca = document.querySelector('form[role="search"]');
    if (formRicerca) {
        formRicerca.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    // --- 4. SALVATAGGIO DEI DATI ---
    // Quando clicca "Successivo"
    const btnSalva = document.getElementById('btnSalvaGeneri');
    if (btnSalva) {
        btnSalva.addEventListener('click', (e) => {
            e.preventDefault();

            if (preferenzeMusicali.length === 0) {
                alert('Seleziona almeno un genere musicale!');
                return;
            }
            
            // Apriamo il "database" del Web Storage
            let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti')) || [];

            // Troviamo la posizione esatta del nostro utente tramite la sua email
            const indice = utentiSalvati.findIndex(u => u.email === emailUtenteAttuale);

            if (indice !== -1) {

                // 5. Aggiungiamo i generi al SUO profilo
                utentiSalvati[indice].preferenzeMusicali = preferenzeMusicali;

                // 6. Salviamo tutto di nuovo nel Web Storage
                localStorage.setItem('sn4m_utenti', JSON.stringify(utentiSalvati));

                // 7. Andiamo all'ultima pagina (artisti/gruppi)
                window.location.href = 'preferenzeArtisti.html';
            }
        });
    }
});