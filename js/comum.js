// ==========================================
// ARQUIVO COMUM.JS - FUNÇÕES COMPARTILHADAS ENTRE PÁGINAS
// ==========================================

/* ==========================================
   HTML COMUM A TODAS AS PÁGINAS
   ========================================== */

// CONTEÚDO DO CABEÇALHO (INSERIDO VIA JS)
const headerContent = `
    <div class="container">
        <h1><i class="fas fa-film"></i> CATÁLOGO DE DVDs</h1>
        <h3>Filmes Brasileiros do Projeto Um Trem de Cinema do IFMG Sabará</h3>
        LEI Nº 13.006, DE 26 DE JUNHO DE 2014: A exibição de filmes de produção nacional constituirá componente curricular complementar integrado à proposta pedagógica da escola, sendo a sua exibição obrigatória, no mínimo, duas horas por mês.
        <a href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13006.htm" target="_blank" rel="noopener noreferrer">
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

// CONTEÚDO DO RODAPÉ PADRÃO (INSERIDO VIA JS)
const footerContent = `
    <div class="container">
        <p>
            <i class="fas fa-train"></i> UM TREM DE CINEMA IFMG SABARÁ 2019-2021
        </p>
    </div>

    <!-- BOTÃO FALE CONOSCO -->
    <div class="feedback-button">
        <button id="btnFaleConosco">
            <i class="fas fa-comments"></i> Fale Conosco
        </button>
    </div>

    <!-- MODAL FALE CONOSCO -->
    <div id="modalFaleConosco" class="feedback-modal">
        <div class="feedback-modal-content">
            <span class="close">&times;</span>
            <h2>Fale Conosco</h2>
            <div class="form-container">
                <!-- O IFRAME SERÁ INSERIDO DINAMICAMENTE VIA JAVASCRIPT -->
                <div id="formFaleConosco"></div>
            </div>
        </div>
    </div>

    <!-- BOTÃO VOLTAR AO TOPO -->
    <a href="#" class="voltar-topo" id="btnVoltarTopo">
        <i class="fas fa-arrow-up"></i>
    </a>
`;

/* ==========================================
   FUNÇÕES PARA EXPANDIR E RECOLHER SEÇÕES EXPANSÍVEIS (NOVO PADRÃO)
   ========================================== */

// FUNÇÃO PARA EXPANDIR/RECOLHER SEÇÕES EXPANSÍVEIS PADRÃO
function toggleExpansivel(cardId) {
    // OBTÉM O ELEMENTO DO CARD EXPANSÍVEL
    const card = document.getElementById(cardId);
    if (!card) return;

    // OBTÉM O CONTEÚDO E O ÍCONE DO CARD
    const content = card.querySelector('.card-expansivel-content');
    const icon = card.querySelector('.expand-icon');
    const header = card.querySelector('.card-expansivel-header');

    if (!content || !icon || !header) return;

    // ALTERNA A CLASSE ACTIVE NO HEADER E NO CONTENT
    content.classList.toggle('active');
    header.classList.toggle('active');

    // ATUALIZA O DISPLAY DO CONTEÚDO E DO ÍCONE
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

// FUNÇÃO PARA INICIALIZAR TODAS AS SEÇÕES EXPANSÍVEIS FECHADAS
function initExpandableSections() {
    // FECHA TODOS OS CONTEÚDOS INICIALMENTE
    document.querySelectorAll('.card-expansivel-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
        const parent = content.closest('.card-expansivel');
        if (parent) {
            const header = parent.querySelector('.card-expansivel-header');
            if (header) header.classList.remove('active');
            const icon = parent.querySelector('.expand-icon');
            if (icon) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        }
    });
}

/* ==========================================
   FUNÇÕES DE INICIALIZAÇÃO DE CABEÇALHO E RODAPÉ
   ========================================== */

// FUNÇÃO PARA CARREGAR O CABEÇALHO
function carregarCabecalho() {
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = headerContent;
    }
}

// FUNÇÃO PARA CARREGAR O RODAPÉ
function carregarRodape() {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = footerContent;
    }
}

/* ==========================================
   MODAL FALE CONOSCO - GOOGLE FORMS DINÂMICO
   ========================================== */

// FUNÇÃO PARA INSERIR O IFRAME DO GOOGLE FORMS QUANDO O MODAL É ABERTO
function carregarFormularioFaleConosco() {
    const container = document.getElementById('formFaleConosco');
    if (container) {
        container.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = 'https://docs.google.com/forms/d/e/1FAIpQLSfaMr7-ermLAAO8S8zDk0WMcPrVX34mF2xhTrHiC1Z53GbIFQ/viewform?usp=sf_link';
        iframe.setAttribute('title', 'Formulário de Contato');
        iframe.setAttribute('aria-label', 'Formulário de Contato');
        container.appendChild(iframe);
    }
}

// FUNÇÃO PARA REMOVER O IFRAME AO FECHAR O MODAL
function limparFormularioFaleConosco() {
    const container = document.getElementById('formFaleConosco');
    if (container) {
        container.innerHTML = '';
    }
}

// FUNÇÃO PARA CONTROLAR O MODAL FALE CONOSCO
function controlarModalFaleConosco() {
    const modal = document.getElementById('modalFaleConosco');
    const btn = document.getElementById('btnFaleConosco');
    const span = modal ? modal.querySelector('.close') : null;

    if (btn && modal && span) {
        // ABRIR O MODAL E INSERIR O FORMULÁRIO
        btn.onclick = function () {
            modal.style.display = "block";
            carregarFormularioFaleConosco();
        };

        // FECHAR MODAL CLICANDO NO X E LIMPAR FORMULÁRIO
        span.onclick = function () {
            modal.style.display = "none";
            limparFormularioFaleConosco();
        };

        // FECHAR O MODAL AO CLICAR FORA DO CONTEÚDO E LIMPAR FORMULÁRIO
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
                limparFormularioFaleConosco();
            }
        });
    }
}

/* ==========================================
   FUNÇÃO PARA CONTROLAR BOTÃO VOLTAR AO TOPO
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
   INICIALIZAÇÃO QUANDO O DOM ESTIVER CARREGADO
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    // CARREGA OS ELEMENTOS COMUNS
    carregarCabecalho();
    carregarRodape();
    // INICIALIZA OS CONTROLES
    controlarModalFaleConosco();
    window.addEventListener('scroll', controlarBotaoVoltarTopo);
    // INICIALIZA AS SEÇÕES EXPANSÍVEIS FECHADAS
    initExpandableSections();
});

// EXPORTA AS FUNÇÕES PARA USO GLOBAL
window.toggleExpansivel = toggleExpansivel;
