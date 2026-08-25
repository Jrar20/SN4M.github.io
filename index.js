/*const clientId = "5ab00f23703146009915fd12013c5b01";
const clientSecret = "f726d49ee5dc418c96e26cdf03b6acb2";
var url = "https://accounts.spotify.com/api/token"

// Prepariamo i dati da inviare
const dettagli = new URLSearchParams({
  grant_type: "client_credentials",
  client_id: clientId,
  client_secret: clientSecret
});

// Inviamo la richiesta a Spotify
fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: dettagli.toString()
    })
    .then(risposta => risposta.json())
    .then(dati => {
    console.log("Ecco il tuo access token:", dati.access_token);
    })
    .catch(errore => {
    console.error("C'è stato un errore:", errore);
});



fetch(url, {
    method: "POST",
    headers: {
    Authorization: "Basic " +
    btoa(`${clientId}:${clientSecret}`),
    "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    })
    .then((response) => response.json())
    .then((tokenResponse) =>
    console.log(tokenResponse.access_token)
    //Sarebbe opportuno salvare il token nel local storage
)*/


// Aspettiamo che la pagina sia completamente caricata
document.addEventListener('DOMContentLoaded', () => {
    const formRegistrazione = document.getElementById('form-registrazione');

    // Controlliamo che il form esista nella pagina attuale
    if (formRegistrazione) {
        formRegistrazione.addEventListener('submit', (e) => {
            // 1. Blocca il ricaricamento automatico della pagina
            e.preventDefault(); 

            // 2. Recupera i valori inseriti dall'utente
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // 3. Recupera gli utenti già salvati nel Web Storage, o crea un array vuoto
            // (Ricorda: localStorage salva solo stringhe, quindi usiamo JSON.parse)
            let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti')) || [];

            // 4. Controllo se l'email è già stata usata
            const emailEsistente = utentiSalvati.find(utente => utente.email === email);
            if (emailEsistente) {
                alert("Questa email è già registrata. Vai al login!");
                return; // Interrompe la funzione
            }

            // 5. Crea l'oggetto per il nuovo utente (lasciamo vuoti i campi che riempiremo dopo)
            const datiUtente = {
                username: username,
                email: email,
                password: password,
                preferenzeMusicali: [], // Lo riempiremo nella prossima pagina
                artistiPreferiti: []    // Lo riempiremo in quella successiva ancora
            };

            // 6. Aggiunge l'utente all'array e lo salva nel Local Storage
            utentiSalvati.push(datiUtente);
            localStorage.setItem('sn4m_utenti', JSON.stringify(utentiSalvati));

            // ---> NOVITÀ FONDAMENTALE <---
            // Memorizziamo l'email di chi si sta registrando adesso. 
            // Ci servirà nelle prossime pagine per ritrovare questo specifico utente e aggiornarlo!
            localStorage.setItem('utente_in_registrazione', email);

            // 7. Reindirizzamento alla pagina delle preferenze
            window.location.href = 'preferenzeMusicali.html';
        });
    }
});
