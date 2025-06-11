// ARQUIVO: js/formularios.js

// OBJETO PARA ARMAZENAR AS URLs DOS FORMULÁRIOS
const FORMULARIOS = {
    FALE_CONOSCO: "https://docs.google.com/forms/d/e/1FAIpQLSfaMr7-ermLAAO8S8zDk0WMcPrVX34mF2xhTrHiC1Z53GbIFQ/viewform",
    PLANO_AULA: "https://docs.google.com/forms/d/e/1FAIpQLSdxQz8onMOFjxIqEPpo5v2I4CJdLQ9cN50I7zUhmnBwgUeGIQ/viewform"
};

// CLASSE PARA GERENCIAR OS FORMULÁRIOS
class GerenciadorFormularios {
    constructor() {
        // DEFINIÇÕES DE TEMPO
        this.MINUTO = 60 * 1000;
        this.TEMPO_ESPERA = 5 * this.MINUTO;  // 5 MINUTOS
        
        // ARMAZENA O ÚLTIMO TEMPO DE SUBMISSÃO
        this.ultimaSubmissao = {
            faleConosco: 0,
            planoAula: 0
        };
    }

    // MÉTODO PARA CARREGAR O FORMULÁRIO FALE CONOSCO
    carregarFormularioFaleConosco() {
        // PEGA O IFRAME JÁ EXISTENTE NO DOM
        const iframe = document.getElementById('formFaleConosco');
        if (iframe) {
            // APENAS DEFINE A URL DO FORMULÁRIO
            iframe.src = FORMULARIOS.FALE_CONOSCO;
            // ADICIONA EVENTOS DO FORMULÁRIO
            this.adicionarEventosFormulario(iframe, 'faleConosco');
        }
    }

    // MÉTODO PARA CARREGAR O FORMULÁRIO DE PLANO DE AULA
    carregarFormularioPlanoAula(tituloFilme) {
        if (!tituloFilme) return FORMULARIOS.PLANO_AULA;
        return `${FORMULARIOS.PLANO_AULA}?entry.filmeTitulo=${encodeURIComponent(tituloFilme)}`;
    }

    // MÉTODO PARA ADICIONAR EVENTOS AOS FORMULÁRIOS
    adicionarEventosFormulario(iframe, tipo) {
        window.addEventListener('message', (event) => {
            if (event.origin === 'https://docs.google.com') {
                this.tratarSubmissaoFormulario(tipo);
            }
        });
    }

    // MÉTODO PARA TRATAR SUBMISSÃO DO FORMULÁRIO
    tratarSubmissaoFormulario(tipo) {
        const tempoAtual = Date.now();
        const tempoPassado = tempoAtual - this.ultimaSubmissao[tipo];
        
        if (tempoPassado < this.TEMPO_ESPERA) {
            const minutosRestantes = Math.ceil((this.TEMPO_ESPERA - tempoPassado) / this.MINUTO);
            alert(`Por favor, aguarde ${minutosRestantes} minutos antes de enviar outro formulário.`);
            return false;
        }

        this.ultimaSubmissao[tipo] = tempoAtual;
        return true;
    }

    // MÉTODO PARA ABRIR O MODAL FALE CONOSCO
    abrirModalFaleConosco() {
        const modal = document.getElementById('modalFaleConosco');
        if (modal) {
            modal.style.display = 'block';
            this.carregarFormularioFaleConosco();
        }
    }

    // MÉTODO PARA FECHAR O MODAL FALE CONOSCO
    fecharModalFaleConosco() {
        const modal = document.getElementById('modalFaleConosco');
        if (modal) {
            modal.style.display = 'none';
            // LIMPA O SRC DO IFRAME
            const iframe = document.getElementById('formFaleConosco');
            if (iframe) {
                iframe.src = '';
            }
        }
    }
}

// CRIA UMA INSTÂNCIA DO GERENCIADOR
const gerenciadorFormularios = new GerenciadorFormularios();

// ADICIONA EVENTOS QUANDO O DOM ESTIVER CARREGADO
document.addEventListener('DOMContentLoaded', () => {
    // CONFIGURA O BOTÃO FALE CONOSCO
    const btnFaleConosco = document.getElementById('btnFaleConosco');
    if (btnFaleConosco) {
        btnFaleConosco.addEventListener('click', () => {
            gerenciadorFormularios.abrirModalFaleConosco();
        });
    }

    // CONFIGURA O BOTÃO DE FECHAR O MODAL
    const btnFecharModal = document.querySelector('#modalFaleConosco .close');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
            gerenciadorFormularios.fecharModalFaleConosco();
        });
    }

    // FECHA O MODAL AO CLICAR FORA DELE
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modalFaleConosco');
        if (event.target === modal) {
            gerenciadorFormularios.fecharModalFaleConosco();
        }
    });
});

// EXPORTA O GERENCIADOR PARA USO GLOBAL
window.gerenciadorFormularios = gerenciadorFormularios;
