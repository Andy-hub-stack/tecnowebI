/* ANDY VARGAS OVANDO */
const API_KEY = '3ad3e95afa02da04b70ae7192cfa2705';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid = document.getElementById('series-grid');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const resultsTitle = document.getElementById('results-title');
const resultsCount = document.getElementById('results-count');
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-search');
const retryBtn = document.getElementById('retry-btn');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('serie-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalOverlay = document.getElementById('modal-overlay');





const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
}
const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
}
const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
}
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
}
const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
}
themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});
cargarTema();
const filtros = document.createElement('section');
filtros.className = 'filters';
filtros.innerHTML = `
    <button class="filter-btn filter-btn--active" id="popular-btn">Populares</button>
    <button class="filter-btn" id="top-rated-btn">Mejor Valoradas</button>
    <button class="filter-btn" id="airing-today-btn">En Emisión Hoy</button>
`;
document.querySelector('.main').insertBefore(filtros, document.querySelector('.search-section'));
const obtenerSeries = async (tipo) => {
    const url = `${BASE_URL}${tipo}?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`${respuesta.status}`);
    }
    const datos = await respuesta.json();
    return datos.results;
}
const obtenerDetalle = async (id) => {
    const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`${respuesta.status}`);
    }
    const datos = await respuesta.json();
    return datos;
}

const crearTarjeta = (serie) => {
    const { id, name, first_air_date, vote_average, poster_path } = serie;
    const anio = first_air_date ? first_air_date.split('-')[0] : 'N/A';
    const imagen = poster_path ? `${IMAGE_URL}${poster_path}` : '';
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';
    return `
        <article class="serie-card" data-id="${id}">
        <div class="serie-card__poster">
        <img class="serie-card__image" src="${imagen}" alt="${name}">
        <span class="serie-card__rating">⭐ ${rating}</span></div>
        <div class="serie-card__content">
        <h3 class="serie-card__title">${name}</h3>
        <p class="serie-card__year">🗓️ ${anio}</p></div>
        </article>
    `;
}

const mostrarSeries = (series) => {
    seriesGrid.innerHTML = series.map(crearTarjeta).join('');
    resultsCount.textContent = `${series.length} resultados`;
}

let tipoActual = '/tv/popular';
let tituloActual = 'Series Populares';




const cargarSeries = async (tipo, titulo) => {
    tipoActual = tipo;
    tituloActual = titulo;
    mostrarLoading();
    resultsTitle.textContent = titulo;
    try {
        const series = await obtenerSeries(tipo);
        ocultarLoading();
        mostrarSeries(series);
    } catch (error) {
        console.log('Error', error);
        let mensaje = 'No se pudieron cargar las series';
        if (error.message.includes('401')) {
            mensaje = 'API Key inválida';
        } else if (error.message.includes('fetch')) {
            mensaje = 'Error de conexión';
        } else if (error.message.includes('429')) {
            mensaje = 'Demasiadas peticiones. Espere un momento';
        }
        mostrarError(mensaje);
    }
}

const activarFiltro = (boton) => {
    document.querySelectorAll('.filter-btn').forEach(filtro => {
        filtro.classList.remove('filter-btn--active');
    });
    boton.classList.add('filter-btn--active');
}

document.getElementById('popular-btn').addEventListener('click', () => {
    searchInput.value = '';
    activarFiltro(document.getElementById('popular-btn'));
    cargarSeries('/tv/popular', 'Series Populares');
});
document.getElementById('top-rated-btn').addEventListener('click', () => {
    searchInput.value = '';
    activarFiltro(document.getElementById('top-rated-btn'));
    cargarSeries('/tv/top_rated', 'Series Mejor Valoradas');
});
document.getElementById('airing-today-btn').addEventListener('click', () => {
    searchInput.value = '';
    activarFiltro(document.getElementById('airing-today-btn'));
    cargarSeries('/tv/airing_today', 'Series En Emisión Hoy');
});

const buscarSeries = async () => {
    const texto = searchInput.value.trim();
    if (texto === '') {
        activarFiltro(document.getElementById('popular-btn'));
        cargarSeries('/tv/popular', 'Series Populares');
        return;
    }
    mostrarLoading();
    resultsTitle.textContent = 'Resultados de busqueda';
    try {
        const busqueda = encodeURIComponent(texto);
        const url = `${BASE_URL}/search/tv?query=${busqueda}&api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`${respuesta.status}`);
        }
        const datos = await respuesta.json();
        ocultarLoading();
        mostrarSeries(datos.results);
    } catch (error) {
        console.log('Error', error);
        let mensaje = 'No se pudieron buscar las series';
        if (error.message.includes('401')) {
            mensaje = 'API Key inválida';
        } else if (error.message.includes('fetch')) {
            mensaje = 'Error de conexion';
        }
        mostrarError(mensaje);
    }
}

searchInput.addEventListener('input', buscarSeries);

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    activarFiltro(document.getElementById('popular-btn'));
    cargarSeries('/tv/popular', 'Series Populares');
});

const mostrarDetalle = (serie) => {
    const imagen = serie.poster_path ? `${IMAGE_URL}${serie.poster_path}` : '';
    const sinopsis = serie.overview ? serie.overview : 'No disponible';
    const generos = serie.genres.map(genero => genero.name).join(', ');
    modalBody.innerHTML = `
        <h2 class="modal__title">${serie.name}</h2>
        ${imagen ? `<img src="${imagen}" alt="${serie.name}" style="width: 150px; border-radius: 8px;">` : ''}
        <div class="modal__info">
            <p><strong>Temporadas:</strong> ${serie.number_of_seasons}</p>
            <p><strong>Episodios:</strong> ${serie.number_of_episodes}</p>
            <p><strong>Géneros:</strong> ${generos || 'No disponibles'}</p>
            <p><strong>Estado:</strong> ${serie.status}</p>
        </div>
        <p class="modal__overview"><strong>Sinopsis:</strong> ${sinopsis}</p>
    `;
}

seriesGrid.addEventListener('click', async (evento) => {
    const tarjeta = evento.target.closest('.serie-card');
    if (tarjeta) {
        const id = tarjeta.dataset.id;
        modalBody.innerHTML = '<p>Cargando detalles...</p>';
        modal.classList.add('modal--show');
        try {
            const serie = await obtenerDetalle(id);
            mostrarDetalle(serie);
        } catch (error) {
            console.log('Error', error);
            let mensaje = 'No se pudieron cargar los detalles';
            if (error.message.includes('401')) {
                mensaje = 'APIKey invalida';
            } else if (error.message.includes('fetch')) {
                mensaje = 'Error de conexion';
            }
            modalBody.innerHTML = `<p>${mensaje}</p>`;
        }
    }
});

const cerrarModal = () => {
    modal.classList.remove('modal--show');
}
modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);

retryBtn.addEventListener('click', () => {
    cargarSeries(tipoActual, tituloActual);
});

cargarSeries('/tv/popular', 'Series Populares');
