// ==========================================
// FILME.JS - SCRIPT PARA PÁGINA EXCLUSIVA DE FILME
// ==========================================

// VARIÁVEIS GLOBAIS
let allFilms = [];           // ARMAZENA TODOS OS FILMES DO CATÁLOGO
let currentFilm = null;      // FILME ATUAL SENDO EXIBIDO

// FUNÇÕES DE UTILIDADE E FORMATAÇÃO
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
    const DEFAULT_COVER = 'capas/progbrasil.png';
    
    if (filmData.imageName) {
        const baseName = filmData.imageName.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        const imagePath = `capas/${baseName}.jpg`;
        return imagePath;
    }
    
    return DEFAULT_COVER;
}

// TRANSFORMA DADOS DO JSON PARA O FORMATO DESEJADO
function transformFilmData(originalFilm) {
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
        nossoAcervo: cleanField(originalFilm["Nosso Acervo"]),
        pgm: parseInt(originalFilm["PGM"]) || 0,
        filmes: parseInt(originalFilm["Filmes"]) || 0,
        dvd: cleanField(originalFilm["Nome do Programa"]),
        imageName: cleanField(originalFilm["imageName"]),
        classification: parseInt(originalFilm["Classificação Indicativa POR PGM"]) || 0,
        planos_de_aula: originalFilm["planos_de_aula"] || []
    };
}

// CRIA LISTA DE TEMAS
function createThemesList(film) {
    const themes = [];
    
    if (film.tema) {
        themes.push(...film.tema.split(',').map(t => t.trim()));
    }
    
    if (film.tags) {
        themes.push(...film.tags.split(',').map(t => t.trim()));
    }
    
    return [...new Set(themes.filter(t => t))];
}

// FUNÇÃO DE RENDERIZAÇÃO DOS PLANOS DE AULA
function renderTeachingPlans(film) {
    // Se não houver campo ou for vazio, retorna mensagem padrão
    if (!film.planos_de_aula || film.planos_de_aula.length === 0) {
        return '<p><i class="fas fa-info-circle"></i> Nenhum plano de aula disponível.</p>';
    }
    // Monta o HTML para cada plano de aula
    return film.planos_de_aula.map(plano => `
        <div class="teaching-plan-card">
            <p><strong><i class="fas fa-graduation-cap"></i> Nível de Ensino:</strong> ${plano.nivel_ensino || ''}</p>
            <p><strong><i class="fas fa-book"></i> Área de Conhecimento:</strong> ${plano.area_conhecimento || ''}</p>
            <p><strong><i class="fas fa-globe"></i> Site:</strong> <a href="${plano.url}" target="_blank">${plano.site}</a></p>
            <p><strong><i class="fas fa-info-circle"></i> Descrição:</strong> ${plano.descricao || ''}</p>
        </div>
    `).join('');
}

// FUNÇÃO DE RENDERIZAÇÃO DE OUTROS MATERIAIS
function renderOtherMaterials(film) {
    if (!film.materialOutros || film.materialOutros.length === 0) {
        return '<p><i class="fas fa-info-circle"></i> Nenhum material adicional disponível.</p>';
    }
    return film.materialOutros.map(material => `
        <div class="other-material-card">
            <p><strong><i class="fas fa-bookmark"></i> Tipo:</strong> ${material.tipo || ''}</p>
            <p><strong><i class="fas fa-file-alt"></i> Título:</strong> <a href="${material.url}" target="_blank">${material.titulo}</a></p>
        </div>
    `).join('');
}

// RENDERIZA OS DETALHES DO FILME NA PÁGINA
function renderFilmDetails(film) {
    const filmeContainer = document.getElementById('filmeContainer');
    
    const classification = film.classification || 0;
    const classificationClass = getClassificationClass(classification);
    const classificationText = classification <= 0 ? 'L' : classification;
    
    const themes = createThemesList(film);
    const hasThemes = themes.length > 0;
    
    const hasAdditionalInfo = film.audiodescricao || film.closedCaption || film.website || 
                            film.portaCurta || film.festivais || film.premios || 
                            film.legendasOutras || film.materialOutros;
    
    // Atualiza o título da página
    document.title = `${film.title} - Catálogo de DVDs`;
    
    filmeContainer.innerHTML = `
        <div class="filme-header">
            <div class="filme-poster-container">
                <img src="${getDvdCover(film)}" alt="${film.title}" class="filme-poster" onerror="this.src='capas/progbrasil.png'">
            </div>
            <div class="filme-info">
                <h2 class="filme-title">
                    <span class="classification ${classificationClass}">${classificationText}</span>
                    ${film.title}
                </h2>
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
                    ${film.dvd ? `<p><strong><i class="fas fa-compact-disc"></i> DVD:</strong> ${film.dvd}</p>` : ''}
                </div>
            </div>
        </div>
        
        ${hasThemes ? `
        <div class="filme-section">
            <h3><i class="fas fa-tags"></i> Temas</h3>
            ${themes.map(theme => `<span class="theme-tag">${theme}</span>`).join('')}
        </div>
        ` : ''}
        
        ${film.synopsis ? `
        <div class="filme-section">
            <h3><i class="fas fa-align-left"></i> Sinopse</h3>
            <p>${film.synopsis}</p>
        </div>
        ` : ''}
        
        ${hasAdditionalInfo ? `
        <div class="filme-section">
            <h3><i class="fas fa-info-circle"></i> Informações Adicionais</h3>
            ${film.audiodescricao ? `<p><strong><i class="fas fa-assistive-listening-systems"></i> Audiodescrição:</strong> ${film.audiodescricao}</p>` : ''}
            ${film.closedCaption ? `<p><strong><i class="fas fa-closed-captioning"></i> Closed Caption:</strong> ${film.closedCaption}</p>` : ''}
            ${film.website ? `<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${film.website.startsWith('http') ? film.website : 'https://' + film.website}" target="_blank">${film.website}</a></p>` : ''}
            ${film.portaCurta ? `<p><strong><i class="fas fa-film"></i> Porta Curtas:</strong> <a href="${film.portaCurta.startsWith('http') ? film.portaCurta : 'https://' + film.portaCurta}" target="_blank">Link</a></p>` : ''}
            ${film.festivais ? `<p><strong><i class="fas fa-trophy"></i> Festivais:</strong> ${film.festivais}</p>` : ''}
            ${film.premios ? `<p><strong><i class="fas fa-award"></i> Prêmios:</strong> ${film.premios}</p>` : ''}
            ${film.legendasOutras ? `<p><strong><i class="fas fa-language"></i> Outras Legendas:</strong> ${film.legendasOutras}</p>` : ''}
        </div>
        ` : ''}

        <!-- Seção de Materiais Adicionais -->
        <div class="filme-section">
            <h3><i class="fas fa-box-open"></i> Materiais Adicionais</h3>
            ${renderOtherMaterials(film)}
        </div>

        <!-- Seção de Planos de Aula -->
        <div class="filme-section">
            <h3><i class="fas fa-chalkboard-teacher"></i> Planos de Aula</h3>
            ${renderTeachingPlans(film)}
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdxQz8onMOFjxIqEPpo5v2I4CJdLQ9cN50I7zUhmnBwgUeGIQ/viewform?usp=sharing&ouid=101786859238464224020" target="_blank" class="btn-enviar-plano" style="display:inline-block; margin-top:15px; background:#009a44; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:500;">
                <i class="fas fa-plus"></i> Envie um plano de aula
            </a>
            <p style="font-size: 0.95em; color: #666; margin-top: 6px;">
                Você pode colaborar enviando um plano de aula para este filme. Ao clicar, você será direcionado a um formulário.
            </p>
        </div>
        
        <!-- Seção de Conteúdo Expandido (exemplo) -->
        <div class="expanded-content">
            <h3><i class="fas fa-expand-alt"></i> Conteúdo Expandido</h3>
            <p>Esta seção contém informações adicionais sobre o filme que podem ser úteis para educadores e estudantes.</p>
            
            ${film.nossoAcervo ? `
            <div class="filme-section">
                <h3><i class="fas fa-archive"></i> Informações do Acervo</h3>
                <p>${film.nossoAcervo}</p>
            </div>
            ` : ''}
            
            <!-- Aqui você pode adicionar mais seções expandidas conforme necessário -->
        </div>
    `;
    
    // Configura o evento do Fale Conosco
    setupFeedbackModal();
}

// CONFIGURA O MODAL DE FALE CONOSCO
function setupFeedbackModal() {
    const modalFaleConosco = document.getElementById("modalFaleConosco");
    const btnFaleConosco = document.getElementById("btnFaleConosco");
    const spanCloseFeedback = modalFaleConosco.querySelector(".close");
    
    btnFaleConosco.addEventListener("click", function() {
        modalFaleConosco.style.display = "block";
        setTimeout(() => {
            modalFaleConosco.classList.add('show');
        }, 10);
    });
    
    spanCloseFeedback.addEventListener("click", function() {
        modalFaleConosco.classList.remove('show');
        setTimeout(() => {
            modalFaleConosco.style.display = "none";
        }, 300);
    });
    
    window.addEventListener("click", function(event) {
        if (event.target == modalFaleConosco) {
            modalFaleConosco.classList.remove('show');
            setTimeout(() => {
                modalFaleConosco.style.display = "none";
            }, 300);
        }
    });
}

// CARREGA DADOS DO CATÁLOGO E EXIBE O FILME SELECIONADO
async function loadFilmData() {
    try {
        // Obtém o ID do filme da URL
        const urlParams = new URLSearchParams(window.location.search);
        const filmTitle = urlParams.get('titulo');
        
        if (!filmTitle) {
            throw new Error('Nenhum filme especificado');
        }
        
        // Carrega o catálogo
        const response = await fetch('catalogo.json');
        if (!response.ok) throw new Error('Erro ao carregar o arquivo');
        
        const data = await response.json();
        allFilms = data.map(transformFilmData);
        
        // Encontra o filme pelo título
        currentFilm = allFilms.find(film => 
            film.title.toLowerCase() === decodeURIComponent(filmTitle).toLowerCase()
        );
        
        if (!currentFilm) {
            throw new Error('Filme não encontrado');
        }
        
        // Renderiza os detalhes do filme
        renderFilmDetails(currentFilm);
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('filmeContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar os detalhes do filme</p>
                <p>${error.message}</p>
                <a href="index.html" class="btn-voltar">
                    <i class="fas fa-home"></i> Voltar ao catálogo
                </a>
            </div>
        `;
    }
}

// INICIALIZA A PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    loadFilmData();
});
