document.addEventListener('DOMContentLoaded', () => {
    const formRegistrazione = document.getElementById('form-registrazione');

    if (formRegistrazione) {
        formRegistrazione.addEventListener('submit', (e) => {
            e.preventDefault(); // Blocca il ricaricamento della pagina

            // 1. Preleviamo i dati inseriti
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // 2. Recuperiamo gli utenti esistenti (o creiamo un array vuoto se è il primo)
            let utentiSalvati = JSON.parse(localStorage.getItem('sn4m_utenti')) || [];

            // Controllo: l'email esiste già?
            const emailEsistente = utentiSalvati.find(u => u.email === email);
            if (emailEsistente) {
                alert("Questa email è già registrata. Usa un'altra email o fai il login.");
                return;
            }

            // 3. Creiamo la struttura dell'utente, preparando gli spazi vuoti per i generi
            const nuovoUtente = {
                username: username,
                email: email,
                password: password,
                preferenzeMusicali: [], // Verrà riempito nella pagina successiva
                preferenzeArtisti: []    // Verrà riempito nell'ultima pagina
            };

            // 4. Salviamo l'utente nel Web Storage
            utentiSalvati.push(nuovoUtente);
            localStorage.setItem('sn4m_utenti', JSON.stringify(utentiSalvati));

            // 5. IL PASSAGGIO CHIAVE: Salviamo l'email di questo utente come "promemoria"
            // Così la pagina successiva saprà a chi assegnare i generi musicali
            localStorage.setItem('utente_in_registrazione', email);

            // 6. Andiamo alla pagina delle preferenze
            window.location.href = 'preferenzeMusicali.html';
        });
    }
});

function togglePassword() {
  const input = document.getElementById("password");
  // Se il tipo è password diventa text, altrimenti torna password
  input.type = input.type === "password" ? "text" : "password";
}