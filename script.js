                /* ==========================================
                   1. VARIÁVEIS E CONFIGURAÇÕES GLOBAIS
                   ========================================== */
                let allFilms = [];           // ARMAZENA TODOS OS FILMES DO CATÁLOGO
                let currentFilms = [];       // ARMAZENA OS FILMES FILTRADOS ATUALMENTE
                let currentPage = 1;         // PÁGINA ATUAL DA PAGINAÇÃO
                let allGenres = [];          // LISTA DE TODOS OS GÊNEROS ÚNICOS
                let selectedGenre = '';      // GÊNERO SELECIONADO ATUALMENTE
                let debounceTimer;          // TIMER PARA DEBOUNCE DA BUSCA
                const itemsPerPage = 20;     // QUANTIDADE DE FILMES POR PÁGINA
                
                /* ==========================================
                   2. FUNÇÕES DE UTILIDADE E FORMATAÇÃO
                   ========================================== */
                
                // LIMPA E FORMATA CAMPOS DE TEXTO
                function cleanField(value) {
                    if (!value) return '';
                    return String(value).replace(/^\"|\"$/g, '').trim();
                }
                
                // OBTÉM A CLASSE CSS PARA CLASSIFICAÇÃO INDICATIVA
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
                
                // GERENCIA O CARREGAMENTO DE CAPAS DOS FILMES
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
                
                /* ==========================================
                   3. FUNÇÕES DE TRANSFORMAÇÃO E ORDENAÇÃO
                   ========================================== */
                
                // TRANSFORMA DADOS DO JSON PARA O FORMATO DESEJADO
                function transformFilmData(originalFilm) {
                    console.log("Original imageName:", originalFilm["imageName"]);
                    
                    // TRATAMENTO ESPECIAL PARA NOTA IMDB
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
                        trailer: cleanField(originalFilm["trailer"] || ''),
                        synopsis: cleanField(originalFilm["Sinopse"]),
                        tema: cleanField(originalFilm["tema (Programadora Brasil)"]),
                        tags: cleanField(originalFilm["tags"]),
                        website: cleanField(originalFilm["website"]),
                        portaCurta: cleanField(originalFilm["Porta Curta"]),
                        festivais: cleanField(originalFilm["festivais"]),
                        premios: cleanField(originalFilm["premios"]),
                        legendasOutras: cleanField(originalFilm["legendas_outras"]),
                        materialOutros: (() => {
    const material = originalFilm["material_outros"];
    if (!material) return [];
    if (typeof material === 'string') {
        // Converte string em um objeto no formato esperado
        return [{
            tipo: material,
            titulo: material,
            url: '#'
        }];
    }
    // Se já for array, retorna como está
    return Array.isArray(material) ? material : [];
})(),
                        duracaoFormato: cleanField(originalFilm["duracao FORMATO"]),
                        pgm: parseInt(originalFilm["PGM"]) || 0,
                        filmes: parseInt(originalFilm["Filmes"]) || 0,
                        dvd: cleanField(originalFilm["Nome do Programa"]),
                        imageName: cleanField(originalFilm["imageName"]),
                        classification: parseInt(originalFilm["Classificação Indicativa POR PGM"]) || 0,
                        planos_de_aula: originalFilm["planos_de_aula"] || [],
                        videos: originalFilm["videos"] || []
                      
                    };
                }
                
                // ORDENAÇÃO DOS FILMES
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
                        case 'duration-asc':
                            sortedFilms.sort((a, b) => a.duration - b.duration);
                            break;
                        case 'duration-desc':
                            sortedFilms.sort((a, b) => b.duration - a.duration);
                            break;
                    }
                    
                    return sortedFilms;
                }
                
                /* ==========================================
                   4. FUNÇÕES DE FILTRO E BUSCA
                   ========================================== */
                
                // FILTRA E RENDERIZA OS FILMES COM DEBOUNCE
                function filterAndRenderFilms() {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                        const sortOption = document.getElementById('sortSelect').value;
                        const selectedClassification = document.getElementById('classificationSelect').value;
                        const selectedGenre = document.getElementById('genreSelect').value;
                        const selectedAccessibility = document.getElementById('accessibilitySelect').value;
                        
                        // APLICA TODOS OS FILTROS
                        currentFilms = allFilms.filter(film => {
                            const matchesSearch = 
                                film.title.toLowerCase().includes(searchTerm) ||
                                (film.director && film.director.toLowerCase().includes(searchTerm)) ||
                                (film.cast && film.cast.toLowerCase().includes(searchTerm)) ||
                                (film.synopsis && film.synopsis.toLowerCase().includes(searchTerm)) ||
                                (film.tema && film.tema.toLowerCase().includes(searchTerm)) ||
                                (film.tags && film.tags.toLowerCase().includes(searchTerm)) ||
                                (film.dvd && film.dvd.toLowerCase().includes(searchTerm));
                            
                            const matchesGenre = !selectedGenre || film.genre === selectedGenre;
                            
                            const matchesClassification = !selectedClassification || 
                                film.classification === parseInt(selectedClassification) ||
                                (selectedClassification === 'L' && film.classification <= 0);
                           
                            // Filtro de acessibilidade corrigido
                            const matchesAccessibility = !selectedAccessibility || (
                                (selectedAccessibility === 'planos_de_aula' && film.planos_de_aula && film.planos_de_aula.length > 0) ||
                                (selectedAccessibility === 'audiodescricao' && film.audiodescricao) ||
                                (selectedAccessibility === 'closed_caption' && film.closedCaption) ||
                                (selectedAccessibility === 'trailer' && film.trailer && film.trailer.trim() !== '') ||
                                (selectedAccessibility === 'material_outros' && film.materialOutros && film.materialOutros.length > 0) 
                            );
                            
                            return matchesSearch && matchesGenre && matchesClassification && matchesAccessibility;
                        });
                
                        // ATUALIZA CONTADOR E APLICA ORDENAÇÃO
                        updateFilmsCounter();
                        currentFilms = sortFilms(currentFilms, sortOption);
                        
                        // RESETA PAGINAÇÃO E RENDERIZA
                        currentPage = 1;        // Reseta para a primeira página
                        renderPagination();     // Atualiza a paginação
                        renderFilms();         // Renderiza os filmes
                    }, 300);
                }
                
                /* ==========================================
                   5. FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE
                   ========================================== */
                
                // ATUALIZA O CONTADOR DE FILMES
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
                
                // INICIALIZA OS SELECTS DE FILTRO
                function initializeFilters() {
                    // PREENCHE O SELECT DE GÊNEROS
                    const genreSelect = document.getElementById('genreSelect');
                    genreSelect.innerHTML = '<option value="">Todos os Gêneros</option>';
                    allGenres.forEach(genre => {
                        const option = document.createElement('option');
                        option.value = genre;
                        option.textContent = genre;
                        genreSelect.appendChild(option);
                    });
                
                    // PREENCHE O SELECT DE CLASSIFICAÇÃO
                    const classificationSelect = document.getElementById('classificationSelect');
                    classificationSelect.innerHTML = `
                        <option value="">Todas as Classificações</option>
                        <option value="L">Livre</option>
                        <option value="10">10 anos</option>
                        <option value="12">12 anos</option>
                        <option value="14">14 anos</option>
                        <option value="16">16 anos</option>
                        <option value="18">18 anos</option>
                    `;
                }
                
                // CRIA CONTROLES DE NAVEGAÇÃO PARA IMAGENS
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
                }
                
                // RENDERIZA OS FILMES NA GRID
                function renderFilms() {
                    const filmGrid = document.getElementById('filmGrid');
                    filmGrid.innerHTML = '';
                    
                    // CALCULA ÍNDICES PARA PAGINAÇÃO
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = Math.min(startIndex + itemsPerPage, currentFilms.length);
                    
                    // SE NÃO HOUVER RESULTADOS
                    if (currentFilms.length === 0) {
                        filmGrid.innerHTML = `
                            <div class="no-results">
                                <i class="fas fa-search"></i>
                                <p>Nenhum filme encontrado com os filtros selecionados.</p>
                                <p>Tente ajustar seus critérios de busca.</p>
                            </div>
                        `;
                        return;
                    }
                    
                    // RENDERIZA OS FILMES DA PÁGINA ATUAL
                    for (let i = startIndex; i < endIndex; i++) {
                        const film = currentFilms[i];
                        const filmCard = document.createElement('div');
                        filmCard.className = 'film-card';
                        filmCard.setAttribute('data-film-index', i);
                        
                        // CLASSIFICAÇÃO INDICATIVA
                        const classification = film.classification || 0;
                        const classificationClass = getClassificationClass(classification);
                        const classificationText = classification <= 0 ? 'L' : classification;
                        
                        // RECURSOS DISPONÍVEIS
                        const hasAudiodescricao = film.audiodescricao ? '<span class="resource-badge audiodescricao" title="Audiodescrição"><i class="fas fa-assistive-listening-systems"></i></span>' : '';
                        const hasClosedCaption = film.closedCaption ? '<span class="resource-badge closed-caption" title="Closed Caption"><i class="fas fa-closed-captioning"></i></span>' : '';
                        const hasPlanoAula = film.planos_de_aula && film.planos_de_aula.length > 0 ? '<span class="resource-badge plano-aula" title="Plano de Aula"><i class="fas fa-chalkboard-teacher"></i></span>' : '';
                        const hasTrailer = film.trailer ? '<span class="resource-badge trailer" title="Trailer"><i class="fab fa-youtube"></i></span>' : '';
                        const hasMaterialOutros = film.materialOutros && film.materialOutros.length > 0 ? '<span class="resource-badge material-outros" title="Outros Materiais"><i class="fas fa-file-alt"></i></span>' : '';
                        
                        // MONTA O CARD DO FILME
                        filmCard.innerHTML = `
                            <div class="film-poster-container">
                                <img 
                                    src="${getDvdCover(film)}" 
                                    alt="${film.title}" 
                                    class="film-poster"
                                    onerror="this.src='capas/progbrasil.png'"
                                >
                                <div class="film-overlay">
                                    <span class="film-year">${film.year || 'N/A'}</span>
                                    <span class="film-duration">${film.duration ? `${film.duration} min` : 'N/A'}</span>
                                </div>
                            </div>
                            <div class="film-info">
                                <h3 class="film-title">
                                    <span class="classification ${classificationClass}">${classificationText}</span>
                                    ${film.title}
                                </h3>
                                <p class="film-director">${film.director || 'Diretor não informado'}</p>
                                <div class="film-resources">
                                    ${hasAudiodescricao}
                                    ${hasClosedCaption}
                                    ${hasPlanoAula}
                                    ${hasTrailer}
                                    ${hasMaterialOutros}
                                </div>
                            </div>
                        `;
                        
                        // ADICIONA EVENTO DE CLIQUE PARA ABRIR O MODAL
                        filmCard.addEventListener('click', () => {
                            openModal(film);
                        });
                        
                        // ADICIONA O CARD À GRID
                        filmGrid.appendChild(filmCard);
                        
                        // CONFIGURA OS CONTROLES DA IMAGEM DO POSTER
                        const posterContainer = filmCard.querySelector('.film-poster-container');
                        const poster = filmCard.querySelector('.film-poster');
                        if (posterContainer && poster) {
                            createImageControls(posterContainer, poster);
                        }
                    }
                }
                
                // RENDERIZA O CONTEÚDO DO MODAL
                function renderModalContent(film) {
                    // CLASSIFICAÇÃO INDICATIVA
                    const classification = film.classification || 0;
                    const classificationClass = getClassificationClass(classification);
                    const classificationText = classification <= 0 ? 'L' : classification;
                    
                    // TEMAS
                    const themes = [];
                    if (film.tema) {
                        themes.push(...film.tema.split(',').map(t => t.trim()));
                    }
                    if (film.tags) {
                        themes.push(...film.tags.split(',').map(t => t.trim()));
                    }
                    const uniqueThemes = [...new Set(themes.filter(t => t))];
                    const hasThemes = uniqueThemes.length > 0;
                    
                    // RENDERIZA PLANOS DE AULA
                    function renderTeachingPlans(film) {
                        if (!film.planos_de_aula || film.planos_de_aula.length === 0) {
                            return '<p><i class="fas fa-info-circle"></i> Nenhum plano de aula disponível.</p>';
                        }
                        
                        return film.planos_de_aula.map((plano, index) => `
                            <div class="teaching-plan-card">
                                <p><strong><i class="fas fa-graduation-cap"></i> Nível de Ensino:</strong> ${plano.nivel_ensino || ''}</p>
                                <p><strong><i class="fas fa-book"></i> Área de Conhecimento:</strong> ${plano.area_conhecimento || ''}</p>
                                <p><strong><i class="fas fa-globe"></i> Site:</strong> <a href="${plano.url}" target="_blank">${plano.site}</a></p>
                                <p><strong><i class="fas fa-info-circle"></i> Descrição:</strong> ${plano.descricao || ''}</p>
                                <div class="site-preview-toggle">
                                    <button class="btn-toggle-preview" data-target="site-preview-${index}">
                                        <i class="fas fa-eye"></i> Visualizar site
                                    </button>
                                </div>
                                <div class="site-preview" id="site-preview-${index}" style="display: none;">
                                    <iframe src="${plano.url}" frameborder="0" width="100%" height="600px"></iframe>
                                    <button class="btn-toggle-preview-close" data-target="site-preview-${index}">
                                        <i class="fas fa-times"></i> Fechar visualização
                                    </button>
                                </div>
                            </div>
                        `).join('');
                    }
                    
                    // EXTRAI ID DO YOUTUBE
                    function getYoutubeId(url) {
                        if (!url) return null;
                        
                        const patterns = [
                            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
                            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
                            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
                        ];
                        
                        for (const pattern of patterns) {
                            const match = url.match(pattern);
                            if (match && match[1]) {
                                return match[1];
                            }
                        }
                        
                        return null;
                    }
                    
                    // CONSTRÓI O HTML DO MODAL
                    return `
                        <!-- Seção de mídia -->
                        <div class="modal-media-section">
                            <!-- Trailer (se existir) -->
                            ${film.trailer ? `
                            <div class="modal-trailer">
                                <iframe 
                                    src="https://www.youtube.com/embed/${getYoutubeId(film.trailer)}" 
                                    title="YouTube video player" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                            ` : `
                            <!-- Poster (se não houver trailer) -->
                            <div class="modal-poster-container">
                                <img 
                                    src="${getDvdCover(film)}" 
                                    alt="${film.title}" 
                                    class="modal-poster"
                                    onerror="this.src='capas/progbrasil.png'"
                                >
                            </div>
                            `}
                        </div>
                        
                        <!-- Informações do filme -->
                        <div class="modal-info-section">
                            <h2 class="modal-title">
                                <span class="classification ${classificationClass}">${classificationText}</span>
                                ${film.title}
                            </h2>
                            
                            <div class="modal-details">
                                ${film.director ? `<p><strong><i class="fas fa-user"></i> Direção:</strong> ${film.director}</p>` : ''}
                                ${film.cast ? `<p><strong><i class="fas fa-users"></i> Elenco:</strong> ${film.cast}</p>` : ''}
                                ${film.duration ? `<p><strong><i class="fas fa-clock"></i> Duração:</strong> ${film.duration} min</p>` : ''}
                                ${film.genre ? `<p><strong><i class="fas fa-tag"></i> Gênero:</strong> ${film.genre}</p>` : ''}
                                ${film.year ? `<p><strong><i class="fas fa-calendar-alt"></i> Ano:</strong> ${film.year}</p>` : ''}
                                ${film.imdb.votantes ? `<p><strong><i class="fab fa-imdb"></i> IMDb:</strong> ${film.imdb.votantes}</p>` : ''}
                                ${film.country ? `<p><strong><i class="fas fa-globe-americas"></i> País:</strong> ${film.country}</p>` : ''}
                                ${film.state ? `<p><strong><i class="fas fa-map-marker-alt"></i> UF:</strong> ${film.state}</p>` : ''}
                                ${film.city ? `<p><strong><i class="fas fa-city"></i> Cidade:</strong> ${film.city}</p>` : ''}
                            </div>
                            
                            <!-- Botões de compartilhamento -->
                            <div class="social-share-container">
                                <div class="social-share-title">Compartilhar:</div>
                                <div class="social-share-buttons">
                                    <button class="social-share-button whatsapp" title="Compartilhar no WhatsApp" onclick="shareOnWhatsApp('${film.title}')">
                                        <i class="fab fa-whatsapp"></i>
                                    </button>
                                    <button class="social-share-button facebook" title="Compartilhar no Facebook" onclick="shareOnFacebook('${film.title}')">
                                        <i class="fab fa-facebook-f"></i>
                                    </button>
                                    <button class="social-share-button twitter" title="Compartilhar no X (Twitter)" onclick="shareOnTwitter('${film.title}')">
                                        <i class="fab fa-twitter"></i>
                                    </button>
                                    <button class="social-share-button copy" title="Copiar link" onclick="copyToClipboard('${film.title}')">
                                        <i class="fas fa-link"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Link para página detalhada -->
                            <div class="modal-link-container">
                                <a href="filme.html?titulo=${encodeURIComponent(film.title)}" class="modal-link">
                                    <i class="fas fa-external-link-alt"></i> Ver página completa do filme
                                </a>
                            </div>
                        </div>
                        
                        ${film.synopsis ? `
                        <div class="modal-section">
                            <h3><i class="fas fa-align-left"></i> Sinopse</h3>
                            <p>${film.synopsis}</p>
                        </div>
                        ` : ''}
                        
                        ${hasThemes ? `
                        <div class="modal-section">
                            <h3><i class="fas fa-tags"></i> Temas</h3>
                            ${uniqueThemes.map(theme => `<span class="theme-tag">${theme}</span>`).join('')}
                        </div>
                        ` : ''}
                        
                        ${film.trailer ? `
                        <div class="modal-section">
                            <h3><i class="fab fa-youtube"></i> Trailer</h3>
                            <div class="modal-trailer">
                                <iframe 
                                    src="https://www.youtube.com/embed/${getYoutubeId(film.trailer)}" 
                                    title="YouTube video player" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${film.planos_de_aula && film.planos_de_aula.length > 0 ? `
                        <div class="modal-section">
                            <h3><i class="fas fa-chalkboard-teacher"></i> Planos de Aula</h3>
                            ${renderTeachingPlans(film)}
                        </div>
                        ` : ''}
                    `;
                }

                // EXTRAI ID DO YOUTUBE DE UMA URL
                function getYoutubeId(url) {
                    if (!url) return null;
                    
                    // Padrões de URL do YouTube
                    const patterns = [
                        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
                        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
                        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
                    ];
                    
                    for (const pattern of patterns) {
                        const match = url.match(pattern);
                        if (match && match[1]) {
                            return match[1];
                        }
                    }
                    
                    return null;
                }

                // ABRE O MODAL COM DETALHES DO FILME
                function openModal(film) {
                    const modal = document.getElementById('filmModal');
                    const modalContent = document.getElementById('modalContent');
                    const closeBtn = document.querySelector('.modal .close');
                    
                    if (!modal || !modalContent || !closeBtn) {
                        console.error("Elementos do modal não encontrados");
                        return;
                    }
                    
                    // Renderiza o conteúdo do modal
                    modalContent.innerHTML = renderModalContent(film);
                    
                    // Exibe o modal
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    // Configura o evento de fechar no botão X
                    closeBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        closeModal();
                    };
                    
                    // Configura o evento de fechar ao clicar fora do modal
                    window.onclick = function(event) {
                        if (event.target === modal) {
                            closeModal();
                        }
                    };
                    
                    // Configura os controles da imagem do poster
                    setTimeout(() => {
                        const posterContainer = document.querySelector('.modal-poster-container');
                        const poster = document.querySelector('.modal-poster');
                        if (posterContainer && poster) {
                            createImageControls(posterContainer, poster);
                        }
                        
                        // Configura eventos para expandir/recolher planos de aula
                        document.querySelectorAll('.btn-toggle-preview').forEach(button => {
                            button.addEventListener('click', function() {
                                const targetId = this.getAttribute('data-target');
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {
                                    targetElement.style.display = 'block';
                                }
                            });
                        });
                        
                        document.querySelectorAll('.btn-toggle-preview-close').forEach(button => {
                            button.addEventListener('click', function() {
                                const targetId = this.getAttribute('data-target');
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {
                                    targetElement.style.display = 'none';
                                }
                            });
                        });
                    }, 100);
                }

                // FECHA O MODAL
                function closeModal() {
                    const modal = document.getElementById('filmModal');
                    if (modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                        window.onclick = null;
                    }
                }

                // RENDERIZA A PAGINAÇÃO
                function renderPagination() {
                    const paginationContainer = document.getElementById('pagination');
                    paginationContainer.innerHTML = '';
                    
                    const totalPages = Math.ceil(currentFilms.length / itemsPerPage);
                    
                    if (totalPages <= 1) {
                        return;
                    }
                    
                    // BOTÃO ANTERIOR
                    const prevButton = document.createElement('button');
                    prevButton.className = 'pagination-button';
                    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
                    prevButton.disabled = currentPage === 1;
                    prevButton.addEventListener('click', () => {
                        if (currentPage > 1) {
                            currentPage--;
                            renderFilms();
                            renderPagination();
                            window.scrollTo(0, 0);
                        }
                    });
                    paginationContainer.appendChild(prevButton);
                    
                    // PÁGINAS
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    // PRIMEIRA PÁGINA
                    if (startPage > 1) {
                        const firstPageButton = document.createElement('button');
                        firstPageButton.className = 'pagination-button';
                        firstPageButton.textContent = '1';
                        firstPageButton.addEventListener('click', () => {
                            currentPage = 1;
                            renderFilms();
                            renderPagination();
                            window.scrollTo(0, 0);
                        });
                        paginationContainer.appendChild(firstPageButton);
                        
                        if (startPage > 2) {
                            const ellipsis = document.createElement('span');
                            ellipsis.className = 'pagination-ellipsis';
                            ellipsis.textContent = '...';
                            paginationContainer.appendChild(ellipsis);
                        }
                    }
                    
                    // PÁGINAS NUMERADAS
                    for (let i = startPage; i <= endPage; i++) {
                        const pageButton = document.createElement('button');
                        pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
                        pageButton.textContent = i;
                        pageButton.addEventListener('click', () => {
                            currentPage = i;
                            renderFilms();
                            renderPagination();
                            window.scrollTo(0, 0);
                        });
                        paginationContainer.appendChild(pageButton);
                    }
                    
                    // ÚLTIMA PÁGINA
                    if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                            const ellipsis = document.createElement('span');
                            ellipsis.className = 'pagination-ellipsis';
                            ellipsis.textContent = '...';
                            paginationContainer.appendChild(ellipsis);
                        }
                        
                        const lastPageButton = document.createElement('button');
                        lastPageButton.className = 'pagination-button';
                        lastPageButton.textContent = totalPages;
                        lastPageButton.addEventListener('click', () => {
                            currentPage = totalPages;
                            renderFilms();
                            renderPagination();
                            window.scrollTo(0, 0);
                        });
                        paginationContainer.appendChild(lastPageButton);
                    }
                    
                    // BOTÃO PRÓXIMO
                    const nextButton = document.createElement('button');
                    nextButton.className = 'pagination-button';
                    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    nextButton.disabled = currentPage === totalPages;
                    nextButton.addEventListener('click', () => {
                        if (currentPage < totalPages) {
                            currentPage++;
                            renderFilms();
                            renderPagination();
                            window.scrollTo(0, 0);
                        }
                    });
                    paginationContainer.appendChild(nextButton);
                }

                /* ==========================================
                   6. FUNÇÕES DE COMPARTILHAMENTO
                   ========================================== */

                // COMPARTILHAR NO WHATSAPP
                function shareOnWhatsApp(filmTitle) {
                    // Prepara a URL e texto para compartilhamento
                    const shareUrl = filmTitle 
                        ? `${window.location.origin}${window.location.pathname}filme.html?titulo=${encodeURIComponent(filmTitle)}`
                        : window.location.href;
                    
                    const shareText = filmTitle 
                        ? `Confira o filme "${filmTitle}" no catálogo de DVDs do Projeto Um Trem de Cinema IFMG Sabará`
                        : 'Confira o catálogo de DVDs do Projeto Um Trem de Cinema IFMG Sabará';
                    
                    // Verifica se é dispositivo móvel
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    
                    // Formata o texto e URL para compartilhamento
                    const formattedText = encodeURIComponent(shareText + ' ' + shareUrl);
                    
                    // Usa API diferente dependendo se é mobile ou desktop
                    const whatsappUrl = isMobile 
                        ? `whatsapp://send?text=${formattedText}`
                        : `https://web.whatsapp.com/send?text=${formattedText}`;
                    
                    // Abre em nova janela
                    window.open(whatsappUrl, '_blank');
                }

                // COMPARTILHAR NO FACEBOOK
                function shareOnFacebook(filmTitle) {
                    // Prepara a URL para compartilhamento
                    const shareUrl = filmTitle 
                        ? `${window.location.origin}${window.location.pathname}filme.html?titulo=${encodeURIComponent(filmTitle)}`
                        : window.location.href;
                    
                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                    window.open(facebookUrl, '_blank');
                }

                // COMPARTILHAR NO TWITTER
                function shareOnTwitter(filmTitle) {
                    // Prepara a URL e texto para compartilhamento
                    const shareUrl = filmTitle 
                        ? `${window.location.origin}${window.location.pathname}filme.html?titulo=${encodeURIComponent(filmTitle)}`
                        : window.location.href;
                    
                    const shareText = filmTitle 
                        ? `Confira o filme "${filmTitle}" no catálogo de DVDs do Projeto Um Trem de Cinema IFMG Sabará`
                        : 'Confira o catálogo de DVDs do Projeto Um Trem de Cinema IFMG Sabará';
                    
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                    window.open(twitterUrl, '_blank');
                }

                // COPIAR LINK PARA ÁREA DE TRANSFERÊNCIA
                function copyToClipboard(filmTitle) {
                    // Prepara a URL para compartilhamento
                    const shareUrl = filmTitle 
                        ? `${window.location.origin}${window.location.pathname}filme.html?titulo=${encodeURIComponent(filmTitle)}`
                        : window.location.href;
                    
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        // Mostra mensagem de sucesso
                        const copySuccess = document.createElement('div');
                        copySuccess.className = 'copy-success';
                        copySuccess.textContent = 'Link copiado para a área de transferência!';
                        document.body.appendChild(copySuccess);
                        
                        // Exibe a mensagem
                        setTimeout(() => {
                            copySuccess.classList.add('show');
                        }, 10);
                        
                        // Remove a mensagem após 3 segundos
                        setTimeout(() => {
                            copySuccess.classList.remove('show');
                            setTimeout(() => {
                                document.body.removeChild(copySuccess);
                            }, 300);
                        }, 3000);
                    }).catch(err => {
                        console.error('Erro ao copiar texto: ', err);
                    });
                }

                /* ==========================================
                   7. INICIALIZAÇÃO DA APLICAÇÃO
                   ========================================== */

                // CARREGA OS DADOS DO CATÁLOGO
                async function loadCatalogData() {
                    try {
                        // EXIBE MENSAGEM DE CARREGAMENTO
                        document.getElementById('loadingMessage').style.display = 'flex';
                        document.getElementById('filmGrid').style.display = 'none';
                        
                        // CARREGA O CATÁLOGO
                        const response = await fetch('catalogo.json');
                        if (!response.ok) {
                            throw new Error('Erro ao carregar o catálogo');
                        }
                        
                        const data = await response.json();
                        console.log(`Catálogo carregado com ${data.length} filmes`);
                        
                        // TRANSFORMA OS DADOS
                        allFilms = data.map(film => transformFilmData(film));
                        currentFilms = [...allFilms];
                        
                        // EXTRAI TODOS OS GÊNEROS ÚNICOS
                        const genres = new Set();
                        allFilms.forEach(film => {
                            if (film.genre) {
                                genres.add(film.genre);
                            }
                        });
                        allGenres = [...genres].sort();
                        
                        // INICIALIZA OS FILTROS
                        initializeFilters();
                        
                        // RENDERIZA OS FILMES E PAGINAÇÃO
                        renderFilms();
                        renderPagination();
                        updateFilmsCounter();
                        
                        // OCULTA MENSAGEM DE CARREGAMENTO
                        document.getElementById('loadingMessage').style.display = 'none';
                        document.getElementById('filmGrid').style.display = 'grid';
                        
                    } catch (error) {
                        console.error('Erro:', error);
                        document.getElementById('loadingMessage').innerHTML = `
                            <div class="error-message">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>Erro ao carregar o catálogo</p>
                                <p>${error.message}</p>
                            </div>
                        `;
                    }
                }

                // INICIALIZA A APLICAÇÃO QUANDO O DOM ESTIVER PRONTO
                document.addEventListener('DOMContentLoaded', function() {
                    console.log("DOM carregado, iniciando aplicação...");
                    
                    // CARREGA OS DADOS DO CATÁLOGO
                    loadCatalogData();
                    
                    // CONFIGURA EVENTOS DE FILTRO
                    document.getElementById('searchInput').addEventListener('input', filterAndRenderFilms);
                    document.getElementById('genreSelect').addEventListener('change', filterAndRenderFilms);
                    document.getElementById('classificationSelect').addEventListener('change', filterAndRenderFilms);
                    document.getElementById('accessibilitySelect').addEventListener('change', filterAndRenderFilms);
                    document.getElementById('sortSelect').addEventListener('change', filterAndRenderFilms);
                    
                    // CONFIGURA MODAL DE FALE CONOSCO
                    const modalFaleConosco = document.getElementById("modalFaleConosco");
                    const btnFaleConosco = document.getElementById("btnFaleConosco");
                    
                    if (modalFaleConosco && btnFaleConosco) {
                        const spanCloseFeedback = modalFaleConosco.querySelector(".close");
                        
                        btnFaleConosco.addEventListener("click", function() {
                            modalFaleConosco.style.display = "block";
                            setTimeout(() => {
                                modalFaleConosco.classList.add('show');
                            }, 10);
                        });
                        
                        if (spanCloseFeedback) {
                            spanCloseFeedback.addEventListener("click", function() {
                                modalFaleConosco.classList.remove('show');
                                setTimeout(() => {
                                    modalFaleConosco.style.display = "none";
                                }, 300);
                            });
                        }
                        
                        window.addEventListener("click", function(event) {
                            if (event.target == modalFaleConosco) {
                                modalFaleConosco.classList.remove('show');
                                setTimeout(() => {
                                    modalFaleConosco.style.display = "none";
                                }, 300);
                            }
                        });
                    }
                });
