const API_KEY='3ad3e95afa02da04b70ae7192cfa2705';
const BASE_URL='https://api.themoviedb.org/3';
const probarApi=async()=>{
    const url=`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES`;
console.log('Url de la peticion',url);
const respuesta=await fetch(url);
const datos=await respuesta.json();
console.log('Respuesta completa',datos);
console.log('Peliculas',datos.results);
console.log('Total de resultados',datos.total_results);
}

probarApi();