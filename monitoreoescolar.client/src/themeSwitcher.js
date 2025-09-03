export const cambiarTema = (nuevoTema) => {
    const enlaceTema = document.getElementById('theme-link');
    const body = document.body;

    if (enlaceTema) {
        enlaceTema.href = `https://unpkg.com/primereact/resources/themes/${nuevoTema}/theme.css`;
        localStorage.setItem('temaPreferido', nuevoTema);

        // Detecta si es un tema oscuro por el nombre
        if (nuevoTema.includes("dark")) {
            body.classList.add("tema-oscuro");
            body.classList.remove("tema-claro");
        } else {
            body.classList.add("tema-claro");
            body.classList.remove("tema-oscuro");
        }
    }
};
