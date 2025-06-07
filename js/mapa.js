// Coordenadas das capitais dos estados (fallback)
const capitaisCoordenadas = {
    'AC': [-9.9754, -67.8249],  // Rio Branco
    'AL': [-9.6498, -35.7089],  // Maceió
    'AM': [-3.1190, -60.0217],  // Manaus
    'AP': [0.0344, -51.0665],   // Macapá
    'BA': [-12.9711, -38.5108], // Salvador
    'CE': [-3.7172, -38.5433],  // Fortaleza
    'DF': [-15.7975, -47.8919], // Brasília
    'ES': [-20.3222, -40.3381], // Vitória
    'GO': [-16.6869, -49.2648], // Goiânia
    'MA': [-2.5307, -44.3027],  // São Luís
    'MG': [-19.9167, -43.9345], // Belo Horizonte
    'MS': [-20.4697, -54.6201], // Campo Grande
    'MT': [-15.6014, -56.0979], // Cuiabá
    'PA': [-1.4558, -48.4902],  // Belém
    'PB': [-7.1195, -34.8450],  // João Pessoa
    'PE': [-8.0476, -34.8770],  // Recife
    'PI': [-5.0892, -42.8019],  // Teresina
    'PR': [-25.4195, -49.2646], // Curitiba
    'RJ': [-22.9068, -43.1729], // Rio de Janeiro
    'RN': [-5.7793, -35.2009],  // Natal
    'RO': [-8.7619, -63.9039],  // Porto Velho
    'RR': [2.8235, -60.6758],   // Boa Vista
    'RS': [-30.0346, -51.2177], // Porto Alegre
    'SC': [-27.5945, -48.5477], // Florianópolis
    'SE': [-10.9091, -37.0677], // Aracaju
    'SP': [-23.5505, -46.6333], // São Paulo
    'TO': [-10.2128, -48.3603]  // Palmas
};

// Coordenadas das principais cidades
const cidadesCoordenadas = {
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
    'Niterói': [-22.8832, -43.1036]
};

// Inicializa o mapa
const map = L.map('map').setView([-15.7975, -47.8919], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let filmes = [];
let marcadores = L.layerGroup().addTo(map);

// Função para obter coordenadas baseadas na cidade ou UF
function getCoordenadas(filme) {
    if (filme.cidade && filme.cidade.trim() !== '') {
        const coords = cidadesCoordenadas[filme.cidade];
        if (coords) return coords;
    }
    
    if (filme.UF) {
        return capitaisCoordenadas[filme.UF];
    }
    
    return [-15.7975, -47.8919]; // Brasília como fallback
}

// Carrega e processa os dados do catálogo
fetch('catalogo.json')
    .then(response => response.json())
    .then(data => {
        filmes = data;
        atualizarMapa();
        preencherFiltros();
        atualizarEstatisticas();
    })
    .catch(error => console.error('Erro ao carregar o catálogo:', error));

function atualizarMapa() {
    marcadores.clearLayers();

    const ufSelecionada = document.getElementById('filterUF').value;
    const anoSelecionado = document.getElementById('filterYear').value;

    filmes.forEach(filme => {
        if ((!ufSelecionada || filme.UF === ufSelecionada) &&
            (!anoSelecionado || filme.Ano.toString() === anoSelecionado)) {
            
            const coords = getCoordenadas(filme);
            if (coords) {
                const marker = L.marker(coords)
                    .bindPopup(`
                        <div class="filme-popup">
                            <h5>${filme['Título do filme']}</h5>
                            <p>
                                <strong>Direção:</strong> ${filme.Direção}<br>
                                <strong>Ano:</strong> ${filme.Ano}<br>
                                <strong>Estado:</strong> ${filme.UF}<br>
                                ${filme.cidade ? `<strong>Cidade:</strong> ${filme.cidade}<br>` : ''}
                                <strong>Gênero:</strong> ${filme.Gênero || filme.GEN || 'Não informado'}<br>
                                <strong>Duração:</strong> ${filme['Dur.(´)']} minutos
                            </p>
                        </div>
                    `);
                marcadores.addLayer(marker);
            }
        }
    });
}

function preencherFiltros() {
    const ufs = new Set();
    const anos = new Set();

    filmes.forEach(filme => {
        if (filme.UF) ufs.add(filme.UF);
        if (filme.Ano) anos.add(filme.Ano);
    });

    const selectUF = document.getElementById('filterUF');
    Array.from(ufs).sort().forEach(uf => {
        const option = document.createElement('option');
        option.value = uf;
        option.textContent = uf;
        selectUF.appendChild(option);
    });

    const selectAno = document.getElementById('filterYear');
    Array.from(anos).sort((a, b) => b - a).forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    });
}

function atualizarEstatisticas() {
    const totalFilmes = filmes.length;
    const totalEstados = new Set(filmes.map(f => f.UF)).size;
    const generos = new Map();
    
    filmes.forEach(filme => {
        const genero = filme.Gênero || filme.GEN || 'Não informado';
        generos.set(genero, (generos.get(genero) || 0) + 1);
    });

    document.getElementById('stats').innerHTML = `
        <p>Total de Filmes: ${totalFilmes}</p>
        <p>Estados Representados: ${totalEstados}</p>
        <p>Principais Gêneros:</p>
        <ul>
            ${Array.from(generos)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([genero, count]) => `<li>${genero}: ${count}</li>`)
                .join('')}
        </ul>
    `;
}

// Event listeners para filtros
document.getElementById('filterUF').addEventListener('change', atualizarMapa);
document.getElementById('filterYear').addEventListener('change', atualizarMapa);