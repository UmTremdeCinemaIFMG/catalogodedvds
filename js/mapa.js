// OBJETO COM AS COORDENADAS DAS CAPITAIS E CIDADES
const coordenadas = {
    // COORDENADAS DAS CAPITAIS DOS ESTADOS
    capitais: {
        'AC': [-9.9754, -67.8249],  // RIO BRANCO
        'AL': [-9.6498, -35.7089],  // MACEIÓ
        'AM': [-3.1190, -60.0217],  // MANAUS
        'AP': [0.0344, -51.0665],   // MACAPÁ
        'BA': [-12.9711, -38.5108], // SALVADOR
        'CE': [-3.7172, -38.5433],  // FORTALEZA
        'DF': [-15.7975, -47.8919], // BRASÍLIA
        'ES': [-20.3222, -40.3381], // VITÓRIA
        'GO': [-16.6869, -49.2648], // GOIÂNIA
        'MA': [-2.5307, -44.3027],  // SÃO LUÍS
        'MG': [-19.9167, -43.9345], // BELO HORIZONTE
        'MS': [-20.4697, -54.6201], // CAMPO GRANDE
        'MT': [-15.6014, -56.0979], // CUIABÁ
        'PA': [-1.4558, -48.4902],  // BELÉM
        'PB': [-7.1195, -34.8450],  // JOÃO PESSOA
        'PE': [-8.0476, -34.8770],  // RECIFE
        'PI': [-5.0892, -42.8019],  // TERESINA
        'PR': [-25.4195, -49.2646], // CURITIBA
        'RJ': [-22.9068, -43.1729], // RIO DE JANEIRO
        'RN': [-5.7793, -35.2009],  // NATAL
        'RO': [-8.7619, -63.9039],  // PORTO VELHO
        'RR': [2.8235, -60.6758],   // BOA VISTA
        'RS': [-30.0346, -51.2177], // PORTO ALEGRE
        'SC': [-27.5945, -48.5477], // FLORIANÓPOLIS
        'SE': [-10.9091, -37.0677], // ARACAJU
        'SP': [-23.5505, -46.6333], // SÃO PAULO
        'TO': [-10.2128, -48.3603]  // PALMAS
    },
    // COORDENADAS DAS OUTRAS CIDADES
    cidades: {
        'São Paulo': [-23.5505, -46.6333],
        'Rio de Janeiro': [-22.9068, -43.1729],
        'Salvador': [-12.9711, -38.5108],
        'Brasília': [-15.7975, -47.8919],
        'Fortaleza': [-3.7172, -38.5433],
        'Belo Horizonte': [-19.9167, -43.9345],
        'Manaus': [-3.1190, -60.0217],
        'Curitiba': [-25.4195, -49.2646],
        'Recife': [-8.0476, -34.8770],
        'Porto Alegre': [-30.0346, -51.2177],
        'Santos': [-23.9618, -46.3322],
        'Campinas': [-22.9099, -47.0626],
        'São José dos Campos': [-23.1791, -45.8872],
        'Santo André': [-23.6639, -46.5383],
        'Niterói': [-22.8832, -43.1036],
        'Sabará': [-19.8889, -43.8054]
    }
};

// AGUARDA O CARREGAMENTO COMPLETO DA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    // INICIALIZAÇÃO DO MAPA COM CONFIGURAÇÕES OTIMIZADAS
    const map = L.map('map', {
        zoomControl: true,  // ATIVA O CONTROLE DE ZOOM
        dragging: true,     // PERMITE ARRASTAR O MAPA
        tap: true,         // PERMITE TOQUES
        touchZoom: true,   // PERMITE ZOOM COM TOQUE
        scrollWheelZoom: true // PERMITE ZOOM COM RODA DO MOUSE
    }).setView([-15.7975, -47.8919], 4);

    // ADICIONA A CAMADA DO MAPA (TILES)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 2
    }).addTo(map);

    // VARIÁVEIS GLOBAIS
    let filmes = [];
    let marcadores = L.layerGroup().addTo(map);

// VARIÁVEIS GLOBAIS
let filmes = [];
let marcadores = L.layerGroup().addTo(map);

// FUNÇÃO PARA SEPARAR UFs MÚLTIPLAS
function getUFs(ufString) {
    if (!ufString) return [];
    // DIVIDE POR VÍRGULA, BARRA OU ESPAÇO E FILTRA VALORES VAZIOS
    return ufString.split(/[,/\s]+/).map(uf => uf.trim()).filter(Boolean);
}

// FUNÇÃO PARA OBTER COORDENADAS DE UM FILME
function getCoordenadas(filme) {
    if (filme.cidade && filme.cidade.trim() !== '') {
        const coords = coordenadas.cidades[filme.cidade];
        if (coords) return coords;
    }
    
    if (filme.UF) {
        const uf = filme.UF.trim();
        return coordenadas.capitais[uf];
    }
    
    return [-15.7975, -47.8919]; // BRASÍLIA COMO PONTO PADRÃO
}

// FUNÇÃO PARA CRIAR O CONTEÚDO DO POPUP ADAPTATIVO
function criarConteudoPopup(filme) {
    const isMobile = window.innerWidth <= 768;
    
    return `
        <div class="filme-popup">
            <h5>${filme['Título do filme']}</h5>
            <p>
                <strong>Direção:</strong> ${filme.Direção}<br>
                <strong>Ano:</strong> ${filme.Ano}<br>
                ${isMobile ? `<strong>Local:</strong> ${filme.cidade || filme.UF}<br>` : 
                           `<strong>Estado:</strong> ${filme.UF}<br>
                            ${filme.cidade ? `<strong>Cidade:</strong> ${filme.cidade}<br>` : ''}`}
                <strong>Gênero:</strong> ${filme.Gênero || filme.GEN || 'Não informado'}<br>
                ${isMobile ? '' : `<strong>Duração:</strong> ${filme['Dur.(´)']} minutos`}
            </p>
            ${filme.Gênero ? `<span class="genero">${filme.Gênero}</span>` : ''}
        </div>
    `;
}

// FUNÇÃO PARA ATUALIZAR O MAPA
function atualizarMapa() {
    marcadores.clearLayers();

    const ufSelecionada = document.getElementById('filterUF').value;
    const cidadeSelecionada = document.getElementById('filterCity').value;
    const anoSelecionado = document.getElementById('filterYear').value;

    let filmesVisiveis = 0;

    filmes.forEach(filme => {
        // VERIFICA OS FILTROS SELECIONADOS
        if ((!ufSelecionada || filme.UF === ufSelecionada) &&
            (!cidadeSelecionada || filme.cidade === cidadeSelecionada) &&
            (!anoSelecionado || filme.Ano.toString() === anoSelecionado)) {
            
            const coords = getCoordenadas(filme);
            if (coords) {
                const marker = L.marker(coords)
                    .bindPopup(criarConteudoPopup(filme), {
                        maxWidth: window.innerWidth <= 768 ? 200 : 300,
                        autoPan: true,
                        closeButton: true
                    });
                marcadores.addLayer(marker);
                filmesVisiveis++;
            }
        }
    });

    document.getElementById('filmMapCount').textContent = filmesVisiveis;
}

// FUNÇÃO PARA PREENCHER OS FILTROS
function preencherFiltros() {
    const ufs = new Set();
    const cidades = new Set();
    const anos = new Set();

    filmes.forEach(filme => {
        if (filme.UF) ufs.add(filme.UF);
        if (filme.cidade) cidades.add(filme.cidade);
        if (filme.Ano) anos.add(filme.Ano);
    });

    // PREENCHE SELECT DE UF
    const selectUF = document.getElementById('filterUF');
    Array.from(ufs).sort().forEach(uf => {
        const option = document.createElement('option');
        option.value = uf;
        option.textContent = uf;
        selectUF.appendChild(option);
    });

    // PREENCHE SELECT DE CIDADE
    const selectCity = document.getElementById('filterCity');
    Array.from(cidades).sort().forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        selectCity.appendChild(option);
    });

    // PREENCHE SELECT DE ANO
    const selectAno = document.getElementById('filterYear');
    Array.from(anos).sort((a, b) => b - a).forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    });

    // ADICIONA LISTENERS PARA OS FILTROS
    document.getElementById('filterUF').addEventListener('change', atualizarMapa);
    document.getElementById('filterCity').addEventListener('change', atualizarMapa);
    document.getElementById('filterYear').addEventListener('change', atualizarMapa);
}

// FUNÇÃO PARA ATUALIZAR AS ESTATÍSTICAS
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

  // CARREGA E PROCESSA OS DADOS DO CATÁLOGO
    fetch('catalogo.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('ERRO AO CARREGAR O CATÁLOGO');
            }
            return response.json();
        })
        .then(data => {
            console.log('DADOS CARREGADOS COM SUCESSO:', data.length, 'FILMES');
            // EXPANDE FILMES COM MÚLTIPLAS UFs
            filmes = data.reduce((acc, filme) => {
                const ufs = getUFs(filme.UF);
                if (ufs.length > 0) {
                    ufs.forEach(uf => {
                        acc.push({...filme, UF: uf});
                    });
                } else {
                    acc.push(filme);
                }
                return acc;
            }, []);
            
            // INICIALIZA O MAPA E SEUS COMPONENTES
            atualizarMapa();
            preencherFiltros();
            atualizarEstatisticas();
        })
        .catch(error => {
            console.error('ERRO AO CARREGAR O CATÁLOGO:', error);
            document.getElementById('map').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>Erro ao carregar o mapa. Por favor, tente novamente.</p>
                </div>
            `;
        });

    // FORÇA UMA ATUALIZAÇÃO DO MAPA APÓS O CARREGAMENTO
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});
