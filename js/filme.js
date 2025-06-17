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
    } catch (error) {
        console.error("Erro ao carregar ods_descriptions.json:", error);
        odsDescriptions = {};
    }
}

// FUNÇÃO PARA RENDERIZAR OS ÍCONES DAS COMPETÊNCIAS DA BNCC COM EFEITO FLIP
async function renderBnccCompetencies(film) {
    if (!film.bnccCompetencias || film.bnccCompetencias.length === 0) return;

    const container = document.getElementById('bnccCompetenciesContainer');
    if (!container) return;

    try {
        const response = await fetch('bncc_competencias.json');
        if (!response.ok) throw new Error('Falha ao carregar bncc_competencias.json');
        const todasCompetencias = await response.json();

        const bnccLink = "https://basenacionalcomum.mec.gov.br/abase/#introducao#competencias-gerais-da-base-nacional-comum-curricular:~:text=termos%20da%20LDB.-,COMPET%C3%8ANCIAS%20GERAIS%20DA%20EDUCA%C3%87%C3%83O%20B%C3%81SICA,-Valorizar%20e%20utilizar";

        const competenciasDoFilme = todasCompetencias.filter(comp =>
            film.bnccCompetencias.includes(comp.id)
        );

        const competenciesHtml = competenciasDoFilme.map(comp => `
            <div class="ods-flip-container">
                <a href="${bnccLink}" target="_blank" rel="noopener noreferrer" class="ods-flipper-link" title="Competência ${comp.id}: ${comp.titulo} - Saiba mais na BNCC">
                    <div class="ods-flipper">
                        <div class="ods-front" style="background-image: url('bncc_icons/bncc_${comp.id}.svg'); background-size: cover; background-position: center;">
                            <!-- O conteúdo visual já está no SVG -->
                        </div>
                        <div class="ods-back bncc-card" data-bncc-number="${comp.id}">
                            <p>${comp.descricao}</p>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');

        container.innerHTML = `
            <h3><i class="fas fa-book-reader"></i> Competências Gerais da BNCC</h3>
            <div class="ods-container">
                ${competenciesHtml}
            </div>
        `;
    } catch (error) {
        console.error("Erro ao renderizar competências da BNCC:", error);
        container.innerHTML = '<p>Erro ao carregar ícones da BNCC.</p>';
    }
}

// FUNÇÃO PARA RENDERIZAR DADOS DO FILME
function renderFilmData(film) {
    const filmContainer = document.getElementById("filmeContainer");
    if (!filmContainer) {
        console.error("Container do filme não encontrado");
        return;
    }

    const classification = film.classification || 0;
    const classificationClass = getClassificationClass(classification);
    const classificationText = classification <= 0 ? "L" : classification;
    const themes = createThemesList(film);
    const hasThemes = themes.length > 0;

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
                        `<p><strong><i class="fas fa-info-circle"></i> Descrição:</strong> <a href="${desc.url || '#'}" target="_blank">${desc.Descrição || 'N/A'}</a></p>`
                    ).join('') : ''
                }
            </div>
        </div>
    `;

    let filmContent = "";

    if (hasThemes) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-tags"></i> Temas</h3>
            ${themes.map(theme => `<span class="theme-tag">${theme}</span>`).join("")}
        </div>`;
    }

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
                                <a href="${link}" target="_blank" class="ods-flipper-link" title="ODS ${ods} - Clique para saber mais">
                                    <div class="ods-flipper">
                                        <div class="ods-front">
                                            <img src="ods_icons/ods_${odsNumber}.svg" alt="Ícone do ODS ${ods}" loading="lazy">
                                        </div>
                                        <div class="ods-back" data-ods-number="${odsNumber}">
                                            <p>${description}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                    }
                    return "";
                }).join("")}
            </div>
        </div>`;
    }

    if (film.odsJustificados && film.odsJustificados.length > 0) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-globe-americas"></i> Justificativa dos ODS <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                ${film.odsJustificados.map(item => `
                    <div class="destaque-horizontal">
                        <p><strong>ODS ${item.ods}:</strong> ${item.justificativa}</p>
                    </div>`).join('')}
            </div>
        </div>`;
    }

    filmContent += `<div class="filme-section" id="bnccCompetenciesContainer"></div>`;

    const hasOtherBnccData = (film.bnccEtapas && film.bnccEtapas.length > 0) ||
                             (film.bnccAreas && film.bnccAreas.length > 0) ||
                             (film.bnccTemas && film.bnccTemas.length > 0) ||
                             film.bnccJustificativa;

    if (hasOtherBnccData) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-info-circle"></i> Detalhes Pedagógicos (BNCC) <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                ${film.bnccEtapas && film.bnccEtapas.length > 0 ? `<div class="destaque-horizontal"><p><strong>Etapas:</strong> ${film.bnccEtapas.join(', ')}</p></div>` : ''}
                ${film.bnccAreas && film.bnccAreas.length > 0 ? `<div class="destaque-horizontal"><p><strong>Áreas:</strong> ${film.bnccAreas.join(', ')}</p></div>` : ''}
                ${film.bnccCompetencias && film.bnccCompetencias.length > 0 ? `<div class="destaque-horizontal"><p><strong>Competências Gerais:</strong> ${film.bnccCompetencias.join(', ')}</p></div>` : ''}
                ${film.bnccTemas && film.bnccTemas.length > 0 ? `<div class="destaque-horizontal"><p><strong>Temas Transversais:</strong> ${film.bnccTemas.join(', ')}</p></div>` : ''}
                ${film.bnccJustificativa ? `<div class="destaque-horizontal"><p><strong>Justificativa Pedagógica:</strong> ${film.bnccJustificativa}</p></div>` : ''}
            </div>
        </div>`;
    }

    if (film.synopsis) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-align-left"></i> Sinopse <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                <p>${film.synopsis}</p>
            </div>
        </div>`;
    }

    filmContent += `
    <div class="filme-section expandable-section">
        <h3 class="expandable-title"><i class="fas fa-chalkboard-teacher"></i> Planos de Aula <i class="fas fa-chevron-down expand-icon"></i></h3>
        <div class="expandable-content">
            <div class="enviar-plano-container">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdxQz8onMOFjxIqEPpo5v2I4CJdLQ9cN50I7zUhmnBwgUeGIQ/viewform" target="_blank" rel="noopener noreferrer" class="btn-enviar-plano" style="display:inline-block; margin-top:15px; background:#009a44; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:500;">
                    <i class="fas fa-plus-circle"></i> Envie um plano de aula
                </a>
                <p class="enviar-plano-descricao">
                    Você pode colaborar enviando um plano de aula para este filme. Ao clicar, você será direcionado a um formulário.
                </p>
            </div>
            ${(film.planos_de_aula && film.planos_de_aula.length > 0) ? renderTeachingPlans(film) : '<p>Nenhum plano de aula disponível para este filme ainda.</p>'}
        </div>
    </div>`;

    if (film.materialOutros && film.materialOutros.length > 0) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-file-alt"></i> Outros Materiais <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">
                 ${renderOtherMaterials(film)}
            </div>
        </div>`;
    }

    let additionalInfoContent = "";
    let hasAnyAdditionalInfo = false;

    if (film.festivais) {
        additionalInfoContent += `<div class="filme-subsection"><h4><i class="fas fa-ticket-alt"></i> Festivais</h4><p>${film.festivais.replace(/\n/g, "<br>")}</p></div>`;
        hasAnyAdditionalInfo = true;
    }
    if (film.premios) {
        additionalInfoContent += `<div class="filme-subsection"><h4><i class="fas fa-award"></i> Prêmios</h4><p>${film.premios.replace(/\n/g, "<br>")}</p></div>`;
        hasAnyAdditionalInfo = true;
    }
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
        otherDetailsContent += `<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${websiteUrl}" target="_blank">${film.website}</a></p>`;
        hasAnyAdditionalInfo = true;
    }
    if (otherDetailsContent) {
        additionalInfoContent += `<div class="filme-subsection"><h4><i class="fas fa-info-circle"></i> Outros Detalhes</h4>${otherDetailsContent}</div>`;
    }
    if (hasAnyAdditionalInfo) {
        filmContent += `
        <div class="filme-section expandable-section">
            <h3 class="expandable-title"><i class="fas fa-info-circle"></i> Informações Adicionais <i class="fas fa-chevron-down expand-icon"></i></h3>
            <div class="expandable-content">${additionalInfoContent}</div>
        </div>`;
    }

    filmContent += `
    <div class="filme-section social-share-bottom-container">
        <h3><i class="fas fa-share-alt"></i> Compartilhar</h3>
        <div class="social-share-buttons">
            <button class="social-share-button whatsapp" title="Compartilhar no WhatsApp" onclick="shareOnWhatsApp()"><i class="fab fa-whatsapp"></i></button>
            <button class="social-share-button facebook" title="Compartilhar no Facebook" onclick="shareOnFacebook()"><i class="fab fa-facebook-f"></i></button>
            <button class="social-share-button twitter" title="Compartilhar no X (Twitter)" onclick="shareOnTwitter()"><i class="fab fa-twitter"></i></button>
            <button class="social-share-button copy" title="Copiar link" onclick="copyToClipboard()"><i class="fas fa-link"></i></button>
        </div>
    </div>`;

    filmContainer.innerHTML = `
        <div class="banner-carrossel">
            <div class="banner-slides" id="bannerSlides"></div>
            <div class="banner-controls">
                <button class="banner-control" id="prevSlide"><i class="fas fa-chevron-left"></i></button>
                <button class="banner-control" id="nextSlide"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="banner-indicators" id="bannerIndicators"></div>
        </div>
        ${filmHeader.outerHTML}
        ${filmContent}`;

    const controlsContainer = document.querySelector(".filme-page-controls");
    if (controlsContainer && film.assistirOnline && film.assistirOnline.trim() !== "") {
        const onlineUrl = film.assistirOnline.startsWith("http") ? film.assistirOnline : `https://${film.assistirOnline}`;
        const assistirOnlineBtn = document.createElement("a");
        assistirOnlineBtn.href = onlineUrl;
        assistirOnlineBtn.target = "_blank";
        assistirOnlineBtn.className = "btn-assistir-online";
        assistirOnlineBtn.innerHTML = "Assistir Online <i class=\"fas fa-external-link-alt\"></i>";
        controlsContainer.insertBefore(assistirOnlineBtn, controlsContainer.firstChild);
    }
}

// FUNÇÃO PARA CARREGAR DADOS DO FILME
async function loadFilmData() {
    try {
        const loadingElement = document.querySelector(".loading");
        if (loadingElement) loadingElement.style.display = "flex";

        await loadOdsDescriptions();

        const filmTitle = getUrlParameter("titulo");
        if (!filmTitle) throw new Error("Título do filme não especificado na URL");

        const decodedFilmTitle = decodeURIComponent(filmTitle);
        const response = await fetch("catalogo.json");
        if (!response.ok) throw new Error("Erro ao carregar o catálogo");

        const data = await response.json();
        const normalizedSearchTitle = normalizeString(decodedFilmTitle);
        const film = data.find(item => item["Título do filme"] && normalizeString(item["Título do filme"]) === normalizedSearchTitle);

        if (!film) throw new Error(`Filme "${decodedFilmTitle}" não encontrado no catálogo.`);

        const transformedFilm = transformFilmData(film);
        renderFilmData(transformedFilm);
        console.log("Dados transformados:", transformedFilm);

        //======================================================================================
        // INÍCIO DO CÓDIGO A SER ADICIONADO - ATUALIZA AS META TAGS
        //======================================================================================
        :description" content="Detalhes completos do filme no catálogo de DVDs do Projeto Um Trem de Cinema do IFMG Sabará" />
    <meta id="og-image" property="og:image" content="https://umtremdecinemaifmg.github.io/catalogodedvds/social-share-image.png" />
    <meta id="og-url" property="og:url" content="https://umtremdecinemaifmg.github.io/catalogodedvds/" />
    <meta property="og:type" content="website" />

    <meta name="twitter:card" content="summary_large_image">
    <meta id="twitter-title" name="twitter:title" content="Catálogo de DVDs - Um Trem de Cinema">
    <meta id="twitter-description" name="twitter:description" content="Detalhes completos do filme no catálogo de DVDs do Projeto Um Trem de Cinema do IFMG Sabará">
    <meta id="twitter-image" name="twitter:image" content="https://umtremdecinemaifmg.github.io/catalogodedvds/social-share-image.png">

        if (loadingElement) loadingElement.style.display = "none";

        setupExpandableContent();
        initializeCarousel(transformedFilm);
        setupSharingButtons(transformedFilm);
        renderBnccCompetencies(transformedFilm);

    } catch (error) {
        console.error("Erro:", error);
        const filmContainer = document.getElementById("filmeContainer");
        if (filmContainer) {
            filmContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar dados do filme</p><p>${error.message}</p><a href="index.html" class="btn-voltar"><i class="fas fa-arrow-left"></i> Voltar para o catálogo</a></div>`;
        }
        const loadingElement = document.querySelector(".loading");
        if (loadingElement) loadingElement.style.display = "none";
    }
}

// FUNÇÃO PARA INICIALIZAR O CARROSSEL
function initializeCarousel(film) {
    const slidesContainer = document.getElementById('bannerSlides');
    const indicatorsContainer = document.getElementById('bannerIndicators');

    if (!slidesContainer || !indicatorsContainer) {
        console.error("Containers do carrossel não encontrados");
        return;
    }

    mediaItems = [];

    if (film.trailer && film.trailer.trim() !== '') {
        mediaItems.push({ type: 'video', url: film.trailer, title: 'Trailer' });
    }
    if (film.videos && film.videos.length > 0) {
        film.videos.forEach(video => {
            mediaItems.push({ type: 'video', url: video.url, title: video.titulo || 'Vídeo' });
        });
    }
    mediaItems.push({ type: 'image', url: `capas/${film.imageName || 'progbrasil'}.jpg`, title: 'Capa do filme' });
    if (film.imagens_adicionais && film.imagens_adicionais.length > 0) {
        film.imagens_adicionais.forEach(imagem => {
            mediaItems.push({ type: 'image', url: imagem.url || imagem, title: imagem.titulo || 'Imagem' });
        });
    }

    slidesContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    mediaItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'banner-slide';

        if (item.type === 'video') {
            const youtubeId = getYoutubeId(item.url);
            if (youtubeId) {
                slide.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}" title="${item.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else {
                slide.innerHTML = `<div class="youtube-placeholder"><i class="fab fa-youtube"></i><span>Vídeo não disponível</span></div>`;
            }
        } else {
            slide.innerHTML = `<img src="${item.url}" alt="${item.title}" onerror="this.src='capas/progbrasil.jpg'">`;
        }
        slidesContainer.appendChild(slide);

        const indicator = document.createElement('div');
        indicator.className = 'banner-indicator';
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    if (prevButton) prevButton.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextButton) nextButton.addEventListener('click', () => goToSlide(currentSlide + 1));

    slides = document.querySelectorAll('.banner-slide');
    goToSlide(0);
}

// FUNÇÃO PARA NAVEGAR ENTRE SLIDES
function goToSlide(index) {
    if (!slides || slides.length === 0) return;
    currentSlide = (index + slides.length) % slides.length;
    const slidesContainer = document.getElementById('bannerSlides');
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    const indicators = document.querySelectorAll('.banner-indicator');
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentSlide);
    });
}

// FUNÇÃO PARA CONFIGURAR CONTEÚDO EXPANSÍVEL
function setupExpandableContent() {
    const expandableTitles = document.querySelectorAll(".expandable-title");
    expandableTitles.forEach(clickedTitle => {
        const initialContent = clickedTitle.nextElementSibling;
        if (initialContent) {
            clickedTitle.setAttribute("aria-expanded", "false");
            initialContent.setAttribute("aria-hidden", "true");
            clickedTitle.setAttribute("role", "button");
            clickedTitle.setAttribute("tabindex", "0");
            const clickOrKeyHandler = (event) => {
                if (event.type === 'click' || (event.type === 'keydown' && (event.key === "Enter" || event.key === " "))) {
                    event.preventDefault();
                    const clickedSection = clickedTitle.closest(".expandable-section");
                    const clickedContent = clickedTitle.nextElementSibling;
                    const clickedIcon = clickedTitle.querySelector(".expand-icon");
                    if (!clickedContent || !clickedSection || !clickedIcon) return;
                    const isCurrentlyOpen = clickedSection.classList.contains("open");
                    expandableTitles.forEach(otherTitle => {
                        const otherSection = otherTitle.closest(".expandable-section");
                        if (otherSection && otherSection !== clickedSection && otherSection.classList.contains("open")) {
                            otherSection.classList.remove("open");
                            const otherIcon = otherTitle.querySelector(".expand-icon");
                            if (otherIcon) {
                                otherIcon.classList.remove("fa-chevron-up");
                                otherIcon.classList.add("fa-chevron-down");
                            }
                            otherTitle.setAttribute("aria-expanded", "false");
                            otherTitle.nextElementSibling.setAttribute("aria-hidden", "true");
                        }
                    });
                    clickedSection.classList.toggle("open", !isCurrentlyOpen);
                    clickedIcon.classList.toggle("fa-chevron-up", !isCurrentlyOpen);
                    clickedIcon.classList.toggle("fa-chevron-down", isCurrentlyOpen);
                    clickedTitle.setAttribute("aria-expanded", !isCurrentlyOpen);
                    clickedContent.setAttribute("aria-hidden", isCurrentlyOpen);
                }
            };
            clickedTitle.addEventListener("click", clickOrKeyHandler);
            clickedTitle.addEventListener("keydown", clickOrKeyHandler);
        }
    });
}

// FUNÇÕES DE COMPARTILHAMENTO
function setupSharingButtons(film) {
    document.title = `${film.title} - Catálogo de DVDs`;
    window.shareFilmTitle = film.title;
    window.shareFilmUrl = window.location.href;
}

function shareOnWhatsApp() {
    const text = encodeURIComponent(`Confira este filme: ${window.shareFilmTitle} - ${window.shareFilmUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.shareFilmUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
}

function shareOnTwitter() {
    const text = encodeURIComponent(`Confira este filme: ${window.shareFilmTitle}`);
    const url = encodeURIComponent(window.shareFilmUrl);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
}

function copyToClipboard() {
    navigator.clipboard.writeText(window.shareFilmUrl).then(() => {
        alert("Link copiado para a área de transferência!");
    }).catch(err => {
        console.error("Erro ao copiar link: ", err);
        alert("Erro ao copiar o link.");
    });
}

// EXTRAI ID DO YOUTUBE DE UMA URL
function getYoutubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

// INICIALIZAÇÃO QUANDO O DOM ESTIVER PRONTO
document.addEventListener("DOMContentLoaded", loadFilmData);
