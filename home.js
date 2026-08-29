document.addEventListener('DOMContentLoaded', () => {
    const inputRicerca = document.querySelector('.search-group input');
    const navbar = document.querySelector('.topbar-musica');

    if (inputRicerca && navbar) {
        // Quando l'utente tocca la barra di ricerca
        inputRicerca.addEventListener('focus', () => {
            // Applica l'effetto solo se lo schermo è quello di un telefono
            if (window.innerWidth < 768) {
                navbar.classList.add('search-expanded');
            }
        });

        // Quando l'utente tocca fuori (deseleziona)
        inputRicerca.addEventListener('blur', () => {
            navbar.classList.remove('search-expanded');
        });
    }
});