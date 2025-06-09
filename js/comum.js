// ARQUIVO COMUM.JS - FUNÇÕES COMPARTILHADAS ENTRE PÁGINAS

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
