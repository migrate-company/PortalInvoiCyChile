document.addEventListener("DOMContentLoaded", function() {
    var links = document.querySelectorAll('.md-nav__link');

    links.forEach(function(link) {
        if (link.innerText.trim() === "Curso da Reforma") {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener"); // Segurança adicional
        }
    });
});
