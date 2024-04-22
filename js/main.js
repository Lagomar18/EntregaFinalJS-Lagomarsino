// Array para almacenar los estudiantes seleccionados obtenidos del almacenamiento local
let estudiantesSeleccionados = JSON.parse(localStorage.getItem('estudiantesSeleccionados')) || [];

// Variable para verificar si las alertas de notas bajas ya se han mostrado
let alertasMostradas = false;

// Función para cargar los datos de los estudiantes desde el archivo JSON
const cargarEstudiantes = async () => {
    const contenedorEstudiantes = document.getElementById("estudiantes");
    const inputBusqueda = document.getElementById("busqueda");
    contenedorEstudiantes.innerHTML = "";
    let estudiantesNotasBajas = [];

    const cargarDatosDesdeJSON = async () => {
        try {
            const response = await fetch('./datos/estudiantes.json');
            return await response.json();
        } catch (error) {
            console.error('Error al cargar los datos desde el archivo JSON:', error);
            return []; // Devolver un array vacío en caso de error
        }
    };

    const mostrarAlertas = (estudiantesNotasBajas) => {
        if (!alertasMostradas && estudiantesNotasBajas.length > 0) {
            const notasBajasMessage = estudiantesNotasBajas.map(estudiante => `${estudiante.nombre} tiene más de tres materias con notas menores a 6`).join("<br>");
            Swal.fire({
                title: "Alerta de Notas Bajas",
                html: notasBajasMessage,
                icon: "error"
            });
            alertasMostradas = true;
        }
    };

    const estudiantes = await cargarDatosDesdeJSON();

    estudiantes.forEach((estudiante) => {
        if (inputBusqueda.value.trim() === '' || estudiante.nombre.toLowerCase().includes(inputBusqueda.value.trim().toLowerCase())) {
            const divEstudiante = document.createElement("div");
            divEstudiante.classList.add("estudiante");

            const img = document.createElement("img");
            img.src = estudiante.foto;
            divEstudiante.appendChild(img);

            const h3 = document.createElement("h3");
            h3.textContent = estudiante.nombre;
            divEstudiante.appendChild(h3);

            const buttonSeleccionar = document.createElement("button");
            buttonSeleccionar.textContent = "Seleccionar";
            buttonSeleccionar.addEventListener("click", () => seleccionarEstudiante(estudiante));
            divEstudiante.appendChild(buttonSeleccionar);

            const buttonEliminar = document.createElement("button"); // Crear botón para eliminar estudiante
            buttonEliminar.textContent = "Eliminar";
            buttonEliminar.classList.add("boton-eliminar"); // Agregar clase CSS al botón
            buttonEliminar.addEventListener("click", () => eliminarEstudiante(estudiante));
            divEstudiante.appendChild(buttonEliminar); // Agregar botón a la tarjeta de estudiante

            contenedorEstudiantes.appendChild(divEstudiante);

            const materiasNotasBajas = estudiante.materias.filter(materia => materia.nota < 6);
            if (materiasNotasBajas.length > 3) {
                estudiantesNotasBajas.push(estudiante);
            }
        }
    });

    mostrarAlertas(estudiantesNotasBajas);

    // Llamar a mostrarDetalles() para asegurarse de que los detalles se muestren
    mostrarDetalles();
};

// Función para seleccionar un estudiante
const seleccionarEstudiante = (estudiante) => {
    if (!estudiantesSeleccionados.find(selected => selected.nombre === estudiante.nombre)) {
        if (estudiantesSeleccionados.length < 5) {
            estudiantesSeleccionados.push(estudiante);
            localStorage.setItem('estudiantesSeleccionados', JSON.stringify(estudiantesSeleccionados));
            mostrarDetalles();

            // Mostrar notificación utilizando Toastify
            Toastify({
                text: `${estudiante.nombre} fué agregado correctamente`,
                duration: 3000,
                gravity: "top", // Posición de la notificación en la pantalla
            }).showToast();
        } else {
            Swal.fire("Solo se pueden agregar 5 estudiantes", "", "warning");
        }
    } else {
        Swal.fire("Oops...", "Este estudiante ya fue agregado!", "error");
    }
};

// Función para eliminar un estudiante
const eliminarEstudiante = (estudiante) => {
    const indice = estudiantesSeleccionados.findIndex(selected => selected.nombre === estudiante.nombre);
    if (indice !== -1) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará al estudiante seleccionado. ¿Deseas continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                estudiantesSeleccionados.splice(indice, 1);
                localStorage.setItem('estudiantesSeleccionados', JSON.stringify(estudiantesSeleccionados));
                mostrarDetalles();
                Swal.fire("¡Estudiante eliminado!", "El estudiante ha sido eliminado correctamente.", "success");
            }
        });
    } else {
        Swal.fire("Estudiante no seleccionado", "El estudiante debe ser seleccionado antes de poder eliminarlo.", "info");
    }
};

// Función para mostrar los detalles de los estudiantes seleccionados
const mostrarDetalles = () => {
    const detallesEstudiante = document.getElementById("detalles-estudiante");
    detallesEstudiante.style.display = "flex";
    detallesEstudiante.innerHTML = "";

    if (estudiantesSeleccionados.length === 0) {
        detallesEstudiante.innerHTML = "<p>Selecciona algún estudiante</p>";
        return;
    }

    estudiantesSeleccionados.forEach((estudiante) => {
        const divEstudianteDetalles = document.createElement("div");
        divEstudianteDetalles.classList.add("estudiante-detalles");

        let detallesHTML = `
            <h3>${estudiante.nombre}</h3>
            <p><strong>Teléfono:</strong> ${estudiante.telefono}</p>
            <p><strong>Tutor:</strong> ${estudiante.tutor}</p>
            <p><strong>Teléfono del tutor:</strong> ${estudiante.telefonoTutor}</p>
            <p><strong>Asistencia:</strong> ${estudiante.asistencia}</p>
            <p><strong>Materias:</strong></p>
            <ul>
        `;

        estudiante.materias.forEach((materia) => {
            detallesHTML += `<li>${materia.nombre}: ${materia.nota}</li>`;
        });

        detallesHTML += `</ul>`;
        divEstudianteDetalles.innerHTML = detallesHTML;
        detallesEstudiante.appendChild(divEstudianteDetalles);
    });

    const limpiarListaButton = document.createElement("button");
    limpiarListaButton.textContent = "Limpiar Lista";
    limpiarListaButton.classList.add("estudiante", "boton-limpiar"); // Agrega la clase "boton-limpiar"
    limpiarListaButton.addEventListener("click", () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará todos los estudiantes seleccionados. ¿Deseas continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, limpiar lista",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('estudiantesSeleccionados');
                estudiantesSeleccionados = [];
                const detallesEstudiante = document.getElementById("detalles-estudiante");
                detallesEstudiante.style.display = "none";
                cargarEstudiantes();
                Swal.fire("¡Lista limpiada!", "La lista de estudiantes seleccionados ha sido limpiada correctamente.", "success");
            }
        });
    });
    detallesEstudiante.appendChild(limpiarListaButton);
};

// Escuchar el evento de entrada del usuario en la barra de búsqueda
document.getElementById("busqueda").addEventListener("input", cargarEstudiantes);

// Llamar a la función después de que la página se haya cargado por completo
window.addEventListener("load", cargarEstudiantes);
