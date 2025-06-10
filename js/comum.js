// ARQUIVO COMUM.JS - FUNÇÕES COMPARTILHADAS ENTRE PÁGINAS

/* ==========================================
   ARQUIVO PARA GERENCIAR O CABEÇALHO
   COMUM A TODAS AS PÁGINAS
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

// FUNÇÃO PARA CARREGAR O CABEÇALHO
document.addEventListener('DOMContentLoaded', function() {
    // PROCURA O ELEMENTO HEADER NA PÁGINA
    const header = document.querySelector('header');
    
    // SE ENCONTROU O HEADER, INSERE O CONTEÚDO
    if (header) {
        header.innerHTML = headerContent;
    }
});

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

// FUNÇÃO PARA O MODAL FALE CONOSCO
function initFaleConoscoModal() {
    const modal = document.getElementById('modalFaleConosco');
    const btn = document.getElementById('btnFaleConosco');
    const span = document.getElementsByClassName('close')[0];
    
    if (!modal || !btn || !span) return;
    
    btn.onclick = function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    span.onclick = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// FUNÇÃO PARA O BOTÃO VOLTAR AO TOPO
function initVoltarAoTopo() {
    const btnVoltarTopo = document.getElementById('btnVoltarTopo');
    
    if (!btnVoltarTopo) return;
    
    window.onscroll = function() {
        if (window.pageYOffset > 300) {
            btnVoltarTopo.style.display = 'flex';
            btnVoltarTopo.style.opacity = '1';
        } else {
            btnVoltarTopo.style.opacity = '0';
            setTimeout(() => {
                if (window.pageYOffset <= 300) {
                    btnVoltarTopo.style.display = 'none';
                }
            }, 300);
        }
    };
    
    btnVoltarTopo.onclick = function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    btnVoltarTopo.style.display = 'none';
    btnVoltarTopo.style.opacity = '0';
}

// EXPORTA AS FUNÇÕES PARA USO GLOBAL
window.toggleCapitulo = toggleCapitulo;
window.initExpandableSections = initExpandableSections;
window.initFaleConoscoModal = initFaleConoscoModal;
window.initVoltarAoTopo = initVoltarAoTopo;
