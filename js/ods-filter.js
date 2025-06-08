// Lista dos ODS disponíveis
const odsList = [
    { id: 1, name: "Erradicação da Pobreza" },
    { id: 2, name: "Fome Zero" },
    { id: 3, name: "Boa Saúde e Bem-Estar" },
    { id: 4, name: "Educação de Qualidade" },
    { id: 5, name: "Igualdade de Gênero" },
    { id: 6, name: "Água Limpa e Saneamento" },
    { id: 7, name: "Energia Acessível e Limpa" },
    { id: 8, name: "Trabalho Decente e Crescimento Econômico" },
    { id: 9, name: "Indústria, Inovação e Infraestrutura" },
    { id: 10, name: "Redução das Desigualdades" },
    { id: 11, name: "Cidades e Comunidades Sustentáveis" },
    { id: 12, name: "Consumo e Produção Responsáveis" },
    { id: 13, name: "Ação Contra a Mudança Global do Clima" },
    { id: 14, name: "Vida na Água" },
    { id: 15, name: "Vida Terrestre" },
    { id: 16, name: "Paz, Justiça e Instituições Eficazes" },
    { id: 17, name: "Parcerias e Meios de Implementação" }
];

// Estado do filtro
let selectedODS = new Set();
let odsDropdownVisible = false;

// Elementos DOM
const odsButton = document.getElementById('odsButton');
const odsDropdown = document.getElementById('odsDropdown');
const odsCounter = document.getElementById('odsCounter');
const odsClear = document.getElementById('odsClear');
const odsApply = document.getElementById('odsApply');

// Inicializa o grid de ODS
function initializeODSGrid() {
    const grid = document.querySelector('.ods-grid');
    
    odsList.forEach(ods => {
        const icon = document.createElement('div');
        icon.className = 'ods-icon';
        icon.dataset.ods = ods.id;
        icon.title = `ODS ${ods.id}: ${ods.name}`;
        
        icon.innerHTML = `
            <img src="https://brasil.un.org/sites/default/files/styles/large/public/2020-09/E-WEB-Goal-${ods.id}.png" 
                 alt="ODS ${ods.id}" 
                 loading="lazy">
        `;
        
        icon.addEventListener('click', () => toggleODS(ods.id, icon));
        grid.appendChild(icon);
    });
}

// Toggle seleção de ODS
function toggleODS(id, element) {
    if (selectedODS.has(id)) {
        selectedODS.delete(id);
        element.classList.remove('selected');
    } else {
        selectedODS.add(id);
        element.classList.add('selected');
    }
    
    updateCounter();
}

// Atualiza o contador de ODS selecionados
function updateCounter() {
    const count = selectedODS.size;
    odsCounter.textContent = count > 0 ? count : '';
}

// Toggle visibilidade do dropdown
function toggleDropdown() {
    odsDropdownVisible = !odsDropdownVisible;
    odsDropdown.classList.toggle('active', odsDropdownVisible);
}

// Limpa seleções
function clearSelection() {
    selectedODS.clear();
    document.querySelectorAll('.ods-icon').forEach(icon => {
        icon.classList.remove('selected');
    });
    updateCounter();
}

// Aplica o filtro
function applyFilter() {
    // Atualiza a URL com os ODS selecionados
    const params = new URLSearchParams(window.location.search);
    if (selectedODS.size > 0) {
        params.set('ods', Array.from(selectedODS).join(','));
    } else {
        params.delete('ods');
    }
    
    // Atualiza a URL e recarrega os filmes
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.pushState({}, '', newUrl);
    
    // Fecha o dropdown
    toggleDropdown();
    
    // Recarrega os filmes (função que você já deve ter implementado)
    loadFilms();
}

// Inicializa os eventos
function initializeODSFilter() {
    initializeODSGrid();
    
    // Event listeners
    odsButton.addEventListener('click', toggleDropdown);
    odsClear.addEventListener('click', clearSelection);
    odsApply.addEventListener('click', applyFilter);
    
    // Fecha o dropdown quando clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ods-filter') && odsDropdownVisible) {
            toggleDropdown();
        }
    });
    
    // Carrega seleções da URL
    const params = new URLSearchParams(window.location.search);
    const odsParam = params.get('ods');
    if (odsParam) {
        const odsIds = odsParam.split(',').map(Number);
        odsIds.forEach(id => {
            const icon = document.querySelector(`.ods-icon[data-ods="${id}"]`);
            if (icon) {
                selectedODS.add(id);
                icon.classList.add('selected');
            }
        });
        updateCounter();
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeODSFilter);
