/* ==========================================
   1. VARIÁVEIS E CONFIGURAÇÕES GLOBAIS
   ========================================== */
let allFilms = [];
let currentFilms = [];
let currentPage = 1;
let allGenres = [];
let debounceTimer;
const itemsPerPage = 20;
let currentView = 'grid';

// VARIÁVEIS GLOBAIS PARA O MAPA
let mapInstance = null;
let markersCluster = null;
const coordenadas = {
    capitais: { 'AC': [-9.9754, -67.8249], 'AL': [-9.6498, -35.7089], 'AM': [-3.1190, -60.0217], 'AP': [0.0344, -51.0665], 'BA': [-12.9711, -38.5108], 'CE': [-3.7172, -38.5433], 'DF': [-15.7975, -47.8919], 'ES': [-20.3222, -40.3381], 'GO': [-16.6869, -49.2648], 'MA': [-2.5307, -44.3027], 'MG': [-19.9167, -43.9345], 'MS': [-20.4697, -54.6201], 'MT': [-15.6014, -56.0979], 'PA': [-1.4558, -48.4902], 'PB': [-7.1195, -34.8450], 'PE': [-8.0476, -34.8770], 'PI': [-5.0892, -42.8019], 'PR': [-25.4195, -49.2646], 'RJ': [-22.9068, -43.1729], 'RN': [-5.7793, -35.2009], 'RO': [-8.7619, -63.9039], 'RR': [2.8235, -60.6758], 'RS': [-30.0346, -51.2177], 'SC': [-27.5945, -48.5477], 'SE': [-10.9091, -37.0677], 'SP': [-23.5505, -46.6333], 'TO': [-10.2128, -48.3603] },
    cidades: { 'São Paulo': [-23.5505, -46.6333], 'Rio de Janeiro': [-22.9068, -43.1729], 'Salvador': [-12.9711, -38.5108], 'Brasília': [-15.7975, -47.8919], 'Fortaleza': [-3.7172, -38.5433], 'Belo Horizonte': [-19.9167, -43.9345], 'Manaus': [-3.1190, -60.0217], 'Curitiba': [-25.4195, -49.2646], 'Recife': [-8.0476, -34.8770], 'Porto Alegre': [-30.0346, -51.2177], 'Santos': [-23.9618, -46.3322], 'Campinas': [-22.9099, -47.0626], 'São José dos Campos': [-23.1791, -45.8872], 'Santo André': [-23.6639, -46.5383], 'Niterói': [-22.8832, -43.1036], 'Sabará': [-19.8889, -43.8054] }
};

/* ==========================================
   2. FUNÇÕES DE UTILIDADE E FORMATAÇÃO
   ========================================== */
function cleanField(value) { if (!value) return ''; return String(value).replace(/^"|"$/g, '').trim(); }
function getClassificationClass(age) { if (!age || age <= 0) return 'L'; const ageNum = typeof age === 'string' ? parseInt(age) : age; switch (ageNum) { case 10: return 'ten'; case 12: return 'twelve'; case 14: return 'fourteen'; case 16: return 'sixteen'; case 18: return 'eighteen'; default: return 'L'; } }
function getDvdCover(filmData) { const DEFAULT_COVER = 'capas/progbrasil.png'; if (filmData.imageName) { const baseName = filmData.imageName.replace(/\.(jpg|jpeg|png|gif)$/i, ''); return `capas/${baseName}.jpg`; } return DEFAULT_COVER; }

/* ==========================================
   3. FUNÇÕES DE TRANSFORMAÇÃO E ORDENAÇÃO
   ========================================== */
function transformFilmData(originalFilm) {
    let imdbData = { votantes: '' };
    if (originalFilm["nota imdb/votantes"]) { const [nota, votantes] = String(originalFilm["nota imdb/votantes"]).split('/'); imdbData = { votantes: `${nota}/${votantes || ''}`.trim() }; }
    return {
        title: cleanField(originalFilm["Título do filme"]),
        director: cleanField(originalFilm["Direção"]),
        cast: cleanField(originalFilm["Elenco"]),
        duration: parseInt(originalFilm["Dur.(´)"]) || 0,
        genre: cleanField(originalFilm["GEN."]),
        genres: [...new Set([...(cleanField(originalFilm["GEN."]) ? [cleanField(originalFilm["GEN."])] : []), ...(cleanField(originalFilm["Gênero"]) ? cleanField(originalFilm["Gênero"]).split(',').map(g => g.trim()) : [])])].filter(g => g),
        year: parseInt(originalFilm["Ano"]) || 0,
        imdb: imdbData,
        country: cleanField(originalFilm["País"]),
        state: cleanField(originalFilm["UF"]),
        city: cleanField(originalFilm["cidade"]),
        ods: originalFilm["ODS"] ? String(originalFilm["ODS"]).split(',').map(s => s.trim()).filter(s => s) : [],
        odsJustificados: originalFilm["ODS_Justificados"] || [],
        audiodescricao: cleanField(originalFilm["Audiodescrição"]),
        closedCaption: cleanField(originalFilm["Closed Caption"]),
        trailer: cleanField(originalFilm["trailer"] || ''),
        synopsis: cleanField(originalFilm["Sinopse"]),
        tema: cleanField(originalFilm["tema (Programadora Brasil)"]),
        tags: cleanField(originalFilm["tags"]),
        website: cleanField(originalFilm["website"]),
        assistirOnline: cleanField(originalFilm["Assistir Online"] || ''),
        festivais: cleanField(originalFilm["festivais"]),
        premios: cleanField(originalFilm["premios"]),
        legendasOutras: cleanField(originalFilm["legendas_outras"]),
        materialOutros: (() => { const material = originalFilm["material_outros"]; if (!material) return []; if (typeof material === 'string') { return [{ tipo: material, titulo: material, url: '#' }]; } return Array.isArray(material) ? material : []; })(),
        duracaoFormato: cleanField(originalFilm["duracao FORMATO"]),
        pgm: parseInt(originalFilm["PGM"]) || 0,
        filmes: parseInt(originalFilm["Filmes"]) || 0,
        dvd: cleanField(originalFilm["Nome do Programa"]),
        imageName: cleanField(originalFilm["imageName"]),
        classification: parseInt(originalFilm["Classificação Indicativa POR PGM"]) || 0,
        classificationDescription: originalFilm["Classificação Indicativa - Descrição"] || [],
        planos_de_aula: originalFilm["planos_de_aula"] || [],
        videos: originalFilm["videos"] || [],
        bnccEtapas: originalFilm["BNCC_Etapas"] || [],
        bnccAreas: originalFilm["BNCC_Areas"] || [],
        bnccCompetencias: originalFilm["BNCC_Competencias_Gerais"] || [],
        bnccTemas: originalFilm["BNCC_Temas_Transversais"] || [],
        bnccJustificativa: cleanField(originalFilm["BNCC_Justificativa"])
    };
}
function sortFilms(films, sortOption) {
    const sortedFilms = [...films];
    switch (sortOption) {
        case 'title-asc': sortedFilms.sort((a, b) => a.title.localeCompare(b.title)); break;
        case 'title-desc': sortedFilms.sort((a, b) => b.title.localeCompare(a.title)); break;
        case 'year-asc': sortedFilms.sort((a, b) => a.year - b.year); break;
        case 'year-desc': sortedFilms.sort((a, b) => b.year - a.year); break;
        case 'duration-asc': sortedFilms.sort((a, b) => a.duration - b.duration); break;
        case 'duration-desc': sortedFilms.sort((a, b) => b.duration - b.duration); break;
    }
    return sortedFilms;
}

/* ==========================================
   4. FUNÇÕES DE FILTRO E BUSCA
   ========================================== */
function filterAndRenderFilms() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const sortOption = document.getElementById('sortSelect').value;
        const selectedClassification = document.getElementById('classificationSelect').value;
        const selectedGenre = document.getElementById('genreSelect').value;
        const selectedAccessibility = document.getElementById('accessibilitySelect').value;
        const selectedOds = document.getElementById('odsSelect').value;
        const selectedBncc = document.getElementById('bnccSelect').value;
        const selectedEtapa = document.getElementById('etapaSelect').value;
        const selectedArea = document.getElementById('areaSelect').value;
        const selectedTema = document.getElementById('temaSelect').value;

        currentFilms = allFilms.filter(film => {
            const matchesSearch = film.title.toLowerCase().includes(searchTerm) || (film.director && film.director.toLowerCase().includes(searchTerm)) || (film.cast && film.cast.toLowerCase().includes(searchTerm)) || (film.synopsis && film.synopsis.toLowerCase().includes(searchTerm)) || (film.tema && film.tema.toLowerCase().includes(searchTerm)) || (film.tags && film.tags.toLowerCase().includes(searchTerm)) || (film.dvd && film.dvd.toLowerCase().includes(searchTerm));
            const matchesGenre = !selectedGenre || (film.genres && film.genres.includes(selectedGenre)) || film.genre === selectedGenre;
            const matchesClassification = !selectedClassification || film.classification === parseInt(selectedClassification) || (selectedClassification === 'L' && film.classification <= 0);
            const matchesAccessibility = !selectedAccessibility || ((selectedAccessibility === 'planos_de_aula' && film.planos_de_aula && film.planos_de_aula.length > 0) || (selectedAccessibility === 'audiodescricao' && film.audiodescricao) || (selectedAccessibility === 'closed_caption' && film.closedCaption) || (selectedAccessibility === 'trailer' && film.trailer && film.trailer.trim() !== '') || (selectedAccessibility === 'pgm' && film.pgm) || (selectedAccessibility === 'material_outros' && film.materialOutros && film.materialOutros.length > 0) || (selectedAccessibility === 'assistir_online' && film.assistirOnline && film.assistirOnline.trim() !== ''));
            const matchesOds = !selectedOds || (film.ods && film.ods.includes(selectedOds));
            const matchesBncc = !selectedBncc || (film.bnccCompetencias && film.bnccCompetencias.includes(parseInt(selectedBncc)));
            const matchesEtapa = !selectedEtapa || (film.bnccEtapas && film.bnccEtapas.includes(selectedEtapa));
            const matchesArea = !selectedArea || (film.bnccAreas && film.bnccAreas.includes(selectedArea));
            const matchesTema = !selectedTema || (film.bnccTemas && film.bnccTemas.includes(selectedTema));
            return matchesSearch && matchesGenre && matchesClassification && matchesAccessibility && matchesOds && matchesBncc && matchesEtapa && matchesArea && matchesTema;
        });

        updateFilmsCounter();
        currentFilms = sortFilms(currentFilms, sortOption);
        currentPage = 1;
        renderPagination();
        renderResults();
    }, 300);
}

/* ==========================================
   5. FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE
   ========================================== */
function updateFilmsCounter() {
    const countElement = document.getElementById('filmsCount');
    const counterContainer = document.querySelector('.results-counter');
    countElement.classList.add('updated');
    setTimeout(() => { countElement.classList.remove('updated'); }, 300);
    countElement.textContent = currentFilms.length;
    if (currentFilms.length === 0) { counterContainer.classList.add('sem-resultados'); counterContainer.classList.remove('com-resultados'); }
    else { counterContainer.classList.add('com-resultados'); counterContainer.classList.remove('sem-resultados'); }
}
function initializeFilters() {
    const genreSelect = document.getElementById('genreSelect');
    const odsSelect = document.getElementById('odsSelect');
    genreSelect.innerHTML = '<option value="">Todos os Gêneros</option>';
    odsSelect.innerHTML = '<option value="">Todos os ODS</option>';
    const allOds = [...new Set(allFilms.flatMap(film => film.ods || []))].sort((a, b) => { const numA = parseInt(a.match(/\d+/)?.[0] || 0); const numB = parseInt(b.match(/\d+/)?.[0] || 0); return numA - numB; });
    allGenres = [...new Set(allFilms.flatMap(film => film.genres || [film.genre]).filter(Boolean))].sort();
    allGenres.forEach(genre => { const option = document.createElement('option'); option.value = genre; option.textContent = genre; genreSelect.appendChild(option); });
    allOds.forEach(ods => { const option = document.createElement('option'); option.value = ods; option.textContent = `ODS ${ods}`; odsSelect.appendChild(option); });
    const bnccSelect = document.getElementById('bnccSelect');
    fetch('bncc_competencias.json').then(response => response.json()).then(competencias => { competencias.forEach(comp => { const option = document.createElement('option'); option.value = comp.id; option.textContent = `Comp. ${comp.id}: ${comp.titulo}`; bnccSelect.appendChild(option); }); }).catch(error => console.error('Erro ao carregar competências da BNCC:', error));
    const etapaSelect = document.getElementById('etapaSelect');
    const allEtapas = [...new Set(allFilms.flatMap(film => film.bnccEtapas || []))].sort();
    allEtapas.forEach(etapa => { const option = document.createElement('option'); option.value = etapa; option.textContent = etapa; etapaSelect.appendChild(option); });
    const areaSelect = document.getElementById('areaSelect');
    const allAreas = [...new Set(allFilms.flatMap(film => film.bnccAreas || []))].sort();
    allAreas.forEach(area => { const option = document.createElement('option'); option.value = area; option.textContent = area; areaSelect.appendChild(option); });
    const temaSelect = document.getElementById('temaSelect');
    const allTemas = [...new Set(allFilms.flatMap(film => film.bnccTemas || []))].sort();
    allTemas.forEach(tema => { const option = document.createElement('option'); option.value = tema; option.textContent = tema; temaSelect.appendChild(option); });
    document.getElementById('searchInput').addEventListener('input', filterAndRenderFilms);
    document.getElementById('sortSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('classificationSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('genreSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('accessibilitySelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('odsSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('bnccSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('etapaSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('areaSelect').addEventListener('change', filterAndRenderFilms);
    document.getElementById('temaSelect').addEventListener('change', filterAndRenderFilms);
}
function createThemesList(film) { const themes = [film.tema, ...(film.tags ? film.tags.split(' ') : [])]; return [...new Set(themes.filter(t => t))]; }
function renderTeachingPlansModal(film, encodedTitle) { if (!film.planos_de_aula || film.planos_de_aula.length === 0) { return '<p><i class="fas fa-info-circle"></i> Nenhum plano de aula disponível.</p>'; } const firstPlan = film.planos_de_aula[0]; let html = `<div class="teaching-plan-card"><p><strong><i class="fas fa-graduation-cap"></i> Nível de Ensino:</strong> ${firstPlan.nivel_ensino || ''}</p><p><strong><i class="fas fa-book"></i> Área de Conhecimento:</strong> ${firstPlan.area_conhecimento || ''}</p><p><strong><i class="fas fa-globe"></i> Site:</strong> <a href="${firstPlan.url}" target="_blank" rel="noopener noreferrer">${firstPlan.site}</a></p><p><strong><i class="fas fa-info-circle"></i> Descrição:</strong> ${firstPlan.descricao || ''}</p></div>`; if (film.planos_de_aula.length > 1) { const remainingCount = film.planos_de_aula.length - 1; html += `<a href="filme.html?titulo=${encodedTitle}" class="btn-ver-mais">+${remainingCount} Resultados</a>`; } return html; }
function renderOtherMaterialsModal(film, encodedTitle) { if (!film.materialOutros || film.materialOutros.length === 0) { return '<p><i class="fas fa-info-circle"></i> Nenhum material adicional disponível.</p>'; } const firstMaterial = film.materialOutros[0]; let html = `<div class="other-material-card"><p><strong><i class="fas fa-bookmark"></i> Tipo:</strong> ${firstMaterial.tipo || ''}</p><p><strong><i class="fas fa-file-alt"></i> Título:</strong> <a href="${firstMaterial.url}" target="_blank" rel="noopener noreferrer">${firstMaterial.titulo}</a></p></div>`; if (film.materialOutros.length > 1) { const remainingCount = film.materialOutros.length - 1; html += `<a href="filme.html?titulo=${encodedTitle}" class="btn-ver-mais">+${remainingCount} Resultados</a>`; } return html; }
function renderTeachingPlans(film) { if (!film.planos_de_aula || film.planos_de_aula.length === 0) { return '<p>Nenhum plano de aula disponível para este filme ainda.</p>'; } return film.planos_de_aula.map(plano => `<div class="teaching-plan-card"><p><strong><i class="fas fa-graduation-cap"></i> Nível de Ensino:</strong> ${plano.nivel_ensino || ''}</p><p><strong><i class="fas fa-book"></i> Área de Conhecimento:</strong> ${plano.area_conhecimento || ''}</p><p><strong><i class="fas fa-globe"></i> Site:</strong> <a href="${plano.url}" target="_blank" rel="noopener noreferrer">${plano.site}</a></p><p><strong><i class="fas fa-info-circle"></i> Descrição:</strong> ${plano.descricao || ''}</p></div>`).join(''); }
function renderOtherMaterials(film) { if (!film.materialOutros || film.materialOutros.length === 0) { return '<p>Nenhum material adicional disponível.</p>'; } return film.materialOutros.map(material => `<div class="other-material-card"><p><strong><i class="fas fa-bookmark"></i> Tipo:</strong> ${material.tipo || ''}</p><p><strong><i class="fas fa-file-alt"></i> Título:</strong> <a href="${material.url}" target="_blank" rel="noopener noreferrer">${material.titulo}</a></p></div>`).join(''); }

/* ==========================================
   6. FUNÇÕES DE RENDERIZAÇÃO E VISUALIZAÇÃO
   ========================================== */
function renderResults() {
    const loadingMessage = document.getElementById('loadingMessage');
    const paginationContainer = document.getElementById('pagination');
    loadingMessage.style.display = 'none';

    document.getElementById('filmGrid').style.display = 'none';
    document.getElementById('filmList').style.display = 'none';
    document.getElementById('map').style.display = 'none';

    if (currentView === 'grid') {
        document.getElementById('filmGrid').style.display = 'grid';
        paginationContainer.style.display = 'flex';
        renderGridView();
    } else if (currentView === 'list') {
        document.getElementById('filmList').style.display = 'block';
        paginationContainer.style.display = 'flex';
        renderListView();
    } else if (currentView === 'map') {
        paginationContainer.style.display = 'none';
        renderMapView();
    }
}
function renderGridView() {
    const filmGrid = document.getElementById('filmGrid');
    filmGrid.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filmsToRender = currentFilms.slice(startIndex, endIndex);
    if (filmsToRender.length === 0) { filmGrid.innerHTML = '<p class="no-results">Nenhum filme encontrado com os critérios selecionados.</p>'; return; }
    filmsToRender.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.className = 'film-card';
        const classificationClass = getClassificationClass(film.classification);
        const classificationText = film.classification <= 0 ? 'L' : film.classification;
        const coverPath = getDvdCover(film);
        filmCard.innerHTML = `<div class="film-poster-container"><img src="${coverPath}" alt="Capa do filme ${film.title}" class="film-poster" onerror="this.onerror=null; this.src='capas/progbrasil.png';"><div class="film-poster-controls"><button class="film-poster-control prev"><i class="fas fa-chevron-left"></i></button><button class="film-poster-control next"><i class="fas fa-chevron-right"></i></button></div><span class="classification ${classificationClass}">${classificationText}</span></div><div class="film-info"><h3 class="film-title">${film.title}</h3><p class="film-director">${film.director || 'Direção não informada'}</p><div class="film-details"><span><i class="fas fa-clock"></i> ${film.duration || '?'} min</span><span><i class="fas fa-calendar-alt"></i> ${film.year || '?'}</span></div><div class="film-genres">${film.genres ? film.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('') : ''}</div></div>`;
        filmCard.addEventListener('click', () => openModal(film));
        filmGrid.appendChild(filmCard);
    });
    initializePosterControls();
}
function renderListView() {
    const filmList = document.getElementById('filmList');
    filmList.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filmsToRender = currentFilms.slice(startIndex, endIndex);
    if (filmsToRender.length === 0) { filmList.innerHTML = '<p class="no-results" style="margin: 0;">Nenhum filme encontrado com os critérios selecionados.</p>'; return; }
    const headerHTML = `<div class="list-header"><div class="list-col col-title">Título</div><div class="list-col col-year">Ano</div><div class="list-col col-genre">Gênero</div><div class="list-col col-duration">Duração</div><div class="list-col col-class">Class.</div></div>`;
    const itemsHTML = filmsToRender.map(film => {
        const classificationClass = getClassificationClass(film.classification);
        const classificationText = film.classification <= 0 ? 'L' : film.classification;
        const coverPath = getDvdCover(film);
        return `<div class="list-item" onclick="openModal(allFilms.find(f => f.title === '${film.title.replace(/'/g, "\\'")}'))"><div class="list-col col-title"><img src="${coverPath}" alt="Capa de ${film.title}" class="list-item-poster" onerror="this.onerror=null; this.src='capas/progbrasil.png';"><div class="list-item-info"><h4>${film.title}</h4><p>${film.director || 'Direção não informada'}</p></div></div><div class="list-col col-year">${film.year || '?'}</div><div class="list-col col-genre">${film.genres.slice(0, 2).map(g => `<span class="genre-tag">${g}</span>`).join('') || 'N/A'}</div><div class="list-col col-duration">${film.duration || '?'} min</div><div class="list-col col-class"><span class="classification ${classificationClass}">${classificationText}</span></div></div>`;
    }).join('');
    filmList.innerHTML = headerHTML + itemsHTML;
}
function renderMapView() {
    const mapContainer = document.getElementById('map');
    mapContainer.style.display = 'block'; // GARANTE QUE O MAPA ESTEJA VISÍVEL ANTES DE INICIALIZAR

    if (!mapInstance) {
        initializeMap();
    } else {
        // FORÇA O MAPA A RECALCULAR SEU TAMANHO CASO A JANELA TENHA MUDADO
        mapInstance.invalidateSize();
    }

    markersCluster.clearLayers();
    const filmsOnMap = currentFilms.filter(film => film.state || film.city);

    filmsOnMap.forEach(film => {
        const coords = getCoordenadas(film);
        if (coords) {
            const jitter = 0.0005;
            const adjustedCoords = [coords[0] + (Math.random() - 0.5) * jitter, coords[1] + (Math.random() - 0.5) * jitter];
            const marker = L.marker(adjustedCoords).bindPopup(criarConteudoPopup(film), { maxWidth: window.innerWidth <= 768 ? 200 : 300, autoPan: true, closeButton: true });
            markersCluster.addLayer(marker);
        }
    });

    if (filmsOnMap.length > 0) {
        mapInstance.fitBounds(markersCluster.getBounds(), { padding: [50, 50] });
    }
}
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(currentFilms.length / itemsPerPage);
    if (totalPages <= 1) return;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage === totalPages) { startPage = Math.max(1, totalPages - maxVisiblePages + 1); }
    if (currentPage > 1) { paginationContainer.appendChild(createPageButton('<i class="fas fa-angle-double-left"></i>', 1, 'Primeira Página')); }
    if (currentPage > 1) { paginationContainer.appendChild(createPageButton('<i class="fas fa-angle-left"></i>', currentPage - 1, 'Página Anterior')); }
    for (let i = startPage; i <= endPage; i++) { paginationContainer.appendChild(createPageButton(i, i)); }
    if (currentPage < totalPages) { paginationContainer.appendChild(createPageButton('<i class="fas fa-angle-right"></i>', currentPage + 1, 'Próxima Página')); }
    if (currentPage < totalPages) { paginationContainer.appendChild(createPageButton('<i class="fas fa-angle-double-right"></i>', totalPages, 'Última Página')); }
}
function createPageButton(content, pageNumber, title = '') {
    const button = document.createElement('button');
    button.innerHTML = content;
    if (title) button.title = title;
    if (pageNumber === currentPage && typeof content === 'number') { button.classList.add('active'); }
    button.addEventListener('click', () => {
        currentPage = pageNumber;
        renderResults();
        renderPagination();
        window.scrollTo(0, 0);
    });
    return button;
}

/* ==========================================
   7. FUNÇÕES DO MAPA (MIGRADAS DE mapa.js)
   ========================================== */
function initializeMap() {
    if (mapInstance) return;
    mapInstance = L.map('map').setView([-15.7975, -47.8919], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 3
    }).addTo(mapInstance);
    markersCluster = L.markerClusterGroup();
    mapInstance.addLayer(markersCluster);
}
function getCoordenadas(filme) {
    if (filme.city && coordenadas.cidades[filme.city]) { return coordenadas.cidades[filme.city]; }
    if (filme.state && coordenadas.capitais[filme.state]) { return coordenadas.capitais[filme.state]; }
    return null;
}
function criarConteudoPopup(filme) {
    const encodedTitle = encodeURIComponent(film.title);
    return `<div class="filme-popup"><h5>${film.title}</h5><p><strong>Direção:</strong> ${film.director}<br><strong>Ano:</strong> ${film.year}<br><strong>Gênero:</strong> ${film.genres.join(', ')}</p><a href="filme.html?titulo=${encodedTitle}" class="ver-mais">Ver mais informações</a></div>`;
}

/* ==========================================
   8. FUNÇÕES DO MODAL
   ========================================== */
function openModal(film) {
    const modal = document.getElementById('filmModal');
    const modalContent = document.getElementById('modalContent');
    const classificationClass = getClassificationClass(film.classification);
    const classificationText = film.classification <= 0 ? 'L' : film.classification;
    const coverPath = getDvdCover(film);
    const encodedTitle = encodeURIComponent(film.title);
    const themes = createThemesList(film);
    const hasThemes = themes.length > 0;
    const hasAdditionalInfo = film.audiodescricao || film.closedCaption || film.website || film.festivais || film.premios || film.legendasOutras;
    modalContent.innerHTML = `<div class="modal-header"><div class="modal-poster-container"><img src="${coverPath}" alt="Capa do filme ${film.title}" class="modal-poster" onerror="this.onerror=null; this.src='capas/progbrasil.png';"><div class="modal-poster-controls"><button class="modal-poster-control prev"><i class="fas fa-chevron-left"></i></button><button class="modal-poster-control next"><i class="fas fa-chevron-right"></i></button></div><span class="classification ${classificationClass}">${classificationText}</span></div></div><h2 class="modal-title">${film.title}</h2><div class="modal-details">${film.director?`<p><strong><i class="fas fa-user"></i> Direção:</strong> ${film.director}</p>`:""}${film.cast?`<p><strong><i class="fas fa-users"></i> Elenco:</strong> ${film.cast}</p>`:""}${film.duration?`<p><strong><i class="fas fa-clock"></i> Duração:</strong> ${film.duration} min</p>`:""}${film.genre?`<p><strong><i class="fas fa-tag"></i> Gênero:</strong> ${film.genre}</p>`:""}${film.year?`<p><strong><i class="fas fa-calendar-alt"></i> Ano:</strong> ${film.year}</p>`:""}${film.imdb.votantes?`<p><strong><i class="fab fa-imdb"></i> IMDb:</strong> ${film.imdb.votantes}</p>`:""}${film.country?`<p><strong><i class="fas fa-globe-americas"></i> País:</strong> ${film.country}</p>`:""}${film.state?`<p><strong><i class="fas fa-map-marker-alt"></i> UF:</strong> ${film.state}</p>`:""}${film.dvd?`<p><strong><i class="fas fa-compact-disc"></i> DVD:</strong> ${film.dvd}</p>`:""}</div>${hasThemes?`<div class="modal-themes"><h3><i class="fas fa-tags"></i> Temas</h3>${themes.map(theme=>`<span class="theme-tag">${theme}</span>`).join("")}</div>`:""}${film.synopsis?`<div class="modal-synopsis"><h3><i class="fas fa-align-left"></i> Sinopse</h3><p>${film.synopsis}</p></div>`:""}${hasAdditionalInfo?`<div class="modal-additional"><h3><i class="fas fa-info-circle"></i> Informações Adicionais</h3>${film.audiodescricao?`<p><strong><i class="fas fa-assistive-listening-systems"></i> Audiodescrição:</strong> ${film.audiodescricao}</p>`:""}${film.closedCaption?`<p><strong><i class="fas fa-closed-captioning"></i> Closed Caption:</strong> ${film.closedCaption}</p>`:""}${film.website?`<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${film.website.startsWith("http")?film.website:"https://"+film.website}" target="_blank" rel="noopener noreferrer">${film.website}</a></p>`:""}${film.festivais?`<p><strong><i class="fas fa-trophy"></i> Festivais:</strong> ${film.festivais}</p>`:""}${film.premios?`<p><strong><i class="fas fa-award"></i> Prêmios:</strong> ${film.premios}</p>`:""}${film.legendasOutras?`<p><strong><i class="fas fa-language"></i> Outras Legendas:</strong> ${film.legendasOutras}</p>`:""}</div>`:""}<div class="modal-other-materials"><h3><i class="fas fa-box-open"></i> Outros Materiais</h3>${renderOtherMaterialsModal(film,encodedTitle)}</div><div class="modal-teaching-plans"><h3><i class="fas fa-chalkboard-teacher"></i> Planos de Aula</h3>${renderTeachingPlansModal(film,encodedTitle)}<a href="https://docs.google.com/forms/d/e/1FAIpQLSdxQz8onMOFjxIqEPpo5v2I4CJdLQ9cN50I7zUhmnBwgUeGIQ/viewform?usp=sharing&ouid=101786859238464224020" target="_blank" rel="noopener noreferrer" class="btn-enviar-plano" style="display:inline-block; margin-top:15px; background:#009a44; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:500;"><i class="fas fa-plus"></i> Envie um plano de aula</a><p style="font-size: 0.95em; color: #666; margin-top: 6px;">Você pode colaborar enviando um plano de aula para este filme. Ao clicar, você será direcionado a um formulário.</p></div><div style="text-align: center; margin-top: 20px;"><a href="filme.html?titulo=${encodedTitle}" class="btn-enviar-plano" style="display:inline-block; background:#009a44; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:500;"><i class="fas fa-external-link-alt"></i> Ver página completa do filme</a></div>`;
    const closeButton = modalContent.parentNode.querySelector('.close');
    if (closeButton) { closeButton.onclick = closeModal; }
    modal.style.display = 'block';
    setTimeout(() => { modal.classList.add('show'); }, 10);
    document.addEventListener('keydown', handleKeyDown);
    window.onclick = function(event) { if (event.target == modal) { closeModal(); } }
}
function closeModal() {
    const modal = document.getElementById('filmModal');
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
    document.removeEventListener('keydown', handleKeyDown);
    window.onclick = null;
}
function handleKeyDown(e) { if (e.key === 'Escape') { closeModal(); } }

/* ==========================================
   9. FUNÇÕES DE CARREGAMENTO INICIAL
   ========================================== */

async function initializeApp() {
    async function initializeApp() {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'flex';
    try {
        const response = await fetch('catalogo.json');
        if (!response.ok) { throw new Error(`Erro ao carregar catalogo.json: ${response.statusText}`); }
        const data = await response.json();

        // LÓGICA DE EXPANSÃO DE FILMES PARA MÚLTIPLAS LOCALIDADES
        const expandedData = data.reduce((acc, filmeJson) => {
            // AGORA USANDO A VARIÁVEL CORRETA: "filmeJson"
            const ufs = filmeJson.UF || [];
            const cidades = filmeJson.cidade || [];

            // PRIORIZA CIDADES, POIS SÃO MAIS ESPECÍFICAS
            if (cidades.length > 0) {
                cidades.forEach(cidade => {
                    // PARA CADA CIDADE, ENCONTRA A UF CORRESPONDENTE SE POSSÍVEL
                    // (ESTA PARTE É UM REFINAMENTO PARA MELHORAR A PRECISÃO)
                    let ufAssociada = '';
                    for (const estado in coordenadas.cidades) {
                        if (coordenadas.cidades[estado] === coordenadas.cidades[cidade]) {
                             ufAssociada = Object.keys(coordenadas.capitais).find(key => coordenadas.capitais[key] === coordenadas.cidades[estado]);
                             break;
                        }
                    }
                    // SE A CIDADE NÃO É UMA CAPITAL, USA A PRIMEIRA UF DA LISTA COMO REFERÊNCIA
                    if (!ufAssociada && ufs.length > 0) {
                        ufAssociada = ufs[0];
                    }
                    
                    acc.push({ ...filmeJson, cidade: cidade, UF: ufAssociada });
                });
            } else if (ufs.length > 0) {
                // SE NÃO HÁ CIDADES, EXPANDE PELAS UFS
                ufs.forEach(uf => {
                    acc.push({ ...filmeJson, UF: uf, cidade: '' }); // cidade vira string vazia
                });
            } else {
                // SE NÃO TEM LOCALIZAÇÃO, APENAS ADICIONA
                acc.push(filmeJson);
            }
            return acc;
        }, []);

        // AGORA, A TRANSFORMAÇÃO É FEITA NOS DADOS JÁ EXPANDIDOS
        allFilms = expandedData.map(transformFilmData);
        
        allGenres = [...new Set(allFilms.flatMap(film => film.genres))].sort();
        initializeFilters();
        filterAndRenderFilms();

    } catch (error) {
        console.error("Erro ao inicializar:", error);
        const filmGrid = document.getElementById('filmGrid');
        if (filmGrid) { filmGrid.innerHTML = `<p class="error-message">Falha ao carregar o catálogo de filmes. Tente recarregar a página.</p>`; }
        loadingMessage.style.display = 'none';
    }
}

/* ==========================================
   10. EVENT LISTENERS
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewListBtn = document.getElementById('viewListBtn');
    const viewMapBtn = document.getElementById('viewMapBtn');

    function setView(view) {
        currentView = view;
        localStorage.setItem('preferredView', view);
        viewGridBtn.classList.toggle('active', view === 'grid');
        viewListBtn.classList.toggle('active', view === 'list');
        viewMapBtn.classList.toggle('active', view === 'map');
        renderResults();
    }

    viewGridBtn.addEventListener('click', () => setView('grid'));
    viewListBtn.addEventListener('click', () => setView('list'));
    viewMapBtn.addEventListener('click', () => setView('map'));

    const savedView = localStorage.getItem('preferredView');
    if (savedView) {
        setView(savedView);
    }
});

// CONTROLE DE ROLAGEM DAS CAPAS DOS FILMES
function initializePosterControls() {
    document.querySelectorAll('.film-poster-container').forEach(container => {
        const img = container.querySelector('.film-poster');
        const prev = container.querySelector('.film-poster-control.prev');
        const next = container.querySelector('.film-poster-control.next');
        if (prev && next) {
            prev.addEventListener('click', (e) => { e.stopPropagation(); img.style.transform = 'translateX(50%)'; });
            next.addEventListener('click', (e) => { e.stopPropagation(); img.style.transform = 'translateX(0)'; });
        }
    });
    document.querySelectorAll('.modal-poster-container').forEach(container => {
        const img = container.querySelector('.modal-poster');
        const prev = container.querySelector('.modal-poster-control.prev');
        const next = container.querySelector('.modal-poster-control.next');
        if (prev && next) {
            prev.addEventListener('click', (e) => { e.stopPropagation(); img.style.transform = 'translateX(50%)'; });
            next.addEventListener('click', (e) => { e.stopPropagation(); img.style.transform = 'translateX(0)'; });
        }
    });
}
