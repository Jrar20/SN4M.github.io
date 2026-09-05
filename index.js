// Aspettiamo che la pagina sia completamente caricata
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    // Controlliamo che il form esista nella pagina attuale
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            // 1. Blocca il ricaricamento automatico della pagina
            e.preventDefault(); 

            // 2. Recupera i valori inseriti dall'utente
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('psw').value.trim();

            // 3. Recupera gli utenti già salvati nel Web Storage
            let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti'));

            if (utentiSalvati === null) {
                alert("Non ci sono utenti salvati!");
                return;
            }

            // 4. Controllo se l'email e password ci sono
            const emailEsistente = utentiSalvati.find(utente => utente.email === email);
            const passwordEsistente = utentiSalvati.find(utente => utente.password === password);
            if (emailEsistente && passwordEsistente) {
                // Memorizziamo l'email di chi si sta accedendo. 
                // Ci servirà nelle prossime pagine per ritrovare questo specifico utente e aggiornarlo nel caso
                localStorage.setItem('utente_loggato', email);

                // Reindirizzamento alla pagina home
                window.location.href = 'home.html';
            } else {
                document.getElementById("errEmailPsw").classList.remove("d-none");
                return; // Interrompe la funzione
            }
        });
    }
});

function togglePassword() {
  const input = document.getElementById("psw");
  // Se il tipo è password diventa text, altrimenti torna password
  input.type = input.type === "password" ? "text" : "password";
}