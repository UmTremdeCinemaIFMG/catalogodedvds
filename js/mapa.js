// VARIÁVEIS GLOBAIS
let map;
let filmesOriginais = [];
let filmes = [];
let markers = [];
let markerCluster;
let estados = new Set();
let cidades = new Set();
let infoWindow;

// FUNÇÃO PARA INICIALIZAR O MAPA
async function initMap() {
    // CONFIGURAÇÕES INICIAIS DO MAPA
    const mapOptions = {
        center: { lat: -15.77972, lng: -47.92972 },
        zoom: 4,
        styles: [
            {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "road",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
            }
        ]
    };

    // CRIA O MAPA
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    infoWindow = new google.maps.InfoWindow();

    try {
        // CARREGA OS DADOS DOS FILMES
        const response = await fetch('data/filmes.json');
        const data = await response.json();
        
        // PROCESSA OS DADOS DOS FILMES
        filmesOriginais = data.map(filme => {
            // ADICIONA UF E CIDADE AOS CONJUNTOS
            if (filme.UF) estados.add(filme.UF);
            if (filme.cidade) cidades.add(filme.cidade);
            
            return {
                ...filme,
                // GARANTE QUE O TÍTULO ESTÁ EM FORMATO DE STRING
                "Título do filme": String(filme["Título do filme"] || '').trim(),
                UF: String(filme.UF || '').trim(),
                cidade: String(filme.cidade || '').trim()
            };
        });

        filmes = [...filmesOriginais];
        
        // INICIALIZA OS FILTROS
        initializeFilters();
        // ATUALIZA O CONTADOR DE FILMES
        updateMapFilmsCounter();
        // ADICIONA OS MARCADORES AO MAPA
        updateMarkers();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// FUNÇÃO PARA ADICIONAR MARCADORES AO MAPA
function updateMarkers() {
    // REMOVE MARCADORES EXISTENTES
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    if (markerCluster) {
        markerCluster.clearMarkers();
    }

    // CRIA NOVOS MARCADORES
    filmes.forEach(filme => {
        if (filme.latitude && filme.longitude) {
            const marker = new google.maps.Marker({
                position: { lat: parseFloat(filme.latitude), lng: parseFloat(filme.longitude) },
                map: map,
                title: filme["Título do filme"]
            });

            // ADICIONA EVENTO DE CLIQUE NO MARCADOR
            marker.addListener('click', () => {
                const contentString = createInfoWindowContent(filme);
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            });

            markers.push(marker);
        }
    });

    // CRIA O CLUSTER DE MARCADORES
    markerCluster = new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });
}

// FUNÇÃO PARA CRIAR O CONTEÚDO DA JANELA DE INFORMAÇÕES
function createInfoWindowContent(filme) {
    // OBTÉM O CAMINHO DA IMAGEM
    const imagePath = filme.imageName ? `capas/${filme.imageName}` : 'capas/progbrasil.png';
    
    // CRIA O HTML DO CONTEÚDO
    return `
        <div class="info-window">
            <div class="info-window-header">
                <img src="${imagePath}" alt="${filme["Título do filme"]}" class="info-window-image">
                <h3>${filme["Título do filme"]}</h3>
            </div>
            <div class="info-window-content">
                ${filme.Direção ? `<p><strong>Direção:</strong> ${filme.Direção}</p>` : ''}
                ${filme.Ano ? `<p><strong>Ano:</strong> ${filme.Ano}</p>` : ''}
                ${filme["Dur.(´)"] ? `<p><strong>Duração:</strong> ${filme["Dur.(´)"]} min</p>` : ''}
                ${filme.cidade ? `<p><strong>Cidade:</strong> ${filme.cidade}</p>` : ''}
                ${filme.UF ? `<p><strong>UF:</strong> ${filme.UF}</p>` : ''}
            </div>
            <div class="info-window-footer">
                <a href="filme.html?id=${encodeURIComponent(filme["Título do filme"])}" class="info-window-link">
                    Ver mais detalhes
                </a>
            </div>
        </div>
    `;
}

// FUNÇÃO PARA INICIALIZAR OS FILTROS
function initializeFilters() {
    const selectUF = document.getElementById('filterUF');
    const selectCity = document.getElementById('filterCity');
    
    // PREENCHE O SELECT DE UF
    selectUF.innerHTML = '<option value="">Todos os Estados</option>';
    Array.from(estados).sort().forEach(estado => {
        selectUF.innerHTML += `<option value="${estado}">${estado}</option>`;
    });
    
    // PREENCHE O SELECT DE CIDADES
    selectCity.innerHTML = '<option value="">Todas as Cidades</option>';
    Array.from(cidades).sort().forEach(cidade => {
        selectCity.innerHTML += `<option value="${cidade}">${cidade}</option>`;
    });
    
    // ADICIONA EVENTOS AOS FILTROS
    selectUF.addEventListener('change', atualizarFiltrosEncadeados);
    selectCity.addEventListener('change', atualizarFiltrosEncadeados);
}

// FUNÇÃO PARA ATUALIZAR FILTROS ENCADEADOS
function atualizarFiltrosEncadeados() {
    const ufSelecionada = document.getElementById('filterUF').value;
    const cidadeSelecionada = document.getElementById('filterCity').value;
    
    // FILTRA FILMES BASEADO NA UF SELECIONADA
    let filmesFiltrados = filmesOriginais;
    if (ufSelecionada) {
        filmesFiltrados = filmesOriginais.filter(filme => filme.UF === ufSelecionada);
    }
    
    // ATUALIZA O SELECT DE CIDADES
    const selectCity = document.getElementById('filterCity');
    const cidadeAtual = selectCity.value;
    selectCity.innerHTML = '<option value="">Todas as Cidades</option>';
    
    const cidadesDisponiveis = new Set();
    filmesFiltrados.forEach(filme => {
        if (filme.cidade) cidadesDisponiveis.add(filme.cidade);
    });
    
    Array.from(cidadesDisponiveis).sort().forEach(cidade => {
        selectCity.innerHTML += `<option value="${cidade}" ${cidade === cidadeAtual ? 'selected' : ''}>${cidade}</option>`;
    });
    
    // FILTRA POR CIDADE SE SELECIONADA
    if (cidadeSelecionada) {
        filmesFiltrados = filmesFiltrados.filter(filme => filme.cidade === cidadeSelecionada);
    }
    
    // ATUALIZA A LISTA DE FILMES E OS MARCADORES
    filmes = filmesFiltrados;
    updateMapFilmsCounter();
    updateMarkers();
    atualizarEstatisticas();
}

// FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS
function atualizarEstatisticas() {
    const totalFilmes = filmes.length;
    const estados = new Set(filmes.map(f => f.UF));
    const cidades = new Set(filmes.filter(f => f.cidade).map(f => f.cidade));
    const generos = new Map();
    
    filmes.forEach(filme => {
        const genero = filme.Gênero || filme.GEN || 'Não informado';
        generos.set(genero, (generos.get(genero) || 0) + 1);
    });

    document.getElementById('stats').innerHTML = `
        <p><strong>Total de Filmes:</strong> ${totalFilmes}</p>
        <p><strong>Estados:</strong> ${estados.size}</p>
        <p><strong>Cidades:</strong> ${cidades.size}</p>
        <p><strong>Principais Gêneros:</strong></p>
        <ul>
            ${Array.from(generos)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([genero, count]) => 
                    `<li><span>${genero}</span> <span>${count} filme${count > 1 ? 's' : ''}</span></li>`)
                .join('')}
        </ul>
    `;
}

// FUNÇÃO PARA ATUALIZAR O CONTADOR DE FILMES
function updateMapFilmsCounter() {
    const countElement = document.getElementById('filmsCount');
    const counterContainer = document.querySelector('.results-counter');
    
    // ADICIONA EFEITO DE ATUALIZAÇÃO
    countElement.classList.add('updated');
    setTimeout(() => {
        countElement.classList.remove('updated');
    }, 300);

    // ATUALIZA O NÚMERO DE FILMES
    countElement.textContent = filmes.length;
    
    // ATUALIZA AS CLASSES CSS BASEADO NO NÚMERO DE FILMES
    if (filmes.length === 0) {
        counterContainer.classList.add('sem-resultados');
        counterContainer.classList.remove('com-resultados');
    } else {
        counterContainer.classList.add('com-resultados');
        counterContainer.classList.remove('sem-resultados');
    }
}

// INICIA O MAPA QUANDO A PÁGINA CARREGAR
window.initMap = initMap;
