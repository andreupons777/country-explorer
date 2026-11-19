const container = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const regionSelect = document.getElementById("region-select");
const populationInput = document.getElementById("population-input");
const showMoreBtn = document.getElementById("show-more");
const errorMessage = document.getElementById("error-message");

const PAGE_SIZE = 12;
const SHOW_MORE_STEP = 10;
const MAX_POPULATION = 1500000000;
let visibleCount = PAGE_SIZE;
let filteredCountries = [];
let data = [];

function fetchData() {
  return fetch("/countries")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP error! Status: " + response.status);
      }
      return response.json();
    })
    .catch(function (error) {
      console.error("Error fetching countries data");
      throw error;
    });
}

function getFormattedCurrencies(currencies) {
  if (!currencies) return "";

  let currencyCodes = Object.keys(currencies);
  let names = [];

  for (let i = 0; i < currencyCodes.length; i++) {
    let code = currencyCodes[i];
    names.push(currencies[code].name);
  }

  return names.join(", ");
}

function getFormattedLanguages(languages) {
  if (!languages) return "";

  let languageCodes = Object.keys(languages);
  let names = [];

  for (let i = 0; i < languageCodes.length; i++) {
    let code = languageCodes[i];
    names.push(languages[code]);
  }

  return names.join(", ");
}

function countryCardHandler(country) {
  let queryString =
    "?name=" +
    encodeURIComponent(country.name.official) +
    "&flag=" +
    encodeURIComponent(country.flags.svg) +
    "&population=" +
    country.population +
    "&region=" +
    country.region +
    "&subRegion=" +
    encodeURIComponent(country.subregion) +
    "&capital=" +
    encodeURIComponent(country.capital) +
    "&currencies=" +
    encodeURIComponent(getFormattedCurrencies(country.currencies)) +
    "&languages=" +
    encodeURIComponent(getFormattedLanguages(country.languages));

  window.location.href = "detail.html" + queryString;
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function populateCountryCards() {
  if (filteredCountries.length === 0) {
    container.innerHTML =
      `<p class="message">No country found matching the search criteria.</p>`;
    showMoreBtn.style.display = "none";
    return;
  }

  container.innerHTML = "";

  filteredCountries.slice(0, visibleCount).forEach(country => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${country.flags.svg}" alt="Flag of ${country.name.official}" />
      <h2>${country.name.official}</h2>
      <p><strong>Population:</strong> ${country.population}</p>
      <p><strong>Capital:</strong> ${country.capital}</p>
      <p><strong>Region:</strong> ${country.region}</p>
    `;

    card.addEventListener("click", () => countryCardHandler(country));

    container.appendChild(card);
  });

  if (visibleCount < filteredCountries.length) {
    showMoreBtn.style.display = "block";
  } else {
    showMoreBtn.style.display = "none";
  }
}

function filterData() {
  const inputValue = searchInput.value.trim();
  const region = regionSelect.value;
  const population = Number(populationInput.value) || 0;

  let regex = new RegExp(/^[a-zA-Z -]*$/);
  if (!regex.test(inputValue)) {
    showError("Enter valid Country Name.");
    return false;
  }

  if (population > MAX_POPULATION) {
    showError("Country's population cannot be greater than 1.5 billion.");
    return false;
  }

  clearError();

  const name = inputValue.toLowerCase();

  filteredCountries = data.filter(country => {
    const matchesName =
      country.name.official.toLowerCase().includes(name) ||
      country.name.common.toLowerCase().includes(name);
    const matchesRegion = region === "" || country.region === region;
    const matchesPopulation = country.population >= population;
    return matchesName && matchesRegion && matchesPopulation;
  });

  visibleCount = PAGE_SIZE;
  populateCountryCards();
}

function showMoreHandler() {
  visibleCount += SHOW_MORE_STEP;
  populateCountryCards();
}

searchInput.addEventListener("input", filterData);
regionSelect.addEventListener("change", filterData);
populationInput.addEventListener("input", filterData);
showMoreBtn.addEventListener("click", showMoreHandler);

fetchData().then(function (fetchedData) {
  data = fetchedData;
  filterData();
});