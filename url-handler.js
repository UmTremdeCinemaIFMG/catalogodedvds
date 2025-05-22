// Arquivo para gerenciar URLs amigáveis
// Este script deve ser incluído antes do filme.js

// Função para extrair parâmetros da URL
function getUrlParams() {
    // Verifica se há um hash na URL (formato #titulo=nome-do-filme)
    if (window.location.hash && window.location.hash.includes('=')) {
        const hashParams = {};
        const hash = window.location.hash.substring(1); // Remove o # inicial
        const pairs = hash.split('&');
        
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key && value) {
                hashParams[key] = decodeURIComponent(value);
            }
        }
        
        return hashParams;
    }
    
    // Verifica se há parâmetros na query string (formato ?titulo=nome-do-filme)
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    
    // Verifica se estamos em um formato de URL amigável (filme/nome-do-filme)
    if (!params.titulo && window.location.pathname.includes('/filme/')) {
        const pathParts = window.location.pathname.split('/');
        const filmePart = pathParts[pathParts.indexOf('filme') + 1];
        
        if (filmePart) {
            params.titulo = decodeURIComponent(filmePart);
        }
    }
    
    return params;
}

// Função para gerar URL amigável
function generateFriendlyUrl(title) {
    if (!title) return '';
    
    // Normaliza o título (remove acentos, converte para minúsculas, substitui espaços por hífens)
    const normalizedTitle = title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    return `filme/${normalizedTitle}`;
}

// Função para redirecionar para URL amigável se necessário
function redirectToFriendlyUrl() {
    const params = getUrlParams();
    
    // Se estamos na página de filme e usando o formato antigo (?titulo=)
    if (params.titulo && window.location.search.includes('?titulo=')) {
        const friendlyUrl = generateFriendlyUrl(params.titulo);
        
        // Redireciona para a URL amigável
        if (friendlyUrl) {
            // Preserva o histórico de navegação
            window.history.replaceState(null, document.title, friendlyUrl);
        }
    }
}

// Executa o redirecionamento quando a página carregar
document.addEventListener('DOMContentLoaded', redirectToFriendlyUrl);
