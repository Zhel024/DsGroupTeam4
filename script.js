/* global google */
/* global moment */
/* global extractWeather */
/* exported initFunction */


//Aggiungo queste event listner sull'evento di resizing della finestra per andare a gestire
//alcuni elementi grafici e rendere responsive l'applicazione
window.addEventListener('resize', responsive());



//Funzione che regola il resizing della finestra: andrà aggiunto poi al listner del resizing
function responsive(){
    'use strict';
    if(window.innerWidth <= 880){
        document.getElementById('social').style.display = 'none';
    } else {
        document.getElementById('social').style.display = 'inline';
    }

    var elementNavigation = ['homeLink', 'weatherLink', 'newsLink', 'contactLink'];
    for(var i = 0; i < elementNavigation.length; i++){
        if(window.innerWidth <= 430){
            document.getElementById(elementNavigation[i]).style.fontSize = '16pt';
        } else {
            document.getElementById(elementNavigation[i]).style.fontSize = '30pt';
        }
    }
}





//Determina la posizione attuale tramite le API di geolocalizzazione di HTML5
function actualPosition(){
    'use strict';
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(funzionePosizioneTrovata, funzioneErrorePosizione);
    } else {
        window.alert('Geolocalizzazione non disponibile');
    }
}



//Questa funzione mi permette di fare il binding dei dati: questa funzione la utilizzo all'interno della sottofunzione posizione 
//trovata in cui vado a fare il binding delle informazioni ricavate da openweather
function bindingJSON(latitudine, longitudine){
    'use strict';
    var urlOpenWeather = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latitudine +'&lon=' + longitudine + '&APPID=ee6b293d773f4fcd7e434f79bbc341f2&lang=it';
    $.getJSON(urlOpenWeather,function(meteo){
        console.log(meteo);
        var sunrise = moment(meteo.sys.sunrise * 1000);
        var sunset = moment(meteo.sys.sunset * 1000);
        var now = moment(Date.now());
        sunrise.locale('it');
        sunset.locale('it');
        now.locale('it');
        sunrise = sunrise.format('LTS');
        sunset = sunset.format('LTS');
        
        document.getElementById('windData').textContent = 'Velocità: ' + meteo.wind.speed + 'm/s';
        document.getElementById('cloudData').textContent = meteo.clouds.all;
        document.getElementById('pressureData').textContent = meteo.main.pressure + 'hpa';
        document.getElementById('humidityData').textContent = meteo.main.humidity + '%';
        document.getElementById('sunriseData').textContent = sunrise;
        document.getElementById('sunsetData').textContent = sunset;
        document.getElementById('coordsData').textContent = '[lat: ' + latitudine + '\tlng: ' + longitudine + '];';
        document.getElementById('weatherImage').src = 'http://openweathermap.org/img/w/' + meteo.weather[0].icon + '.png';
    
        document.getElementById('riepilogoMeteo').textContent = meteo.weather[0].description.replace(/\b\w/g, l => l.toUpperCase()) + ' ' + parseInt(meteo.main.temp - 273.15) + ' °C ' + now.format('LT') + ' ' + now.format('ll'); 
    });
}



//Questa funzione viene richiamata se è stata trovata la posizione attuale: tramite la posizione attuale passata 
//come parametro attuale vado a crearmi la mappa da GoogleMaps e tramite il reverse Geocoding vado a ricavarmi la città
//attuale.
function funzionePosizioneTrovata(position){
    'use strict';
    if(position && position.coords){
        var latitudine = parseFloat(position.coords.latitude).toFixed(2);
        var longitudine = parseFloat(position.coords.longitude).toFixed(2);

        //Vado a salvare queste informazioni per poi il recupero futuro
        localStorage.latitudine = latitudine;
        localStorage.longitudine = longitudine;

        //Preparo le informazioni da utilizzare nella mappa
        var mapProperties = {
            center: new google.maps.LatLng(latitudine, longitudine),
            zoom: 16
        };

        var map = new google.maps.Map(document.getElementById('mappa'), mapProperties); 
        var geocoder = new google.maps.Geocoder();      //Mi serve per fare il reverseGeocoding della posizione attuale
        new google.maps.Marker({
            position: mapProperties.center,
            map: map
        });

        //Ricavo la posizione
        geocoder.geocode({'location': mapProperties.center}, function(results, status){
            if(status === 'OK'){
                if(results[0]){
                    document.getElementById('actualLocation').textContent = 'Weather in ' + results[0].address_components[2].long_name;
                } else{
                    alert('Nessun risultato trovato');
                    document.getElementById('actualLocation').textContent = 'Posizione attuale non rilevata';
                }
            } else{
                alert('Geocoding fallita ' + status);
                document.getElementById('actualLocation').textContent = 'Posizione attuale non rilevata';
            }
        });

        //Richiamo il bindingJSON per richiedere le informazioni che mi servono
        bindingJSON(latitudine,longitudine);
    }
}



//Questa funzione mi permette di gestire il caso in cui c'è un errore sulla posizione della Geolocalizzazione
function funzioneErrorePosizione(){
    'use strict';
    window.alert('ATTENZIONE:\nNon posso rilevare le informazioni meteorologiche se non consenti l\'accesso al servizio di Geolocalizzazione!');
    document.getElementById('actualLocation').textContent = 'Posizione attuale non rilevata';
}



//Questa funzione mi permette di recuperare le informazioni precedenti, dopo di ché
// effettua il reverse geocoding e mostra le informazioni nel paragrafo p
function previusPosition(){
    'use strict';
    //Recupero le informazioni
    var latitude;
    var longitude;
    var geocoder = new google.maps.Geocoder();
    if(localStorage && localStorage.latitudine && localStorage.longitudine){
        latitude = parseFloat(localStorage.latitudine);
        longitude = parseFloat(localStorage.longitudine);
    } else{
        latitude = 45.46417;
        longitude = 9.190557;
    }
    
    var latlng = {
        lat: latitude,
        lng: longitude
    };
    
    //Ricavo la posizione
    geocoder.geocode({'location': latlng}, function(results, status){
        if(status === 'OK'){
            if(results[0]){
                document.getElementById('position').textContent = 'Ultima posizione è stata: ' + results[0].formatted_address;
            } else{
                alert('Nessun risultato trovato');
            }
        } else{
            alert('Geocoding fallita ' + status);
        }
    });
}


//Questa funzione è una funzione wrapper 
function funzioneCallbackMaps(){
    'use strict';
    actualPosition();
    previusPosition();
}





//Questa funzione mi permette di andare a recuperare l'ultima data a cui ho fatto accesso
function restoreLastDate(){
    'use strict';
    var lastDay;
    var lastMonth;
    var lastYear;
    var data = new Date();

    if(localStorage && localStorage.lastDay && localStorage.lastMonth && localStorage.lastYear){
        //Recupero le informazioni dalla memoria locale se sono presenti
        lastDay = localStorage.lastDay;
        lastMonth = localStorage.lastMonth;
        lastYear = localStorage.lastYear;
    } else {
        //In caso contrario inserisco quelle attuali
        lastDay = data.getDate();
        lastMonth = data.getMonth();
        lastYear = data.getFullYear();
    }

    //Memorizzo data ed ora attuali nella memoria locale per un futuro riutilizzo
    localStorage.setItem('lastDay', data.getDate());
    localStorage.setItem('lastMonth', data.getMonth());
    localStorage.setItem('lastYear', data.getFullYear());

    //Mostro l'ultimo accesso a video
    lastMonth++;
    document.getElementById('data').textContent = 'Data ultimo accesso: ' + lastDay + '.' + lastMonth + '.' + lastYear;       
}



//Questa funzione mi permette di andare a recuperare il nome della persona se esiste
function restoreName(){
    'use strict';
    if(localStorage && localStorage.name){
        document.getElementById('name').textContent = 'Bentornato, ' + localStorage.name.replace(/\b\w/g, l => l.toUpperCase());   
    } else{
        localStorage.name = 'Giovanni';
        document.getElementById('name').textContent = 'Benvenuto, Giovanni';
    }
}



//Funzione che mi permette di inizializzare la mia pagina: funge da funzione wrapper per le singole funzioni
function initFunction(){
    'use strict';
    restoreName();
    restoreLastDate();
    funzioneCallbackMaps();
}



