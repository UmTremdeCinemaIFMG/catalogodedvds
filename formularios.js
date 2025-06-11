// ARQUIVO: js/formularios.js

// OBJETO PARA ARMAZENAR AS URLs DOS FORMULÁRIOS
const FORMULARIOS = {
    FALE_CONOSCO: "https://docs.google.com/forms/d/e/1FAIpQLSfaMr7-ermLAAO8S8zDk0WMcPrVX34mF2xhTrHiC1Z53GbIFQ/viewform",
    PLANO_AULA: "https://docs.google.com/forms/d/e/1FAIpQLSdxQz8onMOFjxIqEPpo5v2I4CJdLQ9cN50I7zUhmnBwgUeGIQ/viewform"
};

// CLASSE PARA GERENCIAR OS FORMULÁRIOS
class GerenciadorFormularios {
    constructor() {
        // ARMAZENA O ÚLTIMO TEMPO DE SUBMISSÃO PARA CONTROLE DE SPAM
        this.ultimaSubmissao = {
            faleConosco: 0,
            planoAula: 0
        };
        
        // TEMPO MÍNIMO ENTRE SUBMISSÕES (5 MINUTOS)
        this.TEMPO_MINIMO_ENTRE_SUBMISSOES = 5 * 60 * 1000;
    }

    // MÉTODO PARA CARREGAR O FORMULÁRIO FALE CONOSCO
    carregarFormularioFaleConosco() {
        const iframe = document.getElementById('formFaleConosco');
        if (iframe) {
            iframe.src = FORMULARIOS.FALE_CONOSCO;
            this.adicionarEventosFormulario(iframe, 'faleConosco');
        }
    }

    // MÉTODO PARA CARREGAR O FORMULÁRIO DE PLANO DE AULA
    carregarFormularioPlanoAula(tituloFilme) {
        // ADICIONA O TÍTULO DO FILME COMO PARÂMETRO NA URL
        const urlComTitulo = `${FORMULARIOS.PLANO_AULA}?entry.filmeTitulo=${encodeURIComponent(tituloFilme)}`;
        return urlComTitulo;
    }

    // MÉTODO PARA ADICIONAR EVENTOS AOS FORMULÁRIOS
    adicionarEventosFormulario(iframe, tipo) {
        // ADICIONA LISTENER PARA MENSAGENS DO IFRAME
        window.addEventListener('message', (event) => {
            // VERIFICA SE A MENSAGEM VEM DO GOOGLE FORMS
            if (event.origin === 'https://docs.google.com') {
                this.tratarSubmissaoFormulario(tipo);
            }
        });
    }

    // MÉTODO PARA TRATAR SUBMISSÃO DO FORMULÁRIO
    tratarSubmissaoFormulario(tipo) {
        const tempoAtual = Date.now();
        
        // VERIFICA SE JÁ PASSOU O TEMPO MÍNIMO DESDE A ÚLTIMA SUBMISSÃO
        if (tempoAtual - this.ultimaSubmissao[tipo] < this.TEMPO_MINIMO_ENTRE_SUBMISSOES) {
            alert('Por favor, aguarde alguns minutos antes de enviar outro formulário.');
            return false;
        }

        // ATUALIZA O TEMPO DA ÚLTIMA SUBMISSÃO
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