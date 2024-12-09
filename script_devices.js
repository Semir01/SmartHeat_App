// Konfiguracija Firebase-a
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbp42OfCdd4opQnsOC0RLZIUuW8c95YvI",
  authDomain: "smartheat-951e2.firebaseapp.com",
  databaseURL: "https://smartheat-951e2-default-rtdb.firebaseio.com",
  projectId: "smartheat-951e2",
  storageBucket: "smartheat-951e2.firebasestorage.app",
  messagingSenderId: "82815124734",
  appId: "1:82815124734:web:46e4f53d9ff41dd12911af"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
//==================================================================================================================//

//Funkcija koja mijenja status na aplikaciji u zavisnosti da li je manuelno izvršeno uključivanje ili isključivanje 
function UpdateStatus(state){
  const ElementStatus = document.getElementById("status");
  if(state){
    ElementStatus.textContent = "Status: Heating is ON";
  }else{
    ElementStatus.textContent = "Status: Heating is OFF";
  }
}

//Funkcija koja mijenja status na aplikaciji u zavisnosti da li je upaljeno ili izgašeno automatska kontrola 
function UpdateStatusAutoMode(state){
 const ElementStatus = document.getElementById("status");
 if(state){
    ElementStatus.textContent ="Status: Auto mode is ON";
 }else{
    ElementStatus.textContent="Status: Auto mode is OFF";
 }
}

//Fukcija za dohvatanje povratne poruke sa Firebase-a, kada je automatsko grijanje uključeno
function InfoMessage(state){
 const ElementStatus = document.getElementById("status");
 const Inforef = ref(db,"info/message");

 onValue(Inforef, (snapshot)=>{
  const message = snapshot.val();
  if(state){
    ElementStatus.textContent = "Status: " + message;
  }
  })
}

//Funkcija koja mijenja stanje dugmića na aplikaciji u zavisnosti da li je Automatsko grijanje uključeno ili isključeno
let ButonState=false;
const ManualON=document.getElementById("ON-button");
const ManualOFF=document.getElementById("OFF-button");
function UpdateButonState(ButonState){
  if(ButonState){
    ManualON.disabled = true;
    ManualOFF.disabled = true;
  }else{
    ManualON.disabled = false;
    ManualOFF.disabled = false;
  }
}

//==================================================================================================================//

//MANUELNA KONTROLA GRIJANJA//
// Dodavanje događaja za gumb "Turn ON"
document.getElementById("ON-button").addEventListener("click", function () {
  const relayRef = ref(db, "relay1/status"); // Referenca na lokaciju u bazi
  set(relayRef, 1) // Postavljanje vrijednosti na `1`
    .then(() => {
      console.log("Relay 1 turned ON");
      UpdateStatus(true);
    })
    .catch((error) => {
      console.error("Error turning ON relay:", error);
    });
});
// Dodavanje događaja za gumb "Turn OFF"
document.getElementById("OFF-button").addEventListener("click", function () {
  const relayRef = ref(db, "relay1/status"); // Referenca na lokaciju u bazi
  set(relayRef, 0) // Postavljanje vrijednosti na `0`
    .then(() => {
      console.log("Relay 1 turned OFF");
      UpdateStatus(false);
    })
    .catch((error) => {
      console.error("Error turning OFF relay:", error);
    });
});

//==================================================================================================================//

//AUTOMATSKA KONTROLA GRIJANJA//
// Dodavanje događaja za gumb "AutoON"
document.getElementById("AutoON").addEventListener("click",function(){
  const AutoModref = ref(db,"autoMod/statusAutoMode"); // Referenca n lokaciju u bazi
  set(AutoModref, 1)
  .then(()=> {
    console.log("Auto mode turned ON");
    UpdateStatusAutoMode(true);
    UpdateButonState(true);
    InfoMessage(true);
  })
  .catch((error) =>{
    console.error("Error turning ON auto mode:", error);
  });
});
// Dodavanje događaja za gumb "AutoOFF"
document.getElementById("AutoOFF").addEventListener("click",function(){
  const AutoModref = ref(db,"autoMod/statusAutoMode"); // Referenca n lokaciju u bazi
  set(AutoModref, 0)
  .then(()=> {
    console.log("Auto mode turned OFF");
    UpdateStatusAutoMode(false);
    UpdateButonState(false);
  })
  .catch((error) =>{
    console.error("Error turning OFF auto mode:", error);
  });
});

//==================================================================================================================//

// Dodavanje funkcionalnosti za Max i Min temperature
document.getElementById("max_temp").addEventListener("input",function (){
  const MaxTemp=this.value;

  if(isNaN(MaxTemp) || MaxTemp ===""){
    console.error("Invalide MaxTemp value. Must be a number.");
    return;
  }

  const MaxTempref = ref(db,"tempertureSettings/maxTemp");
  set(MaxTempref,parseFloat(MaxTemp))
  .then(()=>{
    console.log("Max temperature saved succsessfully: ",MaxTemp);
  })
  .catch((error)=>{
    console.error("Error saving max temperature:",error);
  });
});
document.getElementById("min_temp").addEventListener("input",function (){
  const MinTemp=this.value;

  if(isNaN(MinTemp) || MinTemp ===""){
    console.error("Invalide MinTemp value. Must be a number.");
    return;
  }

  const MinTempref = ref(db,"tempertureSettings/minTemp");
  set(MinTempref,parseFloat(MinTemp))
  .then(()=>{
    console.log("Min temperature saved succsessfully: ",MinTemp);
  })
  .catch((error)=>{
    console.error("Error saving min temperature:",error);
  });
});

//==================================================================================================================//

//Funkcija za ucitavanje podataka sa baze za senzor 
function GetSensorData(){
  const temReference=ref(db,'sensor/temperature');
  const humyReference=ref(db,'sensor/humidity');

  onValue(temReference,(snapshot)=>{
    const temperature = snapshot.val();
    document.getElementById('temperature').textContent=temperature;
  });

  onValue(humyReference,(snapshot)=>{
    const humidity=snapshot.val();
    document.getElementById("humidity").textContent=humidity;
  })
}
//Poziv funkcije 
GetSensorData();

//==================================================================================================================//