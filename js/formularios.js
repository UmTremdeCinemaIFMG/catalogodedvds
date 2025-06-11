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
        try {
            const container = document.getElementById('formFaleConosco');
            if (!container) {
                throw new Error('CONTAINER DO FORMULÁRIO NÃO ENCONTRADO');
            }

            // ADICIONA MENSAGEM DE CARREGAMENTO
            container.innerHTML = '<div class="loading">Carregando formulário...</div>';

            // CRIA O IFRAME
            const iframe = document.createElement('iframe');
            iframe.src = FORMULARIOS.FALE_CONOSCO;
            iframe.frameBorder = "0";
            iframe.style.width = "100%";
            iframe.style.height = "500px";

            // REMOVE LOADING QUANDO CARREGAR
            iframe.onload = () => {
                container.querySelector('.loading')?.remove();
            };

            // ADICIONA O IFRAME AO CONTAINER
            container.appendChild(iframe);
            
            // ADICIONA EVENTOS DO FORMULÁRIO
            this.adicionarEventosFormulario(iframe, 'faleConosco');
        } catch (erro) {
            console.error('ERRO AO CARREGAR FORMULÁRIO:', erro);
            alert('Não foi possível carregar o formulário. Tente novamente mais tarde.');
        }
    }

    // MÉTODO PARA CARREGAR O FORMULÁRIO DE PLANO DE AULA
    carregarFormularioPlanoAula(tituloFilme) {
        if (!tituloFilme) {
            console.error('TÍTULO DO FILME NÃO FORNECIDO');
            return FORMULARIOS.PLANO_AULA;
        }
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
        const tempoRestante = this.calcularTempoRestante(tipo);
        
        if (tempoRestante > 0) {
            const minutos = Math.ceil(tempoRestante / this.MINUTO);
            alert(`Por favor, aguarde ${minutos} minutos antes de enviar outro formulário.`);
            return false;
        }

        this.ultimaSubmissao[tipo] = Date.now();
        return true;
    }

    // MÉTODO PARA CALCULAR TEMPO RESTANTE
    calcularTempoRestante(tipo) {
        const tempoPassado = Date.now() - this.ultimaSubmissao[tipo];
        return Math.max(0, this.TEMPO_ESPERA - tempoPassado);
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
            // LIMPA O CONTAINER DO FORMULÁRIO
            const container = document.getElementById('formFaleConosco');
            if (container) {
                container.innerHTML = '';
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
