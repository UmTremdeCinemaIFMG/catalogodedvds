document.addEventListener("DOMContentLoaded", function() {
   /* const collapsibleHeaders = document.querySelectorAll(".collapsible-header");

    collapsibleHeaders.forEach(header => {
        header.addEventListener("click", function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector(".toggle-icon");

            this.classList.toggle("active");
            content.classList.toggle("active");

            if (icon.classList.contains("fa-chevron-down")) {
                icon.classList.remove("fa-chevron-down");
                icon.classList.add("fa-chevron-up");
            } else {
                icon.classList.remove("fa-chevron-up");
                icon.classList.add("fa-chevron-down");
            }
        });
    });  */

 /*    // MODAL DE FALE CONOSCO (se houver)
    const btnFaleConosco = document.getElementById("btnFaleConoscoCineclubes");
    const modalFaleConosco = document.getElementById("modalFaleConosco");
    const closeFaleConosco = modalFaleConosco ? modalFaleConosco.querySelector(".close") : null;

    if (btnFaleConosco) {
        btnFaleConosco.addEventListener("click", function(event) {
            event.preventDefault();
            if (modalFaleConosco) {
                modalFaleConosco.style.display = "block";
            }
        });
    }

    if (closeFaleConosco) {
        closeFaleConosco.addEventListener("click", function() {
            if (modalFaleConosco) {
                modalFaleConosco.style.display = "none";
            }
        });
    }

    window.addEventListener("click", function(event) {
        if (modalFaleConosco && event.target == modalFaleConosco) {
            modalFaleConosco.style.display = "none";
        }
    });

      // BOTÃO VOLTAR AO TOPO (se houver)
    const btnVoltarTopo = document.getElementById("btnVoltarTopo");

    window.addEventListener("scroll", function() {
        if (btnVoltarTopo) {
            if (window.scrollY > 200) { // Mostra o botão após rolar 200px
                btnVoltarTopo.style.display = "block";
            } else {
                btnVoltarTopo.style.display = "none";
            }
        }
    });

    if (btnVoltarTopo) {
        btnVoltarTopo.addEventListener("click", function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});   */


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

