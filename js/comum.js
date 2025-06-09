// ARQUIVO COMUM.JS - FUNÇÕES COMPARTILHADAS ENTRE PÁGINAS
// CRIADO PARA CENTRALIZAR FUNCIONALIDADES DE EXPANDIR/RECOLHER E BOTÕES

// FUNÇÃO PARA EXPANDIR/RECOLHER SEÇÕES
function toggleExpandableSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const content = section.querySelector('.expandable-content');
    const icon = section.querySelector('.expand-icon');
    
    if (!content || !icon) return;
    
    // ALTERNA A VISIBILIDADE DO CONTEÚDO
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        section.classList.add('expanded');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
        section.classList.remove('expanded');
    }
}

// FUNÇÃO PARA ABRIR CAPÍTULO ESPECÍFICO (COMPATIBILIDADE COM FACA-SEU-FILME)
function abrirCapitulo(capituloId) {
    toggleExpandableSection(capituloId);
    
    // ROLA PARA O CAPÍTULO
    const elemento = document.getElementById(capituloId);
    if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth' });
    }
}

// FUNÇÃO PARA INICIALIZAR OS EVENT LISTENERS DAS SEÇÕES EXPANSÍVEIS
function initExpandableSections() {
    // ADICIONA CLICK LISTENERS PARA TODOS OS TÍTULOS EXPANSÍVEIS
    const expandableTitles = document.querySelectorAll('.expandable-title');
    
    expandableTitles.forEach(title => {
        title.addEventListener('click', function() {
            const section = this.closest('.expandable-section');
            if (section && section.id) {
                toggleExpandableSection(section.id);
            }
        });
        
        // ADICIONA CURSOR POINTER PARA INDICAR QUE É CLICÁVEL
        title.style.cursor = 'pointer';
    });
    
    // INICIALIZA TODAS AS SEÇÕES COMO FECHADAS
    const expandableContents = document.querySelectorAll('.expandable-content');
    expandableContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // ADICIONA CLICK LISTENERS PARA ETAPAS (COMPATIBILIDADE COM FACA-SEU-FILME)
    const etapas = document.querySelectorAll('.etapa[data-target]');
    etapas.forEach(etapa => {
        etapa.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target) {
                abrirCapitulo(target);
            }
        });
        
        etapa.style.cursor = 'pointer';
    });
}

// FUNÇÃO PARA INICIALIZAR O MODAL "FALE CONOSCO"
function initFaleConoscoModal() {
    const btnFaleConosco = document.getElementById('btnFaleConosco');
    const modal = document.getElementById('modalFaleConosco');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    
    if (!btnFaleConosco || !modal) return;
    
    // ABRE O MODAL
    btnFaleConosco.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // IMPEDE SCROLL DA PÁGINA
    });
    
    // FECHA O MODAL
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // RESTAURA SCROLL DA PÁGINA
        });
    }
    
    // FECHA O MODAL CLICANDO FORA DELE
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// FUNÇÃO PARA INICIALIZAR O BOTÃO "VOLTAR AO TOPO"
function initVoltarAoTopo() {
    const btnVoltarTopo = document.getElementById('btnVoltarTopo');
    
    if (!btnVoltarTopo) return;
    
    // MOSTRA/ESCONDE O BOTÃO BASEADO NO SCROLL
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            btnVoltarTopo.style.display = 'block';
            btnVoltarTopo.style.opacity = '1';
        } else {
            btnVoltarTopo.style.opacity = '0';
            setTimeout(() => {
                if (window.pageYOffset <= 300) {
                    btnVoltarTopo.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // AÇÃO DO CLIQUE - VOLTA AO TOPO
    btnVoltarTopo.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // INICIALIZA COMO OCULTO
    btnVoltarTopo.style.display = 'none';
    btnVoltarTopo.style.opacity = '0';
    btnVoltarTopo.style.transition = 'opacity 0.3s ease';
}

// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
function initCommonFunctions() {
    // AGUARDA O DOM ESTAR COMPLETAMENTE CARREGADO
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initExpandableSections();
            initFaleConoscoModal();
            initVoltarAoTopo();
        });
    } else {
        // DOM JÁ ESTÁ CARREGADO
        initExpandableSections();
        initFaleConoscoModal();
        initVoltarAoTopo();
    }
}

// INICIALIZA AS FUNÇÕES COMUNS
initCommonFunctions();

// EXPORTA FUNÇÕES PARA USO GLOBAL (COMPATIBILIDADE)
window.toggleExpandableSection = toggleExpandableSection;
window.abrirCapitulo = abrirCapitulo;
window.initExpandableSections = initExpandableSections;
window.initFaleConoscoModal = initFaleConoscoModal;
window.initVoltarAoTopo = initVoltarAoTopo;

