// Lee un parámetro del query string y lo decodifica
const params = new URLSearchParams(window.location.search);

function getParam(key) {
  const encodedValue = params.get(key);
  if (encodedValue === null) {
    return "";
  }
  return decodeURIComponent(encodedValue);
}

// Rellena la página con los datos recibidos
function loadCountryDetails() {
  const name = getParam("name");

  document.title = name + " - Country Explorer";
  document.getElementById("country-name").textContent = name;

  const flag = document.getElementById("country-flag");
  flag.src = getParam("flag");
  flag.alt = "Flag of " + name;

  document.getElementById("population").textContent = getParam("population");
  document.getElementById("region").textContent = getParam("region");
  document.getElementById("sub-region").textContent = getParam("subRegion");
  document.getElementById("capital").textContent = getParam("capital");
  document.getElementById("currencies").textContent = getParam("currencies");
  document.getElementById("languages").textContent = getParam("languages");
}

// Redirige a la página principal
function backButtonHandler() {
  window.location.href = "index.html";
}

// Registrar backButtonHandler en el botón Back
document.getElementById("back-btn").addEventListener("click", backButtonHandler);

// Carga inicial
loadCountryDetails();