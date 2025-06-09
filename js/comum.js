// ===========================
// SCRIPT DE FUNÇÕES COMUNS PARA O SITE
// ===========================

// FUNÇÃO PARA CONFIGURAR CONTEÚDO EXPANSÍVEL (SEÇÕES EXPANDÍVEIS/RECOLHÍVEIS)
// ESTA VERSÃO USA ACESSIBILIDADE E SÓ PERMITE UMA SEÇÃO ABERTA POR VEZ
function setupExpandableContent() {
    // SELECIONA TODOS OS TÍTULOS EXPANDÍVEIS
    const expandableTitles = document.querySelectorAll(".expandable-title");

    expandableTitles.forEach(clickedTitle => {
        // CONFIGURA ATRIBUTOS ARIA PARA ACESSIBILIDADE
        const initialContent = clickedTitle.nextElementSibling;
        if (initialContent) {
            clickedTitle.setAttribute("aria-expanded", "false");
            initialContent.setAttribute("aria-hidden", "true");
            clickedTitle.setAttribute("role", "button");
            clickedTitle.setAttribute("tabindex", "0");
            // PERMITE EXPANDIR/RECOLHER USANDO ENTER OU ESPAÇO NO TECLADO
            clickedTitle.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    clickedTitle.click();
                }
            });
        }

        // EVENTO DE CLIQUE PARA EXPANDIR OU RECOLHER
        clickedTitle.addEventListener("click", () => {
            const clickedSection = clickedTitle.closest(".expandable-section");
            const clickedContent = clickedTitle.nextElementSibling;
            const clickedIcon = clickedTitle.querySelector(".expand-icon");

            if (!clickedContent || !clickedSection || !clickedIcon) return; // EVITA ERROS

            const isCurrentlyOpen = clickedSection.classList.contains("open");

            // RECOLHE TODAS AS OUTRAS SEÇÕES ANTES DE EXPANDIR A CLICADA
            expandableTitles.forEach(otherTitle => {
                const otherSection = otherTitle.closest(".expandable-section");
                const otherContent = otherTitle.nextElementSibling;
                const otherIcon = otherTitle.querySelector(".expand-icon");
                if (otherSection && otherContent && otherIcon && otherSection !== clickedSection && otherSection.classList.contains("open")) {
                    otherSection.classList.remove("open");
                    otherIcon.classList.remove("fa-chevron-up");
                    otherIcon.classList.add("fa-chevron-down");
                    otherTitle.setAttribute("aria-expanded", "false");
                    otherContent.setAttribute("aria-hidden", "true");
                }
            });

            // ALTERNAR O ESTADO DA SEÇÃO CLICADA
            if (isCurrentlyOpen) {
                // ESTAVA ABERTA, AGORA VAI RECOLHER
                clickedSection.classList.remove("open");
                clickedIcon.classList.remove("fa-chevron-up");
                clickedIcon.classList.add("fa-chevron-down");
                clickedTitle.setAttribute("aria-expanded", "false");
                clickedContent.setAttribute("aria-hidden", "true");
            } else {
                // ESTAVA FECHADA, AGORA VAI EXPANDIR
                clickedSection.classList.add("open");
                clickedIcon.classList.remove("fa-chevron-down");
                clickedIcon.classList.add("fa-chevron-up");
                clickedTitle.setAttribute("aria-expanded", "true");
                clickedContent.setAttribute("aria-hidden", "false");
            }
        });
    });
}

// FUNÇÃO UNIVERSAL PARA ATIVAR MODAL "FALE CONOSCO"
// FUNCIONA PARA QUALQUER MODAL COM ID "modalFaleConosco" E BOTÃO COM ID "btnFaleConosco" (OU VARIAÇÃO)
function setupFaleConoscoModal(btnId = "btnFaleConosco", modalId = "modalFaleConosco") {
    // OBTÉM OS ELEMENTOS DO MODAL E BOTÃO
    const btnFaleConosco = document.getElementById(btnId);
    const modalFaleConosco = document.getElementById(modalId);
    const closeFaleConosco = modalFaleConosco ? modalFaleConosco.querySelector(".close") : null;

    if (btnFaleConosco && modalFaleConosco) {
        // ABRE O MODAL AO CLICAR NO BOTÃO
        btnFaleConosco.addEventListener("click", function(event) {
            event.preventDefault();
            modalFaleConosco.style.display = "block";
        });
    }
    if (closeFaleConosco && modalFaleConosco) {
        // FECHA O MODAL AO CLICAR NO X
        closeFaleConosco.addEventListener("click", function() {
            modalFaleConosco.style.display = "none";
        });
    }
    // FECHA O MODAL AO CLICAR FORA DELE
    window.addEventListener("click", function(event) {
        if (modalFaleConosco && event.target == modalFaleConosco) {
            modalFaleConosco.style.display = "none";
        }
    });
}

// FUNÇÃO UNIVERSAL PARA BOTÃO "VOLTAR AO TOPO"
// ESPERA UM BOTÃO COM ID "btnVoltarTopo"
function setupVoltarTopoButton(btnId = "btnVoltarTopo") {
    const btnVoltarTopo = document.getElementById(btnId);

    // MOSTRA OU ESCONDE O BOTÃO DEPENDENDO DA ROLAGEM DA PÁGINA
    window.addEventListener("scroll", function() {
        if (btnVoltarTopo) {
            if (window.scrollY > 200) {
                btnVoltarTopo.style.display = "block";
            } else {
                btnVoltarTopo.style.display = "none";
            }
        }
    });

    // AO CLICAR NO BOTÃO, VOLTA AO TOPO SUAVEMENTE
    if (btnVoltarTopo) {
        btnVoltarTopo.addEventListener("click", function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// EXEMPLO DE USO (CHAME NO SEU HTML APÓS O DOM CARREGAR):
// document.addEventListener("DOMContentLoaded", function() {
//     setupExpandableContent();
//     setupFaleConoscoModal(); // OU setupFaleConoscoModal("btnFaleConoscoCineclubes", "modalFaleConosco")
//     setupVoltarTopoButton();
// });