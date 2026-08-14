

const clientId = "5ab00f23703146009915fd12013c5b01";
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
)
