// ARQUIVO COMUM.JS - FUNÇÕES COMPARTILHADAS ENTRE PÁGINAS

/* ==========================================
   HTML COMUM A TODAS AS PÁGINAS
   ========================================== */

// CONTEÚDO DO CABEÇALHO
const headerContent = `
    <div class="container">
        <h1><i class="fas fa-film"></i> CATÁLOGO DE DVDs</h1>
        <h3>Filmes Brasileiros do Projeto Um Trem de Cinema do IFMG Sabará</h3>
        LEI Nº 13.006, DE 26 DE JUNHO DE 2014: A exibição de filmes de produção nacional constituirá componente curricular complementar integrado à proposta pedagógica da escola, sendo a sua exibição obrigatória por, no mínimo, 2 (duas) horas mensais.
        <a href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13006.htm" target="_blank">
            Saiba mais
        </a>
    </div>

    <!-- BARRA DE NAVEGAÇÃO -->
    <div class="barra-extra">
        <div class="container">
            <a href="index.html">Início</a>
            <a href="sobre.html">Sobre</a>
            <a href="filmes-online-gratis.html">Filmes Online Grátis</a>
            <a href="mapa.html">Mapa</a>
            <a href="faca-seu-filme.html">Faça seu Filme</a>
            <a href="cineclubes.html">Cineclubes</a>
        </div>
    </div>
`;

// BOTÃO VOLTAR AO TOPO - HTML
const BTN_VOLTAR_TOPO = `
    <a href="#" id="btnVoltarTopo" class="btn-voltar-topo">
        <i class="fas fa-arrow-up"></i>
    </a>
`;

// BOTÃO FALE CONOSCO E MODAL - HTML
const BTN_FALE_CONOSCO = `
    <!-- BOTÃO FIXO -->
    <button id="btnFaleConosco" class="btn-fale-conosco">
        <i class="fas fa-comments"></i> Fale Conosco
    </button>

    <!-- MODAL -->
    <div id="modalFaleConosco" class="modal-fale-conosco">
        <div class="modal-conteudo">
            <span class="fechar">&times;</span>
            <h2>Fale Conosco</h2>
            <iframe 
                src="https://docs.google.com/forms/d/e/SUA_URL_DO_FORM/viewform"
                width="100%" 
                height="500px">
                Carregando...
            </iframe>
        </div>
    </div>
`;

// CONTEÚDO DO RODAPÉ PADRÃO
const footerContent = `
    <div class="container">
        <p>                
            <i class="fas fa-train"></i> UM TREM DE CINEMA IFMG SABARÁ 2019-2021
        </p>
    </div>
`;

/* ==========================================
   FUNÇÕES COMUNS PARA TODAS AS PÁGINAS
   ========================================== */

// FUNÇÃO PARA CARREGAR O CABEÇALHO
document.addEventListener('DOMContentLoaded', function() {
    // PROCURA O ELEMENTO HEADER NA PÁGINA
    const header = document.querySelector('header');
    
    // SE ENCONTROU O HEADER, INSERE O CONTEÚDO
    if (header) {
        header.innerHTML = headerContent;
    }
});

/* ==========================================
   FUNÇÕES PARA EXPANDIR E RECOLHER SEÇÕES
   ========================================== */

// FUNÇÃO PARA EXPANDIR/RECOLHER SEÇÕES
function toggleCapitulo(capituloId) {
    // OBTÉM O ELEMENTO DO CAPÍTULO
    const capitulo = document.getElementById(capituloId);
    if (!capitulo) return;
    
    // OBTÉM O CONTEÚDO E O ÍCONE DO CAPÍTULO
    const content = capitulo.querySelector('.capitulo-content');
    const icon = capitulo.querySelector('.expand-icon');
    const header = capitulo.querySelector('.capitulo-header');
    
    if (!content || !icon || !header) return;
    
    // ALTERNA A CLASSE ACTIVE NO HEADER E NO CONTENT
    content.classList.toggle('active');
    header.classList.toggle('active');
    
    // ATUALIZA O DISPLAY DO CONTEÚDO
    if (content.classList.contains('active')) {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// FUNÇÃO PARA INICIALIZAR OS EVENT LISTENERS
function initExpandableSections() {
    // FECHA TODOS OS CAPÍTULOS INICIALMENTE
    document.querySelectorAll('.capitulo-content').forEach(content => {
        content.style.display = 'none';
    });
}

// INICIALIZA QUANDO O DOM ESTIVER CARREGADO
document.addEventListener('DOMContentLoaded', function() {
    initExpandableSections();
    initFaleConoscoModal();
    initVoltarAoTopo();
});

/* ==========================================
   FUNÇÃO PARA CARREGAR O RODAPÉ E BOTÕES
   ========================================== */
function carregarRodape() {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = footerContent;
    }
}

/* ==========================================
   FUNÇÃO PARA CONTROLAR O BOTÃO DE VOLTAR AO TOPO
   ========================================== */
function controlarBotaoVoltarTopo() {
    const btnVoltarTopo = document.getElementById('btnVoltarTopo');
    if (btnVoltarTopo) {
        if (window.scrollY > 300) {
            btnVoltarTopo.style.display = 'flex';
        } else {
            btnVoltarTopo.style.display = 'none';
        }
    }
}

/* ==========================================
   FUNÇÃO PARA CONTROLAR O MODAL DE FALE CONOSCO
   ========================================== */
function controlarModalFaleConosco() {
    const modal = document.getElementById('modalFaleConosco');
    const btn = document.getElementById('btnFaleConosco');
    const span = document.getElementsByClassName('close')[0];

    if (btn && modal && span) {
        // ABRE O MODAL
        btn.onclick = function() {
            modal.style.display = "block";
        }

        // FECHA O MODAL NO X
        span.onclick = function() {
            modal.style.display = "none";
        }

        // FECHA O MODAL CLICANDO FORA
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
}

/* ==========================================
   INICIALIZAÇÃO QUANDO O DOM ESTIVER CARREGADO
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    // CARREGA OS ELEMENTOS COMUNS
    carregarCabecalho();
    carregarRodape();
    
    // INICIALIZA OS CONTROLES
    controlarModalFaleConosco();
    window.addEventListener('scroll', controlarBotaoVoltarTopo);
});

// EXPORTA AS FUNÇÕES PARA USO GLOBAL
window.toggleCapitulo = toggleCapitulo;
window.initExpandableSections = initExpandableSections;
window.initFaleConoscoModal = initFaleConoscoModal;
window.initVoltarAoTopo = initVoltarAoTopo;
