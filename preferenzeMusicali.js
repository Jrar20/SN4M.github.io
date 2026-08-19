// Array globale che conterrà i generi scelti dall'utente
let preferenzeMusicali = [];

// Selezioniamo tutte le card presenti nella griglia
const cards = document.querySelectorAll('.griglia .card');

cards.forEach(card => {
    card.addEventListener('click', () => {
        // 1. Attiva/Disattiva la classe 'selected'
        card.classList.toggle('selected');

        // 2. Recupera tutte le card attualmente selezionate
        const cardSelezionate = document.querySelectorAll('.griglia .card.selected');

        // 3. Estrae il testo dell'h5 (.card-title) da ogni card selezionata
        preferenzeMusicali = Array.from(cardSelezionate).map(item => {
            return item.querySelector('.card-title').textContent.trim();
        });

        // Stampa l'array aggiornato in console (F12 per verificarlo)
        console.log('Preferenze musicali aggiornate:', preferenzeMusicali);
    });
});

document.getElementById('btnSalvaGeneri').addEventListener('click', () => {
    if (preferenzeMusicali.length === 0) {
        alert('Seleziona almeno un genere musicale!');
        return;
    }

    // Salva l'array nel browser in formato testo (JSON)
    localStorage.setItem('userGenres', JSON.stringify(preferenzeMusicali));

    
});