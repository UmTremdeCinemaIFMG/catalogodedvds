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

// CONTEÚDO DO RODAPÉ PADRÃO
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
cnc-features

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
    // O CONTAINER ONDE O IFRAME SERÁ INSERIDO
    const container = document.getElementById('formFaleConosco');
    if (container) {        
        container.innerHTML = '';   // LIMPA QUALQUER CONTEÚDO ANTERIOR       
        const iframe = document.createElement('iframe');     // CRIA O IFRAME        
        iframe.src = 'https://docs.google.com/forms/d/e/1FAIpQLSfaMr7-ermLAAO8S8zDk0WMcPrVX34mF2xhTrHiC1Z53GbIFQ/viewform?usp=sf_link';    // DEFINA AQUI A URL DO FORMULÁRIO GOOGLE FORMS
        iframe.setAttribute('title', 'Formulário de Contato');    // DEIXE O TAMANHO PARA O CSS CONTROLAR (SEM WIDTH/HEIGHT INLINE)
        iframe.setAttribute('aria-label', 'Formulário de Contato');       
        container.appendChild(iframe);        // ADICIONA O IFRAME AO CONTAINER
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
     
    // INICIALIZA AS SEÇÕES EXPANSÍVEIS
    initExpandableSections();
});

// EXPORTA AS FUNÇÕES PARA USO GLOBAL
window.toggleCapitulo = toggleCapitulo;
