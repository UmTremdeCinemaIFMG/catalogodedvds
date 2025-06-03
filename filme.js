// ===========================
// SCRIPT PARA PÁGINA DE FILME
// ===========================

// VARIÁVEIS GLOBAIS
let currentSlide = 0;
let slides = [];
let mediaItems = [];

// FUNÇÃO PARA OBTER PARÂMETROS DA URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// FUNÇÃO PARA NORMALIZAR STRINGS (remover acentos, converter para minúsculas, trim)
function normalizeString(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .normalize("NFD") // Decompor acentos
        .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos (acentos)
        .trim();
}

// FUNÇÃO PARA CARREGAR DADOS DO FILME
async function loadFilmData() {
    try {
        // EXIBE MENSAGEM DE CARREGAMENTO
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
        
        // OBTÉM O TÍTULO DO FILME DA URL
        const filmTitle = getUrlParameter('titulo');
        if (!filmTitle) {
            throw new Error('Título do filme não especificado na URL');
        }
        
        const decodedFilmTitle = decodeURIComponent(filmTitle);
        console.log("Buscando filme com título (original):", decodedFilmTitle);
        
        // CARREGA O CATÁLOGO
        const response = await fetch('catalogo.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar o catálogo');
        }
        
        const data = await response.json();
        console.log("Catálogo carregado, total de filmes:", data.length);
        
        // BUSCA O FILME PELO TÍTULO - MELHORADA PARA NORMALIZAR STRINGS
        const normalizedSearchTitle = normalizeString(decodedFilmTitle); // Normaliza título da URL
        console.log("Título normalizado para busca:", normalizedSearchTitle);
        
        const film = data.find(item => {
            if (!item["Título do filme"]) return false;
            const normalizedItemTitle = normalizeString(item["Título do filme"]); // Normaliza título do JSON
            // console.log(`Comparando: '${normalizedItemTitle}' === '${normalizedSearchTitle}'`); // Debug comparison
            return normalizedItemTitle === normalizedSearchTitle;
        });
        
        if (!film) {
            console.error("Filme não encontrado após normalização. Títulos disponíveis (amostra):", 
                data.slice(0, 20).map(f => ({ original: f["Título do filme"], normalized: normalizeString(f["Título do filme"]) })));
            // Usa o título original decodificado na mensagem de erro para clareza
            throw new Error(`Filme "${decodedFilmTitle}" não encontrado no catálogo após normalização.`); 
        }
        
        console.log("Filme encontrado:", film["Título do filme"]);
        
        // TRANSFORMA OS DADOS DO FILME (usando a função de script.js)
        const transformedFilm = transformFilmData(film);
        console.log("Dados transformados:", transformedFilm);
        
        // RENDERIZA OS DADOS DO FILME
        renderFilmData(transformedFilm);
        
        // OCULTA MENSAGEM DE CARREGAMENTO
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // CONFIGURA EVENTOS PARA EXPANDIR/RECOLHER PLANOS DE AULA
        setupExpandableContent();
        
        // INICIALIZA O CARROSSEL
        initializeCarousel(transformedFilm);
        
        // CONFIGURA COMPARTILHAMENTO
        setupSharingButtons(transformedFilm);
        
    } catch (error) {
        console.error('Erro:', error);
        const filmContainer = document.getElementById('filmeContainer');
        if (filmContainer) {
            filmContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar dados do filme</p>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn-voltar">
                        <i class="fas fa-arrow-left"></i> Voltar para o catálogo
                    </a>
                </div>
            `;
        }
        // Garante que o loading seja escondido em caso de erro
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// FUNÇÃO PARA RENDERIZAR DADOS DO FILME
function renderFilmData(film) {
    const filmContainer = document.getElementById('filmeContainer');
    if (!filmContainer) {
        console.error("Container do filme não encontrado");
        return;
    }
    
    // CLASSIFICAÇÃO INDICATIVA (usa função de script.js)
    const classification = film.classification || 0;
    const classificationClass = getClassificationClass(classification);
    const classificationText = classification <= 0 ? 'L' : classification;
    
    // TEMAS (usa função de script.js)
    const themes = createThemesList(film);
    const hasThemes = themes.length > 0;
    
    // INFORMAÇÕES ADICIONAIS
    const hasAdditionalInfo = film.audiodescricao || film.closedCaption || film.website || 
                            film.assistirOnline || film.festivais || film.premios || 
                            film.legendasOutras || (film.materialOutros && film.materialOutros.length > 0);
    
    // HEADER DO FILME
    const filmHeader = document.createElement('div');
    filmHeader.className = 'filme-header';
    filmHeader.innerHTML = `
        <div class="filme-info">
            <h1 class="filme-title">
                <span class="classification ${classificationClass}">${classificationText}</span>
                ${film.title}
            </h1>
            <div class="filme-details">
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
                    <button class="social-share-button whatsapp" title="Compartilhar no WhatsApp" onclick="shareOnWhatsApp()">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="social-share-button facebook" title="Compartilhar no Facebook" onclick="shareOnFacebook()">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="social-share-button twitter" title="Compartilhar no X (Twitter)" onclick="shareOnTwitter()">
                        <i class="fab fa-twitter"></i>
                    </button>
                    <button class="social-share-button copy" title="Copiar link" onclick="copyToClipboard()">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Inicializa o conteúdo do filme
    let filmContent = '';
    
    // SINOPSE
    if (film.synopsis) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-align-left"></i> Sinopse</h3>
            <p>${film.synopsis}</p>
        </div>
        `;
    }
    
    // ODS
    if (film.ods && film.ods.length > 0) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-globe-americas"></i> Objetivos de Desenvolvimento Sustentável</h3>
            <div class="ods-container">
                ${film.ods.map(ods => {
                    const odsNumber = ods.match(/\d+/); // Extrai o número do ODS
                    if (odsNumber) {
                        return `
                            <a href="https://brasil.un.org/pt-br/sdgs/${odsNumber[0]}" 
                               target="_blank" 
                               class="ods-icon" 
                               title="ODS ${ods}">
                                <img src="https://brasil.un.org/sites/default/files/styles/large/public/2020-09/E-WEB-Goal-${odsNumber[0]}.png" 
                                     alt="Ícone do ODS ${ods}" 
                                     loading="lazy">
                            </a>
                        `;
                    }
                    return '';
                }).join('')}
            </div>
        </div>
        `;
    }
    
    // TEMAS
    if (hasThemes) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-tags"></i> Temas</h3>
            ${themes.map(theme => `<span class="theme-tag">${theme}</span>`).join('')}
        </div>
        `;
    }
    
    // PLANOS DE AULA (usa função de script.js)
    if (film.planos_de_aula && film.planos_de_aula.length > 0) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-chalkboard-teacher"></i> Planos de Aula <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                ${renderTeachingPlans(film)} 
            </div>
        </div>
        `;
    }
    
    // FESTIVAIS
    if (film.festivais) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-ticket-alt"></i> Festivais</h3>
            <p>${film.festivais.replace(/\n/g, '<br>')}</p>
        </div>
        `;
    }
    
    // PRÊMIOS
    if (film.premios) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-award"></i> Prêmios</h3>
            <p>${film.premios.replace(/\n/g, '<br>')}</p>
        </div>
        `;
    }
    
    // OUTROS MATERIAIS (usa função de script.js)
    if (film.materialOutros && film.materialOutros.length > 0) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-file-alt"></i> Outros Materiais <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                 ${renderOtherMaterials(film)}
            </div>
        </div>
        `;
    }
    
    // INFORMAÇÕES ADICIONAIS
    if (hasAdditionalInfo) {
        let additionalContent = '';
        
        if (film.audiodescricao) {
            additionalContent += `<p><strong><i class="fas fa-assistive-listening-systems"></i> Audiodescrição:</strong> ${film.audiodescricao}</p>`;
        }
        
        if (film.closedCaption) {
            additionalContent += `<p><strong><i class="fas fa-closed-captioning"></i> Closed Caption:</strong> ${film.closedCaption}</p>`;
        }
        
        if (film.legendasOutras) {
            additionalContent += `<p><strong><i class="fas fa-language"></i> Outras Legendas:</strong> ${film.legendasOutras}</p>`;
        }
        
        if (film.website) {
            // Garante que a URL tenha protocolo
            const websiteUrl = film.website.startsWith('http') ? film.website : `https://${film.website}`;
            additionalContent += `<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${websiteUrl}" target="_blank">${film.website}</a></p>`;
        }
        
        if (additionalContent) {
            filmContent += `
            <div class="filme-section">
                <h3><i class="fas fa-info-circle"></i> Informações Adicionais</h3>
                ${additionalContent}
            </div>
            `;
        }
    }
    
    // ADICIONA O CONTEÚDO AO CONTAINER
    filmContainer.innerHTML = `
        <!-- Banner com carrossel -->
        <div class="banner-carrossel">
            <div class="banner-slides" id="bannerSlides"></div>
            <div class="banner-controls">
                <button class="banner-control" id="prevSlide">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="banner-control" id="nextSlide">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="banner-indicators" id="bannerIndicators"></div>
        </div>
        
        ${filmHeader.outerHTML}
        ${filmContent}
    `;

    // ADICIONA O BOTÃO "ASSISTIR ONLINE" SE EXISTIR O LINK
    const controlsContainer = document.querySelector('.filme-page-controls');
    if (controlsContainer && film.assistirOnline && film.assistirOnline.trim() !== '') {
        // Garante que a URL tenha protocolo
        const onlineUrl = film.assistirOnline.startsWith('http') ? film.assistirOnline : `https://${film.assistirOnline}`;
        const assistirOnlineBtn = document.createElement('a');
        assistirOnlineBtn.href = onlineUrl;
        assistirOnlineBtn.target = '_blank';
        assistirOnlineBtn.className = 'btn-assistir-online';
        assistirOnlineBtn.innerHTML = 'Assistir Online <i class="fas fa-external-link-alt"></i>'; // Ícone atualizado
        // Insere o botão após o botão de voltar
        const voltarBtn = controlsContainer.querySelector('.btn-voltar');
        if (voltarBtn) {
            voltarBtn.insertAdjacentElement('afterend', assistirOnlineBtn);
        } else {
            controlsContainer.appendChild(assistirOnlineBtn);
        }
    }
} 

// FUNÇÃO PARA INICIALIZAR O CARROSSEL
function initializeCarousel(film) {
    const slidesContainer = document.getElementById('bannerSlides');
    const indicatorsContainer = document.getElementById('bannerIndicators');
    
    if (!slidesContainer || !indicatorsContainer) {
        console.warn("Elementos do carrossel não encontrados.");
        return;
    }

    mediaItems = [];

    // 1. Adiciona a capa principal
    const mainCover = getDvdCover(film); // Usa a função de script.js
    mediaItems.push({ type: 'image', src: mainCover, alt: `Capa principal de ${film.title}` });

    // 2. Adiciona o trailer, se existir
    if (film.trailer && film.trailer.trim() !== '') {
        mediaItems.push({ type: 'video', src: film.trailer, alt: `Trailer de ${film.title}` });
    }

    // 3. Adiciona imagens adicionais, se existirem
    if (film.imagens_adicionais && film.imagens_adicionais.length > 0) {
        film.imagens_adicionais.forEach((imgUrl, index) => {
            if (imgUrl && imgUrl.trim() !== '') {
                mediaItems.push({ type: 'image', src: imgUrl, alt: `Imagem adicional ${index + 1} de ${film.title}` });
            }
        });
    }

    // Limpa containers
    slidesContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    currentSlide = 0;

    // Cria slides e indicadores
    mediaItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'banner-slide';
        if (index === 0) slide.classList.add('active');

        if (item.type === 'image') {
            slide.innerHTML = `<img src="${item.src}" alt="${item.alt}" onerror="this.onerror=null; this.src='capas/progbrasil.png'; this.alt='Imagem indisponível';">`;
        } else if (item.type === 'video') {
            // Tenta extrair ID do YouTube
            let videoEmbedHtml = `<p>Trailer indisponível ou formato não suportado.</p>`;
            const youtubeMatch = item.src.match(/(?:https:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
            if (youtubeMatch && youtubeMatch[1]) {
                const videoId = youtubeMatch[1];
                videoEmbedHtml = `
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>`;
            } else {
                 console.warn("URL do trailer não é um link do YouTube válido:", item.src);
                 // Poderia adicionar suporte a outros players aqui ou um link direto
                 videoEmbedHtml = `<p>Trailer: <a href="${item.src}" target="_blank">Assistir</a> (formato não incorporável)</p>`;
            }
             slide.innerHTML = videoEmbedHtml;
        }
        slidesContainer.appendChild(slide);

        // Cria indicador
        const indicator = document.createElement('button');
        indicator.className = 'banner-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    slides = slidesContainer.querySelectorAll('.banner-slide');

    // Esconde controles se houver apenas 1 item
    const controls = document.querySelector('.banner-controls');
    if (mediaItems.length <= 1) {
        if(controls) controls.style.display = 'none';
        indicatorsContainer.style.display = 'none';
    } else {
        if(controls) controls.style.display = 'flex';
        indicatorsContainer.style.display = 'flex';
        // Adiciona listeners aos botões de controle
        const prevButton = document.getElementById('prevSlide');
        const nextButton = document.getElementById('nextSlide');
        if(prevButton) prevButton.addEventListener('click', prevSlide);
        if(nextButton) nextButton.addEventListener('click', nextSlide);
    }
}

// FUNÇÕES DO CARROSSEL
function updateCarousel() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlide) {
            slide.classList.add('active');
        }
    });

    const indicators = document.querySelectorAll('.banner-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index === currentSlide) {
            indicator.classList.add('active');
        }
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % mediaItems.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + mediaItems.length) % mediaItems.length;
    updateCarousel();
}

// FUNÇÃO PARA CONFIGURAR CONTEÚDO EXPANSÍVEL
function setupExpandableContent() {
    document.querySelectorAll('.expandable-section').forEach(section => {
        const title = section.querySelector('.expandable-title');
        const content = section.querySelector('.expandable-content');
        const icon = title.querySelector('.expand-icon');

        if (title && content && icon) {
            title.addEventListener('click', () => {
                const isExpanded = section.classList.toggle('expanded');
                icon.classList.toggle('fa-chevron-down', !isExpanded);
                icon.classList.toggle('fa-chevron-up', isExpanded);
                content.style.maxHeight = isExpanded ? content.scrollHeight + "px" : null;
            });
            // Inicia recolhido
            content.style.maxHeight = null;
            section.classList.remove('expanded');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    });
}

// FUNÇÕES DE COMPARTILHAMENTO SOCIAL
function setupSharingButtons(film) {
    // As funções de compartilhamento usam a URL atual e o título do filme
    // Elas são definidas globalmente para serem acessíveis pelo onclick
    window.shareOnWhatsApp = () => {
        const text = encodeURIComponent(`Confira o filme: ${film.title} - ${window.location.href}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    window.shareOnFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    window.shareOnTwitter = () => {
        const text = encodeURIComponent(`Confira o filme: ${film.title}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    window.copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar link: ', err);
            alert('Erro ao copiar o link.');
        });
    };
}

// INICIALIZAÇÃO QUANDO O DOM ESTIVER PRONTO
document.addEventListener('DOMContentLoaded', loadFilmData);

