// Garante que o código só execute após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    setupEventListeners();
    loadCatalogData();
});

// Função de inicialização dos event listeners
function setupEventListeners() {
    // Event listener para busca
    document.getElementById('searchInput').addEventListener('input', filterAndRenderFilms);
    
    // Event listener para ordenação
    document.getElementById('sortSelect').addEventListener('change', filterAndRenderFilms);
    
    // Event listener para fechar modal
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Event listener para clicar fora do modal
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('filmModal')) {
            closeModal();
        }
    });
    
    // Event listener para o rodapé
    document.querySelector('footer').addEventListener('click', function() {
        window.location.href = 'https://umtremdecinema.wixsite.com/umtremdecinema';
    });
}

// Funções para o modal
function openModal(film) {
    const modal = document.getElementById('filmModal');
    const modalContent = document.getElementById('modalContent');
    
    // ... resto do código do modal ...
    
    // Adicionar evento de teclado para fechar com ESC
    document.addEventListener('keydown', handleKeyDown);
}

function closeModal() {
    const modal = document.getElementById('filmModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    // Remover evento de teclado
    document.removeEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// Funções de reset
function resetFilters() {
    document.getElementById('searchInput').value = '';
    selectedGenre = '';
    
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.dataset.genre === '') {
            tag.classList.add('active');
        }
    });
    
    filterAndRenderFilms();
    updateFilmsCounter();
}
