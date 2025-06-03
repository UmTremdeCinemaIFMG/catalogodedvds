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
        
        // CONFIGURA COMPARTILHAMENTO
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
    
    // INFORMAÇÕES ADICIONAIS
    const hasAdditionalInfo = film.audiodescricao || film.closedCaption || film.website || 
                            film.assistirOnline || film.festivais || film.premios || 
                            film.legendasOutras || (film.materialOutros && film.materialOutros.length > 0);
    
    // HEADER DO FILME
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
    let filmContent = "";
    
    // SINOPSE
    if (film.synopsis) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-align-left"></i> Sinopse</h3>
            <p>${film.synopsis}</p>
        </div>
        `;
    }
    
    // ODS - MODIFICADO PARA EFEITO FLIP E CORES
    if (film.ods && film.ods.length > 0) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-globe-americas"></i> Objetivos de Desenvolvimento Sustentável</h3>
            <div class="ods-container">
                ${film.ods.map(ods => {
                    const odsNumberMatch = ods.match(/\d+/); // Extrai o número do ODS
                    if (odsNumberMatch) {
                        const odsNumber = odsNumberMatch[0];
                        const description = odsDescriptions[odsNumber] || `Descrição para ODS ${odsNumber} não encontrada.`; // Pega descrição do JSON
                        const link = `https://brasil.un.org/pt-br/sdgs/${odsNumber}`;
                        
                        // Adiciona data-ods-number ao ods-back para estilização CSS
                        return `
                            <div class="ods-flip-container">
                                <a href="${link}" target="_blank" class="ods-flipper-link" title="ODS ${ods} - Clique para saber mais">
                                    <div class="ods-flipper">
                                        <div class="ods-front">
                                            <img src="ods_icons/ods_${odsNumber}.svg" 
                                                 alt="Ícone do ODS ${ods}" 
                                                 loading="lazy">
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
    
    // TEMAS
    if (hasThemes) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-tags"></i> Temas</h3>
            ${themes.map(theme => `<span class="theme-tag">${theme}</span>`).join("")}
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
            <p>${film.festivais.replace(/\n/g, "<br>")}</p>
        </div>
        `;
    }
    
    // PRÊMIOS
    if (film.premios) {
        filmContent += `
        <div class="filme-section">
            <h3><i class="fas fa-award"></i> Prêmios</h3>
            <p>${film.premios.replace(/\n/g, "<br>")}</p>
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
        let additionalContent = "";
        
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
            const websiteUrl = film.website.startsWith("http") ? film.website : `https://${film.website}`;
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
    const controlsContainer = document.querySelector(".filme-page-controls");
    if (controlsContainer && film.assistirOnline && film.assistirOnline.trim() !== "") {
        // Garante que a URL tenha protocolo
        const onlineUrl = film.assistirOnline.startsWith("http") ? film.assistirOnline : `https://${film.assistirOnline}`;
        const assistirOnlineBtn = document.createElement("a");
        assistirOnlineBtn.href = onlineUrl;
        assistirOnlineBtn.target = "_blank";
        assistirOnlineBtn.className = "btn-assistir-online";
        assistirOnlineBtn.innerHTML = "Assistir Online <i class=\"fas fa-external-link-alt\"></i>"; // Ícone atualizado
        // Insere o botão após o botão de voltar
        const voltarBtn = controlsContainer.querySelector(".btn-voltar");
        if (voltarBtn) {
            voltarBtn.insertAdjacentElement("afterend", assistirOnlineBtn);
        } else {
            controlsContainer.appendChild(assistirOnlineBtn);
        }
    }
} 

// FUNÇÃO PARA INICIALIZAR O CARROSSEL
function initializeCarousel(film) {
    const slidesContainer = document.getElementById("bannerSlides");
    const indicatorsContainer = document.getElementById("bannerIndicators");
    
    if (!slidesContainer || !indicatorsContainer) {
        console.warn("Elementos do carrossel não encontrados.");
        return;
    }

    mediaItems = [];

    // 1. Adiciona a capa principal
    const mainCover = getDvdCover(film); // Usa a função de script.js
    mediaItems.push({ type: "image", src: mainCover, alt: `Capa principal de ${film.title}` });

    // 2. Adiciona o trailer, se existir
    if (film.trailer && film.trailer.trim() !== "") {
        mediaItems.push({ type: "video", src: film.trailer, alt: `Trailer de ${film.title}` });
    }

    // 3. Adiciona imagens adicionais, se existirem
    if (film.imagens_adicionais && film.imagens_adicionais.length > 0) {
        film.imagens_adicionais.forEach((imgUrl, index) => {
            if (imgUrl && imgUrl.trim() !== "") {
                mediaItems.push({ type: "image", src: imgUrl, alt: `Imagem adicional ${index + 1} de ${film.title}` });
            }
        });
    }

    // Limpa containers
    slidesContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";
    currentSlide = 0;

    // Cria slides e indicadores
    mediaItems.forEach((item, index) => {
        const slide = document.createElement("div");
        slide.className = "banner-slide";
        if (index === 0) slide.classList.add("active");

        if (item.type === "image") {
            slide.innerHTML = `<img src="${item.src}" alt="${item.alt}" onerror="this.onerror=null; this.src="capas/progbrasil.png"; this.alt="Imagem indisponível";">`;
        } else if (item.type === "video") {
            // Tenta extrair ID do YouTube
            let videoId = null;
            try {
                const url = new URL(item.src);
                if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
                    videoId = url.searchParams.get("v");
                } else if (url.hostname === "youtu.be") {
                    videoId = url.pathname.substring(1);
                }
            } catch (e) {
                console.warn("URL do trailer inválida:", item.src);
            }

            if (videoId) {
                slide.innerHTML = `
                    <iframe 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerpolicy="strict-origin-when-cross-origin" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                // Fallback se não for YouTube ou ID não encontrado
                slide.innerHTML = `<p>Trailer disponível em: <a href="${item.src}" target="_blank">${item.src}</a></p>`;
            }
        }
        slidesContainer.appendChild(slide);

        // Cria indicador
        const indicator = document.createElement("span");
        indicator.className = "banner-indicator";
        if (index === 0) indicator.classList.add("active");
        indicator.dataset.index = index;
        indicator.onclick = () => showSlide(index);
        indicatorsContainer.appendChild(indicator);
    });

    slides = slidesContainer.querySelectorAll(".banner-slide");
    const indicators = indicatorsContainer.querySelectorAll(".banner-indicator");

    // Esconde controles se houver apenas 1 item
    const controls = document.querySelector(".banner-controls");
    if (mediaItems.length <= 1) {
        if (controls) controls.style.display = "none";
        if (indicatorsContainer) indicatorsContainer.style.display = "none";
    } else {
        if (controls) controls.style.display = "flex";
        if (indicatorsContainer) indicatorsContainer.style.display = "flex";
        // Adiciona eventos aos botões de controle
        document.getElementById("prevSlide").onclick = prevSlide;
        document.getElementById("nextSlide").onclick = nextSlide;
    }

    // Mostra o primeiro slide
    showSlide(0);
}

// FUNÇÕES DO CARROSSEL
function showSlide(index) {
    if (!slides || slides.length === 0) return;
    
    // Pausar vídeos anteriores
    slides.forEach((slide, i) => {
        const iframe = slide.querySelector("iframe");
        if (iframe && i !== index) {
            // Pausa o vídeo do YouTube
            iframe.contentWindow.postMessage("{\"event\":\"command\",\"func\":\"pauseVideo\",\"args\":\"\"}", "*");
        }
        slide.classList.remove("active");
    });

    const indicators = document.querySelectorAll(".banner-indicator");
    indicators.forEach(indicator => indicator.classList.remove("active"));

    currentSlide = index;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }

    slides[currentSlide].classList.add("active");
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.add("active");
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// FUNÇÃO PARA CONFIGURAR CONTEÚDO EXPANSÍVEL (Planos de Aula, Outros Materiais)
function setupExpandableContent() {
    const expandableTitles = document.querySelectorAll(".expandable-title");
    expandableTitles.forEach(title => {
        title.addEventListener("click", () => {
            const content = title.nextElementSibling;
            const section = title.closest(".expandable-section");
            const icon = title.querySelector(".expand-icon");

            if (content && section && icon) {
                section.classList.toggle("open");
                icon.classList.toggle("fa-chevron-down");
                icon.classList.toggle("fa-chevron-up");
                
                // Alterna a acessibilidade
                const isExpanded = section.classList.contains("open");
                title.setAttribute("aria-expanded", isExpanded);
                content.setAttribute("aria-hidden", !isExpanded);
            }
        });

        // Define estado inicial de acessibilidade
        const content = title.nextElementSibling;
        if (content) {
             title.setAttribute("aria-expanded", "false");
             content.setAttribute("aria-hidden", "true");
             title.setAttribute("role", "button"); // Indica que é clicável
             title.setAttribute("tabindex", "0"); // Torna focável via teclado
             // Permite ativar com Enter/Espaço
             title.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault(); // Previne rolagem da página com Espaço
                    title.click();
                }
            });
        }
    });
}

// FUNÇÕES DE COMPARTILHAMENTO
function setupSharingButtons(film) {
    // As funções de compartilhamento individuais (shareOnWhatsApp, etc.) 
    // usarão a URL atual e o título do filme.
    // Não precisam de configuração extra aqui se já usam `window.location.href` e `document.title`
    // ou se podemos passar `film.title` para elas.
    // Vamos assumir que elas pegam da página ou definimos globalmente.
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

// INICIALIZAÇÃO QUANDO O DOM ESTIVER PRONTO
document.addEventListener("DOMContentLoaded", loadFilmData);

