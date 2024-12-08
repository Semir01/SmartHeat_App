document.addEventListener("DOMContentLoaded", function () {
    const maxInput = document.getElementById("max_temp");
    const minInput = document.getElementById("min_temp");
  
    // Provjera postoji li sačuvano ime u local storage
    const savedMax = localStorage.getItem("savedMax");
    const savedMin = localStorage.getItem("savedMin");
  
    // Postavljanje vrijednosti iz local storage-a u input polja
    if (maxInput) {
      if (savedMax) {
        maxInput.value = savedMax;
      }
      maxInput.addEventListener("input", function () {
        localStorage.setItem("savedMax", maxInput.value);
      });
    }
  
    if (minInput) {
      if (savedMin) {
        minInput.value = savedMin;
      }
      minInput.addEventListener("input", function () {
        localStorage.setItem("savedMin", minInput.value);
      });
    }
  });

  document.getElementById("AutoON").addEventListener("click", () => AutomaticHeating("on"));
  document.getElementById("AutoOFF").addEventListener("click", () => AutomaticHeating("off"));
  
  function AutomaticHeating(action) {
    const maxTemp = parseFloat(document.getElementById("max_temp").value);
    const minTemp = parseFloat(document.getElementById("min_temp").value);
  
    if (isNaN(maxTemp) || isNaN(minTemp)) {
      document.getElementById("status").textContent = "Status: Molimo unesite ispravne vrijednosti za maksimalnu i minimalnu temperaturu.";
      return;
    }
  
    const url = `http://192.168.1.6/auto?state=${action}&max=${maxTemp}&min=${minTemp}`;
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Greška u komunikaciji sa ESP pločom");
        }
        return response.json();
      })
      .then(data => {
        document.getElementById("status").textContent = `Status: ${data.message}`;
      })
      .catch(error => {
        document.getElementById("status").textContent = `Status: ${error.message}`;
      });
  }

