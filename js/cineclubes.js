document.addEventListener("DOMContentLoaded", function() {
   


// FUNÇÃO QUE MOSTRA/ESCONDE O CONTEÚDO DE UMA SEÇÃO AO CLICAR NO CABEÇALHO
function toggleCapitulo(id) {
    // OBTÉM O ELEMENTO DA SEÇÃO PELO ID
    const capitulo = document.getElementById(id);
    // OBTÉM O CABEÇALHO DA SEÇÃO
    const header = capitulo.querySelector('.capitulo-header');
    // OBTÉM O CONTEÚDO DA SEÇÃO
    const content = capitulo.querySelector('.capitulo-content');
    // ALTERNA A CLASSE 'active' PARA MOSTRAR/ESCONDER O CONTEÚDO
    header.classList.toggle('active');
    content.classList.toggle('active');
}

