// OBJETO COM AS COORDENADAS (PERMANECE IGUAL)
const coordenadas = {
    capitais: {
        'AC': [-9.9754, -67.8249], 'AL': [-9.6498, -35.7089], 'AM': [-3.1190, -60.0217], 'AP': [0.0344, -51.0665], 'BA': [-12.9711, -38.5108], 'CE': [-3.7172, -38.5433], 'DF': [-15.7975, -47.8919], 'ES': [-20.3222, -40.3381], 'GO': [-16.6869, -49.2648], 'MA': [-2.5307, -44.3027], 'MG': [-19.9167, -43.9345], 'MS': [-20.4697, -54.6201], 'MT': [-15.6014, -56.0979], 'PA': [-1.4558, -48.4902], 'PB': [-7.1195, -34.8450], 'PE': [-8.0476, -34.8770], 'PI': [-5.0892, -42.8019], 'PR': [-25.4195, -49.2646], 'RJ': [-22.9068, -43.1729], 'RN': [-5.7793, -35.2009], 'RO': [-8.7619, -63.9039], 'RR': [2.8235, -60.6758], 'RS': [-30.0346, -51.2177], 'SC': [-27.5945, -48.5477], 'SE': [-10.9091, -37.0677], 'SP': [-23.5505, -46.6333], 'TO': [-10.2128, -48.3603]
    },
    cidades: {
        'São Paulo': [-23.5505, -46.6333], 'Rio de Janeiro': [-22.9068, -43.1729], 'Salvador': [-12.9711, -38.5108], 'Brasília': [-15.7975, -47.8919], 'Fortaleza': [-3.7172, -38.5433], 'Belo Horizonte': [-19.9167, -43.9345], 'Manaus': [-3.1190, -60.0217], 'Curitiba': [-25.4195, -49.2646], 'Recife': [-8.0476, -34.8770], 'Porto Alegre': [-30.0346, -51.2177], 'Santos': [-23.9618, -46.3322], 'Campinas': [-22.9099, -47.0626], 'São José dos Campos': [-23.1791, -45.8872], 'Santo André': [-23.6639, -46.5383], 'Niterói': [-22.8832, -43.1036], 'Sabará': [-19.8889, -43.8054]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // INICIALIZAÇÃO DO MAPA (PERMANECE IGUAL)
    const map = L.map('map').setView([-15.7975, -47.8919], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 3
    }).addTo(map);

    let allFilms = [];
    const marcadores = L.markerClusterGroup();
    map.addLayer(marcadores);

    // FUNÇÃO SIMPLIFICADA PARA OBTER COORDENADAS
    function getCoordenadas(type, name) {
        if (type === 'cidade' && coordenadas.cidades[name]) {
            return coordenadas.cidades[name];
        }
        if (type === 'uf' && coordenadas.capitais[name]) {
            return coordenadas.capitais[name];
        }
        return null;
    }

    // FUNÇÃO DE POPUP (PERMANECE IGUAL)
    function criarConteudoPopup(filme) {
        const encodedTitle = encodeURIComponent(filme['Título do filme']);
        return `<div class="filme-popup"><h5>${filme['Título do filme']}</h5><p><strong>Direção:</strong> ${filme.Direção}<br><strong>Ano:</strong> ${filme.Ano}</p><a href="filme.html?titulo=${encodedTitle}" class="ver-mais">Ver mais informações</a></div>`;
    }

    // FUNÇÃO DE ATUALIZAÇÃO DO MAPA (LÓGICA PRINCIPAL CORRIGIDA)
    function atualizarMapa() {
        marcadores.clearLayers();
        const ufSelecionada = document.getElementById('filterUF').value;
        const cidadeSelecionada = document.getElementById('filterCity').value;
        const anoSelecionado = document.getElementById('filterYear').value;

        let filmesVisiveis = 0;
        const markersToAdd = [];

        // 1. FILTRA A LISTA DE FILMES
        const filmesFiltrados = allFilms.filter(filme => {
            const matchesUF = !ufSelecionada || (filme.UF && filme.UF.includes(ufSelecionada));
            const matchesCity = !cidadeSelecionada || (filme.cidade && filme.cidade.includes(cidadeSelecionada));
            const matchesYear = !anoSelecionado || (filme.Ano && filme.Ano.toString() === anoSelecionado);
            return matchesUF && matchesCity && matchesYear;
        });

        // 2. CRIA MARCADORES PARA OS FILMES FILTRADOS
        filmesFiltrados.forEach(filme => {
            const cidades = filme.cidade || [];
            const ufs = filme.UF || [];

            if (cidades.length > 0) {
                cidades.forEach(cidadeNome => {
                    const coords = getCoordenadas('cidade', cidadeNome);
                    if (coords) {
                        const jitter = 0.001;
                        const adjustedCoords = [coords[0] + (Math.random() - 0.5) * jitter, coords[1] + (Math.random() - 0.5) * jitter];
                        markersToAdd.push(L.marker(adjustedCoords).bindPopup(criarConteudoPopup(filme)));
                        filmesVisiveis++;
                    }
                });
            } else if (ufs.length > 0) {
                ufs.forEach(ufNome => {
                    const coords = getCoordenadas('uf', ufNome);
                    if (coords) {
                        const jitter = 0.001;
                        const adjustedCoords = [coords[0] + (Math.random() - 0.5) * jitter, coords[1] + (Math.random() - 0.5) * jitter];
                        markersToAdd.push(L.marker(adjustedCoords).bindPopup(criarConteudoPopup(filme)));
                        filmesVisiveis++;
                    }
                });
            }
        });
        
        // 3. ADICIONA MARCADORES AO CLUSTER E ATUALIZA A VISUALIZAÇÃO
        if (markersToAdd.length > 0) {
            marcadores.addLayers(markersToAdd);
            map.fitBounds(marcadores.getBounds(), { padding: [50, 50], maxZoom: 12 });
        }
        
        document.getElementById('filmMapCount').textContent = filmesVisiveis;
    }

    // FUNÇÃO PARA PREENCHER OS FILTROS (LÓGICA CORRIGIDA)
    function preencherFiltros() {
        // USA FLATMAP PARA OBTER TODOS OS VALORES DOS ARRAYS
        const ufs = [...new Set(allFilms.flatMap(f => f.UF || []))].sort();
        const cidades = [...new Set(allFilms.flatMap(f => f.cidade || []))].sort();
        const anos = [...new Set(allFilms.map(f => f.Ano))].sort((a, b) => b - a);

        const selectUF = document.getElementById('filterUF');
        ufs.forEach(uf => {
            if (uf) { const option = document.createElement('option'); option.value = uf; option.textContent = uf; selectUF.appendChild(option); }
        });

        const selectCity = document.getElementById('filterCity');
        cidades.forEach(cidade => {
            if (cidade) { const option = document.createElement('option'); option.value = cidade; option.textContent = cidade; selectCity.appendChild(option); }
        });

        const selectAno = document.getElementById('filterYear');
        anos.forEach(ano => {
            if (ano) { const option = document.createElement('option'); option.value = ano; option.textContent = ano; selectAno.appendChild(option); }
        });

        document.getElementById('filterUF').addEventListener('change', atualizarMapa);
        document.getElementById('filterCity').addEventListener('change', atualizarMapa);
        document.getElementById('filterYear').addEventListener('change', atualizarMapa);
    }
    
    // FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS (LÓGICA CORRIGIDA)
    function atualizarEstatisticas() {
        const totalFilmes = allFilms.length;
        const estados = new Set(allFilms.flatMap(f => f.UF || []));
        const cidades = new Set(allFilms.flatMap(f => f.cidade || []));
        const generos = new Map();
        allFilms.forEach(filme => {
            const genero = filme.Gênero || filme.GEN || 'Não informado';
            generos.set(genero, (generos.get(genero) || 0) + 1);
        });
        document.getElementById('stats').innerHTML = `<p><strong>Total de Filmes (únicos):</strong> ${totalFilmes}</p><p><strong>Estados com Produções:</strong> ${estados.size}</p><p><strong>Cidades com Produções:</strong> ${cidades.size}</p><p><strong>Principais Gêneros:</strong></p><ul>${Array.from(generos).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([g,c])=>`<li><span>${g}</span><span>${c}</span></li>`).join('')}</ul>`;
    }

    // CARREGA E PROCESSA OS DADOS DO CATÁLOGO
    fetch('catalogo.json')
        .then(response => response.json())
        .then(data => {
            allFilms = data; // ARMAZENA OS DADOS DIRETAMENTE
            preencherFiltros();
            atualizarMapa();
            atualizarEstatisticas();
        })
        .catch(error => {
            console.error('ERRO AO CARREGAR O CATÁLOGO:', error);
            document.getElementById('map').innerHTML = `<div style="text-align: center; padding: 20px;"><p>Erro ao carregar o mapa.</p></div>`;
        });
});
