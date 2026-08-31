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
                //customAlert("Non ci sono utenti salvati!");
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
                customAlert("Email o password errata!");
                return; // Interrompe la funzione
            }
        });
    }
});

window.customAlert = function(messaggio) {
    const dialog = document.createElement('dialog');
    // Applica direttamente le classi scure di Bootstrap che già usi
    dialog.className = "bg-dark text-white rounded-4 border border-secondary shadow-lg p-0";
    dialog.style.minWidth = "300px";
    
    dialog.innerHTML = `
        <div class="p-4 text-center">
            <p class="mb-4 fs-5 fw-semibold">${messaggio}</p>
            <form method="dialog">
                <button class="btn btn-success rounded-pill px-4 fw-bold shadow-none">OK</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal(); // Mostra il popup oscurando lo sfondo
    
    // Si autodistrugge quando l'utente clicca OK
    dialog.addEventListener('close', () => dialog.remove());
}

function togglePassword() {
  const input = document.getElementById("psw");
  // Se il tipo è password diventa text, altrimenti torna password
  input.type = input.type === "password" ? "text" : "password";
}