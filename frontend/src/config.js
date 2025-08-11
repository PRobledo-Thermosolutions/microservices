// Se obtienen las variables de entorno definidas en el archivo .env del proyecto React
// Estas variables deben comenzar con "REACT_APP_" para que Create React App las reconozca

// URL base para las peticiones HTTP a la API REST
const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_SERVICE_PATH_TO_API;
const USER_API_BASE_URL = process.env.REACT_APP_USER_SERVICE_PATH_TO_API;

// URL base para las conexiones WebSocket
const WS_BASE_URL = process.env.REACT_APP_WS_PATH_TO_API;

// Se agrupan ambas rutas en un objeto llamado "Path" para exportarlas más fácilmente
const Path = {
  AUTH_API_BASE_URL,
  USER_API_BASE_URL,
  WS_BASE_URL,
};

// Se exporta el objeto Path por defecto para ser utilizado en otros módulos del proyecto
export default Path;
