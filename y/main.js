// ARQUIVO PRINCIPAL DE JAVASCRIPT

// VARIÁVEIS GLOBAIS
let allFilms = [];
let currentFilms = [];
let currentPage = 1;
const itemsPerPage = 20;
let allGenres = [];
let selectedGenre = '';

// FUNÇÃO PARA LIMPAR CAMPOS INDEFINIDOS OU VAZIOS
function cleanField(value) {
    if (!value) return '';
    return String(value).replace(/^"|"$/g, '').trim();
}

// FUNÇÃO PARA OBTER CAPA DO DVD
function getDvdCover(filmData) {
    const DEFAULT_COVER = 'capas/progbrasil.png';
    if (filmData.imageName) {
        const baseName = filmData.imageName.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        return `capas/${baseName}.jpg`;
    }
    return DEFAULT_COVER;
}

// FUNÇÃO PARA CRIAR POSTER INTELIGENTE COM FALLBACK E LAZY LOADING
function createSmartPoster(film) {
    const img = new Image();
    img.className = 'film-poster';
    img.alt = film.title || 'Capa do filme';
    img.loading = 'lazy'; // LAZY LOADING

    let fallbackCount = 0; // EVITA LOOP INFINITO

    img.onerror = function() {
        fallbackCount++;
        if (fallbackCount === 1 && film.imageName) {
            const baseName = film.imageName.replace(/\.(jpg|jpeg|png|gif)$/i, '');
            this.src = `capas/${baseName}.png`;
        } else if (fallbackCount === 2) {
            this.src = 'capas/progbrasil.png';
        }
    };

    img.src = getDvdCover(film);
    return img;
}

// FUNÇÃO PARA PEGAR CLASSE CSS DA CLASSIFICAÇÃO INDICATIVA
function getClassificationClass(age) {
    if (!age || age <= 0) return 'L';
    const ageNum = typeof age === 'string' ? parseInt(age) : age;
    switch(ageNum) {
        case 10: return 'ten';
        case 12: return 'twelve';
        case 14: return 'fourteen';
        case 16: return 'sixteen';
        case 18: return 'eighteen';
        default: return 'L';
    }
}

// TRANSFORMA DADOS DO JSON PARA FORMATO INTERNO
function transformFilmData(originalFilm) {
    let imdbData = { votantes: '' };
    if (originalFilm["nota imdb/votantes"]) {
        const [nota, votantes] = String(originalFilm["nota imdb/votantes"]).split('/');
        imdbData = { votantes: `${nota || ''}/${votantes || ''}`.trim() };
    }
    return {
        title: cleanField(originalFilm["Título do filme"]),
        director: cleanField(originalFilm["Direção"]),
        cast: cleanField(originalFilm["Elenco"]),
        duration: parseInt(originalFilm["Dur.(´)"]) || 0,
        genre: cleanField(originalFilm["GEN."]),
        year: parseInt(originalFilm["Ano"]) || 0,
        imdb: imdbData,
        country: cleanField(originalFilm["País"]),
        state: cleanField(originalFilm["UF"]),
        city: cleanField(originalFilm["cidade"]),
        audiodescricao: cleanField(originalFilm["Audiodescrição"]),
        closedCaption: cleanField(originalFilm["Closed Caption"]),
        synopsis: cleanField(originalFilm["Sinopse"]),
        tema: cleanField(originalFilm["tema (Programadora Brasil)"]),
        tags: cleanField(originalFilm["tags"]),
        website: cleanField(originalFilm["website"]),
        portaCurta: cleanField(originalFilm["Porta Curta"]),
        festivais: cleanField(originalFilm["festivais"]),
        premios: cleanField(originalFilm["premios"]),
        legendasOutras: cleanField(originalFilm["legendas_outras"]),
        materialOutros: cleanField(originalFilm["material_outros"]),
        duracaoFormato: cleanField(originalFilm["duracao FORMATO"]),
        nossoAcervo: cleanField(originalFilm["Nosso Acervo"]),
        pgm: parseInt(originalFilm["PGM"]) || 0,
        filmes: parseInt(originalFilm["Filmes"]) || 0,
        dvd: cleanField(originalFilm["Nome do Programa"]),
        imageName: cleanField(originalFilm["imageName"]),
        classification: parseInt(originalFilm["Classificação Indicativa POR PGM"]) || 0
    };
}

// FUNÇÃO PARA ORDENAR FILMES
function sortFilms(films, sortOption) {
    const sortedFilms = [...films];
    switch(sortOption) {
        case 'title-asc':
            sortedFilms.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sortedFilms.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'year-asc':
            sortedFilms.sort((a, b) => a.year - b.year);
            break;
        case 'year-desc':
            sortedFilms.sort((a, b) => b.year - a.year);
            break;
        default:
            break;
    }
    return sortedFilms;
}

// FUNÇÃO PARA RENDERIZAR TAGS DE GÊNERO
function renderGenreTags() {
    const genreTagsDiv = document.getElementById('genreTags');
    genreTagsDiv.innerHTML = '';
    // TAG 'TODOS'
    const tagTodos = document.createElement('div');
    tagTodos.className = 'genre-tag active';
    tagTodos.dataset.genre = '';
    tagTodos.tabIndex = 0;
    tagTodos.textContent = 'Todos';
    genreTagsDiv.appendChild(tagTodos);

    allGenres.forEach(genre => {
        const tag = document.createElement('div');
        tag.className = 'genre-tag';
        tag.dataset.genre = genre;
        tag.tabIndex = 0;
        tag.textContent = genre;
        genreTagsDiv.appendChild(tag);
    });
}

// FUNÇÃO PARA ATUALIZAR CONTADOR DE FILMES
function updateFilmsCounter() {
    const count = currentFilms.length;
    const counter = document.getElementById('filmsCount');
    counter.textContent = count;
    const resultsCounterDiv = document.getElementById('resultsCounter');
    if (count === 0) {
        resultsCounterDiv.classList.add('sem-resultados');
        resultsCounterDiv.classList.remove('com-resultados');
    } else {
        resultsCounterDiv.classList.add('com-resultados');
        resultsCounterDiv.classList.remove('sem-resultados');
    }
}

// FUNÇÃO PARA CARREGAR DADOS DO CATÁLOGO
async function loadCatalogData() {
    try {
        // SKELETON LOADING
        document.getElementById('loadingMessage').style.display = 'block';
        const response = await fetch('catalogo.json');
        if (!response.ok) throw new Error('Erro ao carregar o arquivo');
        const data = await response.json();
        allFilms = data.map(transformFilmData);
        allGenres = [...new Set(allFilms.map(film => film.genre).filter(Boolean))].sort();
        renderGenreTags();
        currentFilms = allFilms;
        updateFilmsCounter(); 
        renderFilms();
    } catch (error) {
        document.getElementById('loadingMessage').innerHTML = `
            <div style="color: #cc0000; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 15px;"></i>
                <p>Erro ao carregar o catálogo. Tente novamente.</p>
            </div>`;
    } finally {
        document.getElementById('loadingMessage').style.display = 'none';
    }
}


// OUTRAS FUNÇÕES (RENDERIZAÇÃO DE FILMES, MODAL, PAGINAÇÃO, FILTROS, EVENTOS) ...
// (RECOMENDO PROSSEGUIR AQUI, ADICIONANDO OS COMENTÁRIOS EM MAIÚSCULAS EM CADA FUNÇÃO IMPORTANTE)

// EXEMPLO DE EVENTO PARA FECHAR MODAL COM ESC
document.addEventListener('keydown', function(event) {
    // PERMITE FECHAR MODAL COM ESC
    if (event.key === 'Escape') {
        const modal = document.getElementById('filmModal');
        if (modal && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    }
});

// FUNÇÃO PARA FECHAR MODAL
function closeModal() {
    const modal = document.getElementById('filmModal');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
}

// EVENTO PARA ABRIR MODAL DE FILME (EXEMPLO, DEVE SER INTEGRADO NA FUNÇÃO DE RENDERIZAÇÃO DOS CARDS)
function openModal(film) {
    const modal = document.getElementById('filmModal');
    // ... (codigo para preencher modal)
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
    document.getElementById('closeModal').focus();
}

// BOTÃO "LIMPAR FILTROS"
document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    selectedGenre = '';
    document.getElementById('sortSelect').value = '';
    currentFilms = allFilms;
    updateFilmsCounter();
    renderFilms();
});

// AO INICIAR, CARREGAR O CATALOGO
window.onload = loadCatalogData;
