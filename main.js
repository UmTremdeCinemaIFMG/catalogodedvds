// Variáveis globais
let allFilms = [];
let currentFilms = [];
let currentPage = 1;
const itemsPerPage = 20;
let allGenres = [];
let debounceTimer;
let selectedGenre = '';

// Função para limpar campos
function cleanField(value) {
    if (!value) return '';
    return String(value).replace(/^"|"$/g, '').trim();
}

// Função para obter capa do DVD
function getDvdCover(filmData) {
    console.log("Buscando capa para:", filmData.imageName);
    const DEFAULT_COVER = 'capas/progbrasil.png';
    
    if (filmData.imageName) {
        const baseName = filmData.imageName.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        const imagePath = `capas/${baseName}.jpg`;
        console.log("Tentando carregar:", imagePath);
        return imagePath;
    }
    
    return DEFAULT_COVER;
}

// Função para criar a imagem com fallback
function createSmartPoster(film) {
    const img = new Image();
    img.className = 'film-poster';
    img.alt = film.title || 'Capa do filme';
    
    img.onerror = function() {
        console.error("Falha ao carregar:", this.src);
        if (film.imageName) {
            const baseName = film.imageName.replace(/\.(jpg|jpeg|png|gif)$/i, '');
            const fallbackPath = `capas/${baseName}.png`;
            console.log("Tentando fallback PNG:", fallbackPath);
            this.src = fallbackPath;
            this.onerror = function() {
                console.error("Fallback também falhou, usando padrão");
                this.src = 'capas/progbrasil.png';
            };
        } else {
            this.src = 'capas/progbrasil.png';
        }
    };
    
    img.src = getDvdCover(film);
    console.log("Imagem definida como:", img.src);
    
    return img;
}

// Classificação por cores
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

// Transformar dados do JSON
function transformFilmData(originalFilm) {
    console.log("Original imageName:", originalFilm["imageName"]);
    
    let imdbData = { votantes: '' };
    if (originalFilm["nota imdb/votantes"]) {
        const [nota, votantes] = String(originalFilm["nota imdb/votantes"]).split('/');
        imdbData = { votantes: `${nota}/${votantes || ''}`.trim() };
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

// Função para ordenar os filmes
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
    }
    
    return sortedFilms;
}

// Carregar dados do JSON
async function loadCatalogData() {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch('catalogo.json');
        if (!response.ok) throw new Error('Erro ao carregar o arquivo');
        
        const data = await response.json();
        allFilms = data.map(transformFilmData);
        
        allGenres = [...new Set(allFilms.map(film => film.genre).filter(Boolean))].sort();
        
        renderGenreTags();
        
        currentFilms = allFilms;
        document.getElementById('loadingMessage').style.display = 'none';
        updateFilmsCounter();
        renderFilms();
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('loadingMessage').innerHTML = `
            <div style="color: var(--vermelho); text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 15px;"></i>
                <p style="font-weight: bold;">Erro ao carregar o catálogo</p>
                <p>${error.message}</p>
                <button onclick="loadCatalogData()" style="margin-top: 15px; padding: 8px 15px; background-color: var(--verde-ifmg); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
    }
}

// Renderizar tags de gênero
function renderGenreTags() {
    const genreTagsContainer = document.getElementById('genreTags');
    
    const allTag = document.createElement('div');
    allTag.className = 'genre-tag active';
    allTag.textContent = 'Todos';
    allTag.dataset.genre = '';
    allTag.addEventListener('click', function() {
        selectedGenre = '';
        
        document.querySelectorAll('.genre-tag').forEach(t => {
            t.classList.remove('active');
        });
        this.classList.add('active');
        
        filterAndRenderFilms();
    });

    genreTagsContainer.innerHTML = '';
    genreTagsContainer.appendChild(allTag);
    
    allGenres.forEach(genre => {
        const tag = document.createElement('div');
        tag.className = 'genre-tag';
        tag.textContent = genre;
        tag.dataset.genre = genre;
        
        if (genre === selectedGenre) {
            tag.classList.add('active');
        }
        
        tag.addEventListener('click', function() {
            selectedGenre = this.dataset.genre;
            
            document.querySelectorAll('.genre-tag').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            filterAndRenderFilms();
        });
        
        genreTagsContainer.appendChild(tag);
    });
}

// Filtrar e renderizar filmes
function filterAndRenderFilms() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const sortOption = document.getElementById('sortSelect').value;
        
        currentFilms = allFilms.filter(film => {
            const matchesSearch = 
                film.title.toLowerCase().includes(searchTerm) ||
                (film.director && film.director.toLowerCase().includes(searchTerm)) ||
                (film.cast && film.cast.toLowerCase().includes(searchTerm)) ||
                (film.synopsis && film.synopsis.toLowerCase().includes(searchTerm)) ||
                (film.tema && film.tema.toLowerCase().includes(searchTerm)) ||
                (film.tags && film.tags.toLowerCase().includes(searchTerm)) ||
                (film.dvd && film.dvd.toLowerCase().includes(searchTerm));
            
            const matchesGenre = selectedGenre === '' || film.genre === selectedGenre;
            
            return matchesSearch && matchesGenre;
        });

        updateFilmsCounter();
        currentFilms = sortFilms(currentFilms, sortOption);
        
        currentPage = 1;
        renderPagination();
        renderFilms();
    }, 300);
}

// Atualizar contador de filmes
function updateFilmsCounter() {
    const countElement = document.getElementById('filmsCount');
    const counterContainer = document.querySelector('.results-counter');
    
    countElement.classList.add('updated');
    setTimeout(() => {
        countElement.classList.remove('updated');
    }, 300);

    countElement.textContent = currentFilms.length;
    
    if (currentFilms.length === 0) {
        counterContainer.classList.add('sem-resultados');
        counterContainer.classList.remove('com-resultados');
    } else {
        counterContainer.classList.add('com-resultados');
        counterContainer.classList.remove('sem-resultados');
    }
}

// Criar controles de navegação para imagens
function createImageControls(container, image) {
    const controls = document.createElement('div');
    controls.className = container.classList.contains('modal-poster-container') ? 
        'modal-poster-controls' : 'film-poster-controls';
    
    const leftButton = document.createElement('button');
    leftButton.className = container.classList.contains('modal-poster-container') ? 
        'modal-poster-control' : 'film-poster-control';
    leftButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTransform = image.style.transform || 'translateX(0)';
        const currentX = parseInt(currentTransform.match(/translateX\(([-\d]+)px\)/)?.[1] || 0);
        const newX = Math.min(currentX + 100, 0);
        image.style.transform = `translateX(${newX}px)`;
    });
    
    const rightButton = document.createElement('button');
    rightButton.className = container.classList.contains('modal-poster-container') ? 
        'modal-poster-control' : 'film-poster-control';
    rightButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTransform = image.style.transform || 'translateX(0)';
        const currentX = parseInt(currentTransform.match(/translateX\(([-\d]+)px\)/)?.[1] || 0);
        const containerWidth = container.clientWidth;
        const imageWidth = image.clientWidth;
        const maxX = containerWidth - imageWidth;
        const newX = Math.max(currentX - 100, maxX);
        image.style.transform = `translateX(${newX}px)`;
    });
    
    controls.appendChild(leftButton);
    controls.appendChild(rightButton);
    container.appendChild(controls);
    
    setTimeout(() => {
        const containerWidth = container.clientWidth;
        const imageWidth = image.clientWidth;
        if (imageWidth > containerWidth) {
            const initialX = containerWidth - imageWidth;
            image.style.transform = `translateX(${initialX}px)`;
        }
    }, 50);
}

// Renderizar filmes
function renderFilms() {
    const filmGrid = document.getElementById('filmGrid');
    filmGrid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filmsToShow = currentFilms.slice(startIndex, endIndex);
    
    if (filmsToShow.length === 0) {
        filmGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-film"></i>
                <p>Nenhum filme encontrado com os critérios selecionados.</p>
                <button onclick="resetFilters()" style="margin-top: 15px; padding: 8px 15px; background-color: var(--verde-ifmg); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-undo"></i> Limpar filtros
                </button>
            </div>
        `;
        return;
    }
    
    filmsToShow.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.className = 'film-card';
        
        if (film.classification !== undefined) {
            const classificationClass = getClassificationClass(film.classification);
            const classificationText = film.classification <= 0 ? 'L' : film.classification;
            
            const classificationBadge = document.createElement('div');
            classificationBadge.className = 'film-badge';
            classificationBadge.innerHTML = `
                <span class="classification ${classificationClass}">${classificationText}</span>
            `;
            filmCard.appendChild(classificationBadge);
        }
        
        const posterContainer = document.createElement('div');
        posterContainer.className = 'film-poster-container';
        
        const posterImg = createSmartPoster(film);
        
        posterImg.onload = function() {
            createImageControls(posterContainer, posterImg);
        };
        
        posterContainer.appendChild(posterImg);
        
        const filmInfo = document.createElement('div');
        filmInfo.className = 'film-info';
        
        const title = document.createElement('h3');
        title.className = 'film-title';
        title.textContent = film.title;
        
        const meta = document.createElement('div');
        meta.className = 'film-meta';
        
        
