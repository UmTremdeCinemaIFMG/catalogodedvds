// VARIÁVEIS GLOBAIS OU CONFIGURAÇÕES INICIAIS
var map;
var markers = [];
var infoWindow;
var locationSelect;

// FUNÇÃO DE INICIALIZAÇÃO DO MAPA
function initMap() {
    var brazil = { lat: -14.2350, lng: -51.9253 }; // CENTRO DO BRASIL
    map = new google.maps.Map(document.getElementById('map'), {
        center: brazil,
        zoom: 4,
        minZoom: 4,
        maxZoom: 10,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
    });

    infoWindow = new google.maps.InfoWindow();

    // EVENT LISTENER PARA FECHAR INFOWINDOW AO CLICAR NO MAPA
    map.addListener('click', function () {
        infoWindow.close();
    });

    locationSelect = document.getElementById('location-select');
    locationSelect.onchange = function () {
        clearMarkers();
        showStoresMarkers(locationSelect.value);
    };

    // CARREGA OS DADOS DOS FILMES
    loadStores();
}

// FUNÇÃO PARA CARREGAR OS DADOS DOS FILMES (STORES)
function loadStores() {
    fetch('js/catalogo.json') // ASSUMINDO QUE OS DADOS ESTÃO EM catalogo.json
        .then(response => response.json())
        .then(data => {
            // PROCESSA OS DADOS E POPULA O DROPDOWN
            createMarkers(data.stores);
            setLocations(data.stores); // ESTA FUNÇÃO PROVAVELMENTE POPULA O DROPDOWN
        })
        .catch(error => console.error('ERRO AO CARREGAR OS DADOS:', error));
}

// FUNÇÃO PARA CRIAR OS MARCADORES NO MAPA
function createMarkers(stores) {
    stores.forEach(function (store) {
        // MODIFICAÇÃO 1: PRÉ-PROCESSAR A STRING DE ESTADOS EM UM ARRAY
        if (store.state) {
            // DIVIDE A STRING POR '/' OU ',' E REMOVE ESPAÇOS EM BRANCO
            store.parsedStates = store.state.split(/[\/,]/).map(s => s.trim()).filter(s => s !== '');
        } else {
            store.parsedStates = []; // GARANTE QUE SEJA UM ARRAY MESMO SE 'STATE' ESTIVER AUSENTE
        }

        var latLng = { lat: store.coordinates.latitude, lng: store.coordinates.longitude };
        var marker = new google.maps.Marker({
            map: map,
            position: latLng,
            title: store.name,
            icon: {
                url: 'img/marker.png', // ÍCONE PERSONALIZADO
                scaledSize: new google.maps.Size(30, 30)
            }
        });

        marker.storeInfo = store; // ARMAZENA AS INFORMAÇÕES DO FILME NO MARCADOR (AGORA COM PARSEDSTATES)
        marker.addListener('click', function () {
            displayStore(this.storeInfo);
        });
        markers.push(marker);
    });
}

// FUNÇÃO PARA EXIBIR INFORMAÇÕES DO FILME NO INFOWINDOW
function displayStore(store) {
    var html = `
        <div class="store-info-window">
            <div class="store-info-name">${store.name}</div>
            <div class="store-info-address">${store.addressLines[0]}</div>
            <div class="store-info-address">${store.addressLines[1]}</div>
            <div class="store-info-phone">${store.phoneNumber}</div>
            <div class="store-info-state">Estado: ${store.state}</div>
            <div class="store-info-genre">Gênero: ${store.genre}</div>
            <div class="store-info-year">Ano: ${store.year}</div>
            <div class="store-info-director">Diretor: ${store.director}</div>
            <div class="store-info-cast">Elenco: ${store.cast}</div>
            <div class="store-info-synopsis">Sinopse: ${store.synopsis}</div>
        </div>
    `;
    infoWindow.setContent(html);
    infoWindow.open(map, markers.find(m => m.storeInfo.name === store.name)); // ABRE NO MARCADOR CORRETO
}

// FUNÇÃO PARA LIMPAR OS MARCADORES EXISTENTES
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0; // LIMPA O ARRAY DE MARCADORES
}

// FUNÇÃO PARA MOSTRAR MARCADORES COM BASE NA SELEÇÃO DO DROPDOWN
function showStoresMarkers(selectedState) { // RENOMEADO 'STATE' PARA 'SELECTEDSTATE' PARA CLAREZA
    var bounds = new google.maps.LatLngBounds();
    markers.forEach(function (marker) {
        var shouldShow = false;
        if (selectedState === "Todos os Estados") {
            shouldShow = true;
        } else {
            // MODIFICAÇÃO 2: VERIFICAR SE O ESTADO SELECIONADO ESTÁ INCLUÍDO NO ARRAY PARSEDSTATES
            if (marker.storeInfo.parsedStates && marker.storeInfo.parsedStates.includes(selectedState)) {
                shouldShow = true;
            }
        }

        if (shouldShow) {
            marker.setMap(map);
            bounds.extend(marker.getPosition());
        } else {
            marker.setMap(null);
        }
    });
    if (selectedState !== "Todos os Estados") {
        map.fitBounds(bounds);
    }
}

// FUNÇÃO PARA POPULAR O DROPDOWN DE LOCAIS
function setLocations(stores) {
    var locationOptions = ["Todos os Estados"];
    var uniqueStates = new Set(); // USAR UM SET PARA GARANTIR ESTADOS ÚNICOS

    stores.forEach(function (store) {
        // A PROPRIEDADE 'STATE' DO OBJETO 'STORE' É CRUCIAL AQUI.
        // SE 'STORE.STATE' CONTIVER MÚLTIPLOS ESTADOS SEPARADOS POR '/' OU ',',
        // PRECISAREMOS DIVIDI-LOS.
        if (store.state) {
            // SUPONDO QUE OS ESTADOS PODEM VIR COMO "AL", "AL/RJ", "BA, DF, MA"
            // DIVIDIR POR '/' OU ',' E ADICIONAR CADA ESTADO INDIVIDUALMENTE
            var statesInStore = store.state.split(/[\/,]/).map(s => s.trim()).filter(s => s !== '');
            statesInStore.forEach(s => uniqueStates.add(s));
        }
    });

    // ADICIONAR OS ESTADOS ÚNICOS E ORDENADOS AO ARRAY DE OPÇÕES
    var sortedUniqueStates = Array.from(uniqueStates).sort();
    locationOptions = locationOptions.concat(sortedUniqueStates);

    // LIMPAR E POPULAR O SELECT
    locationSelect.innerHTML = ''; // LIMPA AS OPÇÕES EXISTENTES
    locationOptions.forEach(function (location) {
        var option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
}

// ADICIONAR UM LISTENER PARA O EVENTO 'DOMCONTENTLOADED' PARA GARANTIR QUE O DOM ESTEJA PRONTO
document.addEventListener('DOMContentLoaded', initMap);
