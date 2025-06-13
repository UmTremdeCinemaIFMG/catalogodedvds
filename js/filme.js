// ===========================
// SCRIPT PARA PÁGINA DE FILME
// ===========================

// VARIÁVEIS GLOBAIS
let currentSlide = 0;
let slides = [];
let mediaItems = [];
let odsDescriptions = {}; // Variável para armazenar as descrições dos ODS

// FUNÇÃO PARA OBTER PARÂMETROS DA URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// FUNÇÃO PARA NORMALIZAR STRINGS (remover acentos, converter para minúsculas, trim)
function normalizeString(str) {
    if (!str) return ".";
    return String(str)
        .toLowerCase()
        .normalize("NFD") // Decompor acentos
        .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos (acentos)
        .trim();
}

// FUNÇÃO PARA CARREGAR DESCRIÇÕES DOS ODS
async function loadOdsDescriptions() {
    try {
        const response = await fetch("ods_descriptions.json");
        if (!response.ok) {
            throw new Error("Erro ao carregar descrições dos ODS");
        }
        odsDescriptions = await response.json();
        console.log("Descrições dos ODS carregadas.");
    } catch (error) {
        console.error("Erro ao carregar ods_descriptions.json:", error);
        // Pode definir um objeto vazio ou padrão em caso de erro
        odsDescriptions = {}; 
    }
}

// FUNÇÃO PARA CARREGAR DADOS DO FILME
async function loadFilmData() {
    try {
        // EXIBE MENSAGEM DE CARREGAMENTO
        const loadingElement = document.querySelector(".loading");
        if (loadingElement) {
            loadingElement.style.display = "flex";
        }

        // CARREGA AS DESCRIÇÕES DOS ODS PRIMEIRO
        await loadOdsDescriptions();
        
        // OBTÉM O TÍTULO DO FILME DA URL
        const filmTitle = getUrlParameter("titulo");
        if (!filmTitle) {
            throw new Error("Título do filme não especificado na URL");
        }
        
        const decodedFilmTitle = decodeURIComponent(filmTitle);
        console.log("Buscando filme com título (original):", decodedFilmTitle);
        
        // CARREGA O CATÁLOGO
        const response = await fetch("catalogo.json");
        if (!response.ok) {
            throw new Error("Erro ao carregar o catálogo");
        }
        
        const data = await response.json();
        console.log("Catálogo carregado, total de filmes:", data.length);
        
        // BUSCA O FILME PELO TÍTULO - MELHORADA PARA NORMALIZAR STRINGS
        const normalizedSearchTitle = normalizeString(decodedFilmTitle); // Normaliza título da URL
        console.log("Título normalizado para busca:", normalizedSearchTitle);
        
        const film = data.find(item => {
            if (!item["Título do filme"]) return false;
            const normalizedItemTitle = normalizeString(item["Título do filme"]); // Normaliza título do JSON
            // console.log(`Comparando: "${normalizedItemTitle}" === "${normalizedSearchTitle}"`); // Debug comparison
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
            loadingElement.style.display = "none";
        }
        
        // CONFIGURA EVENTOS PARA EXPANDIR/RECOLHER PLANOS DE AULA
        setupExpandableContent();
        
        // INICIALIZA O CARROSSEL
        initializeCarousel(transformedFilm);

        // CONFIGURA O COMPARTILHAMENTO
        setupSharingButtons(transformedFilm);
        
    } catch (error) {
        console.error("Erro:", error);
        const filmContainer = document.getElementById("filmeContainer");
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
        const loadingElement = document.querySelector(".loading");
        if (loadingElement) {
            loadingElement.style.display = "none";
        }
    }
}

// FUNÇÃO PARA RENDERIZAR DADOS DO FILME
function renderFilmData(film) {
    const filmContainer = document.getElementById("filmeContainer");
    if (!filmContainer) {
        console.error("Container do filme não encontrado");
        return;
    }
    
    // CLASSIFICAÇÃO INDICATIVA (usa função de script.js)
    const classification = film.classification || 0;
    const classificationClass = getClassificationClass(classification);
    const classificationText = classification <= 0 ? "L" : classification;
    
    // TEMAS (usa função de script.js)
    const themes = createThemesList(film);
    const hasThemes = themes.length > 0;
    
    // HEADER DO FILME (Sem botões de compartilhar aqui)
    const filmHeader = document.createElement("div");
    filmHeader.className = "filme-header";
    filmHeader.innerHTML = `
        <div class="filme-info">
            <h1 class="filme-title">
                <span class="classification ${classificationClass}">${classificationText}</span>
                ${film.title}
            </h1>
            <div class="filme-details">
                ${film.director ? `<p><strong><i class="fas fa-user"></i> Direção:</strong> ${film.director}</p>` : ""}
                ${film.cast ? `<p><strong><i class="fas fa-users"></i> Elenco:</strong> ${film.cast}</p>` : ""}
                ${film.duration ? `<p><strong><i class="fas fa-clock"></i> Duração:</strong> ${film.duration} min</p>` : ""}
                ${film.genre ? `<p><strong><i class="fas fa-tag"></i> Gênero:</strong> ${film.genre}</p>` : ""}
                ${film.year ? `<p><strong><i class="fas fa-calendar-alt"></i> Ano:</strong> ${film.year}</p>` : ""}
                ${film.imdb.votantes ? `<p><strong><i class="fab fa-imdb"></i> IMDb:</strong> ${film.imdb.votantes}</p>` : ""}
                ${film.country ? `<p><strong><i class="fas fa-globe-americas"></i> País:</strong> ${film.country}</p>` : ""}
                ${film.state ? `<p><strong><i class="fas fa-map-marker-alt"></i> UF:</strong> ${film.state}</p>` : ""}
                ${film.city ? `<p><strong><i class="fas fa-city"></i> Cidade:</strong> ${film.city}</p>` : ""}
                ${film.classification ? `<p><strong><i class="fas fa-info-circle"></i> Classificação Indicativa:</strong> ${film.classification}</p>` : ""}
                ${film.classificationDescription && film.classificationDescription.length > 0 ? 
                    film.classificationDescription.map(desc => 
                        `<p><strong><i class="fas fa-info-circle"></i> Descrição:</strong> <a href="${desc.url || '#'}" target="_blank" rel="noopener noreferrer">${desc.Descrição || 'N/A'}</a></p>`
                    ).join('') 
                    : ''
                }
            </div>
        </div>
    `;
    
    // Inicializa o conteúdo do filme
    let filmContent = "";

    // 1. TEMAS
    if (hasThemes) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-tags"></i> Temas</h3>
            ${themes.map(theme => `<span class="theme-tag">${theme}</span>`).join("")}
        </div>
        `;
    }

    // 2. ODS
    if (film.ods && film.ods.length > 0) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-globe-americas"></i> Objetivos de Desenvolvimento Sustentável</h3>
            <div class="ods-container">
                ${film.ods.map(ods => {
                    const odsNumberMatch = ods.match(/\d+/);
                    if (odsNumberMatch) {
                        const odsNumber = odsNumberMatch[0];
                        const description = odsDescriptions[odsNumber] || `Descrição para ODS ${odsNumber} não encontrada.`;
                        const link = `https://brasil.un.org/pt-br/sdgs/${odsNumber}`;
                        return `
                            <div class="ods-flip-container">
                                <a href="${link}" target="_blank" rel="noopener noreferrer" class="ods-flipper-link" title="ODS ${ods} - Clique para saber mais">
                                    <div class="ods-flipper">
                                        <div class="ods-front">
                                            <img src="ods_icons/ods_${odsNumber}.svg" alt="Ícone do ODS ${ods}" loading="lazy">
                                        </div>
                                        <div class="ods-back" data-ods-number="${odsNumber}">
                                            <p>${description}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                    }
                    return "";
                }).join("")}
            </div>
        </div>
        `;
    }
    
    // 3. SINOPSE (Expansível)
    if (film.synopsis) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-align-left"></i> Sinopse <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                <p>${film.synopsis}</p>
            </div>
        </div>
        `;
    }
    
    // 4. PLANOS DE AULA (Expansível)
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
    
    // 5. OUTROS MATERIAIS (Expansível)
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

    // 6. INFORMAÇÕES ADICIONAIS (Expansível e Agrupada)
    let additionalInfoContent = "";
    let hasAnyAdditionalInfo = false;

    // FESTIVAIS (dentro de Informações Adicionais)
    if (film.festivais) {
        additionalInfoContent += `
        <div class="filme-subsection">
            <h4><i class="fas fa-ticket-alt"></i> Festivais</h4>
            <p>${film.festivais.replace(/\n/g, "<br>")}</p>
        </div>
        `;
        hasAnyAdditionalInfo = true;
    }
    
    // PRÊMIOS (dentro de Informações Adicionais)
    if (film.premios) {
        additionalInfoContent += `
        <div class="filme-subsection">
            <h4><i class="fas fa-award"></i> Prêmios</h4>
            <p>${film.premios.replace(/\n/g, "<br>")}</p>
        </div>
        `;
        hasAnyAdditionalInfo = true;
    }

    // OUTROS DETALHES (Audiodescrição, CC, Legendas, Website)
    let otherDetailsContent = "";
    if (film.audiodescricao) {
        otherDetailsContent += `<p><strong><i class="fas fa-assistive-listening-systems"></i> Audiodescrição:</strong> ${film.audiodescricao}</p>`;
        hasAnyAdditionalInfo = true;
    }
    if (film.closedCaption) {
        otherDetailsContent += `<p><strong><i class="fas fa-closed-captioning"></i> Closed Caption:</strong> ${film.closedCaption}</p>`;
        hasAnyAdditionalInfo = true;
    }
    if (film.legendasOutras) {
        otherDetailsContent += `<p><strong><i class="fas fa-language"></i> Outras Legendas:</strong> ${film.legendasOutras}</p>`;
        hasAnyAdditionalInfo = true;
    }
    if (film.website) {
        const websiteUrl = film.website.startsWith("http") ? film.website : `https://${film.website}`;
        otherDetailsContent += `<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">${film.website}</a></p>`;
        hasAnyAdditionalInfo = true;
    }

    if (otherDetailsContent) {
         additionalInfoContent += `
         <div class="filme-subsection">
             <h4><i class="fas fa-info-circle"></i> Outros Detalhes</h4>
             ${otherDetailsContent}
         </div>
         `;
    }

    // Renderiza a seção "Informações Adicionais" apenas se houver conteúdo
    if (hasAnyAdditionalInfo) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-info-circle"></i> Informações Adicionais <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                ${additionalInfoContent}
            </div>
        </div>
        `;
    }
        
    // BOTÕES DE COMPARTILHAMENTO
    filmContent += `
        <div class="social-share-container"></div>
    `;
    
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
    const controlsContainer = document.querySelector(".filme-page-controls");
    if (controlsContainer && film.assistirOnline && film.assistirOnline.trim() !== "") {
        const onlineUrl = film.assistirOnline.startsWith("http") ? film.assistirOnline : `https://${film.assistirOnline}`;
        const assistirOnlineBtn = document.createElement("a");
        assistirOnlineBtn.href = onlineUrl;
        assistirOnlineBtn.target = "_blank";
        assistirOnlineBtn.className = "btn-assistir-online";
        assistirOnlineBtn.innerHTML = "Assistir Online <i class=\"fas fa-external-link-alt\"></i>";
        // Insere o botão Assistir Online no início do container de controles
        controlsContainer.insertBefore(assistirOnlineBtn, controlsContainer.firstChild);
    }
} 

// FUNÇÃO PARA CONFIGURAR O COMPARTILHAMENTO
function setupSharingButtons(film) {
    // ATUALIZA O TÍTULO DA PÁGINA COM O NOME DO FILME
    document.title = `${film.title} - Catálogo de DVDs`;
    
    // CHAMA A FUNÇÃO DE COMPARTILHAMENTO DO COMUM.JS
    window.setupSharingButtons(film.title);
}

// FUNÇÃO PARA INICIALIZAR O CARROSSEL
function initializeCarousel(film) {
    const slidesContainer = document.getElementById('bannerSlides');
    const indicatorsContainer = document.getElementById('bannerIndicators');
    
    if (!slidesContainer || !indicatorsContainer) {
        console.error("Containers do carrossel não encontrados");
        return;
    }
    
    // Prepara os itens de mídia para o carrossel
    mediaItems = [];
    
    // 1. Adiciona o trailer primeiro (se existir)
    if (film.trailer && film.trailer.trim() !== '') {
        mediaItems.push({
            type: 'video',
            url: film.trailer,
            title: 'Trailer'
        });
    }
    
    // 2. Adiciona outros vídeos (se existirem)
    if (film.videos && film.videos.length > 0) {
        film.videos.forEach(video => {
            mediaItems.push({
                type: 'video',
                url: video.url,
                title: video.titulo || 'Vídeo'
            });
        });
    }
    
    // 3. Adiciona a capa do filme
    mediaItems.push({
        type: 'image',
        url: `capas/${film.imageName || 'progbrasil'}.jpg`,
        title: 'Capa do filme'
    });
    
    // 4. Adiciona imagens adicionais (se existirem)
    if (film.imagens_adicionais && film.imagens_adicionais.length > 0) {
        film.imagens_adicionais.forEach(imagem => {
            mediaItems.push({
                type: 'image',
                url: imagem.url || imagem,
                title: imagem.titulo || 'Imagem'
            });
        });
    }
    
    // Renderiza os slides
    mediaItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'banner-slide';
        
        if (item.type === 'video') {
            const youtubeId = getYoutubeId(item.url);
            if (youtubeId) {
                slide.innerHTML = `
                    <iframe 
                        src="https://www.youtube.com/embed/${youtubeId}" 
                        title="${item.title}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                slide.innerHTML = `
                    <div class="youtube-placeholder">
                        <i class="fab fa-youtube"></i>
                        <span>Vídeo não disponível</span>
                    </div>
                `;
            }
        } else {
            slide.innerHTML = `<img src="${item.url}" alt="${item.title}" onerror="this.src='capas/progbrasil.jpg'">`;
        }
        
        slidesContainer.appendChild(slide);
        
        // Adiciona indicador
        const indicator = document.createElement('div');
        indicator.className = 'banner-indicator';
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
        indicatorsContainer.appendChild(indicator);
    });
    
    // Configura os controles do carrossel
    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }
    
    // Inicializa o primeiro slide
    slides = document.querySelectorAll('.banner-slide');
    goToSlide(0);
}

// FUNÇÕES DO CARROSSEL
// FUNÇÃO PARA NAVEGAR ENTRE SLIDES
function goToSlide(index) {
    if (slides.length === 0) return;
    
    // Garante que o índice esteja dentro dos limites
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentSlide = index;
    
    // Atualiza a posição dos slides
    const slidesContainer = document.getElementById('bannerSlides');
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    // Atualiza os indicadores
    const indicators = document.querySelectorAll('.banner-indicator');
    indicators.forEach((indicator, i) => {
        if (i === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// FUNÇÃO PARA CONFIGURAR CONTEÚDO EXPANSÍVEL (Planos de Aula, Outros Materiais)
function setupExpandableContent() {
    const expandableTitles = document.querySelectorAll(".expandable-title");

    expandableTitles.forEach(clickedTitle => {
        // Initial ARIA setup
        const initialContent = clickedTitle.nextElementSibling;
        if (initialContent) {
             clickedTitle.setAttribute("aria-expanded", "false");
             initialContent.setAttribute("aria-hidden", "true");
             clickedTitle.setAttribute("role", "button");
             clickedTitle.setAttribute("tabindex", "0");
             clickedTitle.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    clickedTitle.click();
                }
            });
        }

        clickedTitle.addEventListener("click", () => {
            const clickedSection = clickedTitle.closest(".expandable-section");
            const clickedContent = clickedTitle.nextElementSibling;
            const clickedIcon = clickedTitle.querySelector(".expand-icon");

            if (!clickedContent || !clickedSection || !clickedIcon) return; // Safety check

            const isCurrentlyOpen = clickedSection.classList.contains("open");

            // Close all other sections first
            expandableTitles.forEach(otherTitle => {
                const otherSection = otherTitle.closest(".expandable-section");
                const otherContent = otherTitle.nextElementSibling;
                const otherIcon = otherTitle.querySelector(".expand-icon");

                // Close others only if they are currently open and not the one being clicked
                if (otherSection && otherContent && otherIcon && otherSection !== clickedSection && otherSection.classList.contains("open")) {
                    otherSection.classList.remove("open");
                    otherIcon.classList.remove("fa-chevron-up");
                    otherIcon.classList.add("fa-chevron-down");
                    otherTitle.setAttribute("aria-expanded", "false");
                    otherContent.setAttribute("aria-hidden", "true");
                }
            });

            // Toggle the clicked section state
            if (isCurrentlyOpen) {
                // It was open, now close it
                clickedSection.classList.remove("open");
                clickedIcon.classList.remove("fa-chevron-up");
                clickedIcon.classList.add("fa-chevron-down");
                clickedTitle.setAttribute("aria-expanded", "false");
                clickedContent.setAttribute("aria-hidden", "true");
            } else {
                // It was closed, now open it
                clickedSection.classList.add("open");
                clickedIcon.classList.remove("fa-chevron-down");
                clickedIcon.classList.add("fa-chevron-up");
                clickedTitle.setAttribute("aria-expanded", "true");
                clickedContent.setAttribute("aria-hidden", "false");
            }
        });
    });
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


// INICIALIZAÇÃO QUANDO O DOM ESTIVER PRONTO
document.addEventListener("DOMContentLoaded", loadFilmData);

