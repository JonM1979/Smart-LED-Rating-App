/*
  Code orginally from Random Nerd Tutorials: https://randomnerdtutorials.com/esp32-esp8266-firebase-gauges-charts/
  modified by JonM1979 for Smart LED Rating Web App
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, set, remove, query, orderByKey, limitToLast, onChildAdded, endAt, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { createCurrentChart, createVoltageChart, createPowerChart , createERSChart} from "./charts-definition.js";
import { createCurrentGauge, createVoltageGauge, createPowerGauge } from "./gauges-definition.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION",
  authDomain: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION",
  databaseURL: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION",
  projectId: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION",
  storageBucket: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION",
  messagingSenderId: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION",
  appId: "REPLACE_WITH_YOUR_Firebase_CONFIGURATION"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Export auth for use in auth.js
export { auth };

const epochToJsDate = (epochTime) => new Date(epochTime * 1000);

const epochToDateTime = (epochTime) => {
  if (!epochTime) return 'N/A';
  const date = epochToJsDate(epochTime);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

// Validate and format sensor reading
const formatReading = (value) => (typeof value === 'number' ? value.toFixed(2) : 'N/A');

const plotValues = (chart, timestamp, value) => {
  if (!timestamp || typeof value !== 'number') return;
  const x = epochToJsDate(timestamp).getTime();
  const y = Number(value);
  const shift = chart.series[0].data.length > 40;
  chart.series[0].addPoint([x, y], true, shift, true);
};

// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector('#content-sign-in');
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');
const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');
const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');
const cardsReadingsElement = document.querySelector('#cards-div');
const gaugesReadingsElement = document.querySelector('#gauges-div');
const chartsDivElement = document.querySelector('#charts-div');
const currentElement = document.getElementById('current'); // tempElement
const voltageElement = document.getElementById('voltage'); //humElement
const powerElement = document.getElementById('power'); //presElement
const ERSElement = document.getElementById('ERS');
const updateElement = document.getElementById('lastUpdate');

// Chart and Gauge variables
let chartC, chartV, chartW, chartERS;
let gaugeC, gaugeV, gaugeW;

// Manage Login/Logout UI
const setupUI = (user) => {
  console.log('setupUI called with user:', user ? user.email : null);
  if (user) {
    // Toggle UI elements for logged-in state
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display = 'block';
    userDetailsElement.style.display = 'block';
    userDetailsElement.innerHTML = user.email;

    const uid = user.uid;
    const dbPath = `UsersData/${uid}/readings`;
    const chartPath = `UsersData/${uid}/charts/range`;

    // Database references
    const dbRef = ref(database, dbPath);
    const chartRef = ref(database, chartPath);

    // Initialize gauges
    gaugeC = createCurrentGauge();
    gaugeV = createVoltageGauge();
    gaugeW = createPowerGauge();
    gaugeC.draw();
    gaugeV.draw();
    gaugeW.draw();

    // Charts
    onValue(chartRef, (snapshot) => {
      const rawValue = snapshot.val();
      // Ensure chartRange is a positive integer; default to 100 if invalid
      const chartRange = Number.isInteger(Number(rawValue)) && Number(rawValue) > 0 ? Number(rawValue) : 100;

      // Destroy existing charts
      if (chartC) chartC.destroy();
      if (chartV) chartV.destroy();
      if (chartW) chartW.destroy();
      if (chartERS) chartERS.destroy();

      // Create new charts
      chartC = createCurrentChart();
      chartV = createVoltageChart();
      chartW = createPowerChart();
      chartERS = createERSChart();

      // Query and plot latest readings
      const readingsQuery = query(dbRef, orderByKey(), limitToLast(chartRange));
      onChildAdded(readingsQuery, (snapshot) => {
        const data = snapshot.val();
        console.log('Chart reading:', data);
        if (data && typeof data === 'object') {
          const { current, voltage, power, ERS, timestamp } = data;
          
          plotValues(chartC, timestamp, current);
          plotValues(chartV, timestamp, voltage);
          plotValues(chartW, timestamp, power);
          plotValues(chartERS, timestamp, ERS);
        }
      });
    });

    // Update chart range
    chartsRangeInputElement.addEventListener('change', () => {
      const newValue = Number(chartsRangeInputElement.value);
      // Only update if the new value is a positive integer
      if (Number.isInteger(newValue) && newValue > 0) {
        set(chartRef, newValue);
      } else {
        console.warn('Invalid chart range input; must be a positive integer');
        chartsRangeInputElement.value = ''; // Clear invalid input
      }
    });

    // Checkboxes
    cardsCheckboxElement.addEventListener('change', () => {
      cardsReadingsElement.style.display = cardsCheckboxElement.checked ? 'block' : 'none';
    });

    gaugesCheckboxElement.addEventListener('change', () => {
      gaugesReadingsElement.style.display = gaugesCheckboxElement.checked ? 'block' : 'none';
    });

    chartsCheckboxElement.addEventListener('change', () => {
      chartsDivElement.style.display = chartsCheckboxElement.checked ? 'block' : 'none';
    });

    // Cards
    const lastReadingQuery = query(dbRef, orderByKey(), limitToLast(1));
    onChildAdded(lastReadingQuery, (snapshot) => {
      const data = snapshot.val();
      console.log('Card reading:', data);
      if (data && typeof data === 'object') {
        const { current, voltage, power, ERS, timestamp } = data;
        currentElement.innerHTML = formatReading(current);
        voltageElement.innerHTML = formatReading(voltage);
        powerElement.innerHTML = formatReading(power);
        ERSElement.innerHTML = formatReading(ERS);
        updateElement.innerHTML = epochToDateTime(timestamp);
      } else {
        currentElement.innerHTML = 'N/A';
        voltageElement.innerHTML = 'N/A';
        powerElement.innerHTML = 'N/A';
        ERSElement.innerHTML = 'N/A';
        updateElement.innerHTML = 'N/A';
      }
    });

    // Gauges
    onChildAdded(lastReadingQuery, (snapshot) => {
      const data = snapshot.val();
      console.log('Gauge reading:', data);
      if (data && typeof data === 'object') {
        const { current, voltage, power, timestamp } = data;
        gaugeC.value = typeof current === 'number' ? current : 0;
        gaugeV.value = typeof voltage === 'number' ? voltage : 0;
        gaugeW.value = typeof power === 'number' ? power : 0;
        updateElement.innerHTML = epochToDateTime(timestamp);
      }
    });

    // Delete Data
    deleteButtonElement.addEventListener('click', (e) => {
      e.preventDefault();
      deleteModalElement.style.display = 'block';
    });

    deleteDataFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      remove(dbRef);
      deleteModalElement.style.display = 'none';
      // Reset UI after deletion
      currentElement.innerHTML = 'N/A';
      voltageElement.innerHTML = 'N/A';
      powerElement.innerHTML = 'N/A';
      //ersElement.innerHTML = 'N/A';
      updateElement.innerHTML = 'N/A';
      gaugeC.value = 0;
      gaugeV.value = 0;
      gaugeW.value = 0;
    });

    // Table
    let lastReadingTimestamp;
    const createTable = () => {
      const tableQuery = query(dbRef, orderByKey(), limitToLast(100));
      let firstRun = true;
      onChildAdded(tableQuery, (snapshot) => {
        const data = snapshot.val();
        console.log('Table reading:', data);
        if (data && typeof data === 'object') {
          const { current, voltage, power, ERS, timestamp } = data;
          const content = `
            <tr>
              <td>${epochToDateTime(timestamp)}</td>
              <td>${formatReading(current)}</td>
              <td>${formatReading(voltage)}</td>
              <td>${formatReading(power)}</td>
              <td>${formatReading(ERS)}<td>
            </tr>`;
          $('#tbody').prepend(content);
          if (firstRun && timestamp) {
            lastReadingTimestamp = timestamp;
            firstRun = false;
          }
        }
      });
    };

    const appendToTable = async () => {
      const tableQuery = query(dbRef, orderByKey(), limitToLast(100), endAt(String(lastReadingTimestamp)));
      const snapshot = await get(tableQuery);
      const dataList = [];
      snapshot.forEach((child) => {
        const data = child.val();
        console.log('Append table reading:', data);
        if (data && typeof data === 'object') {
          dataList.push(data);
        }
      });
      if (dataList.length > 0) {
        lastReadingTimestamp = dataList[0].timestamp;
        const reversedList = dataList.reverse();
        reversedList.forEach((element, index) => {
          if (index === 0) return; // Skip first reading
          const { current, voltage, power, ERS, timestamp } = element;
          const content = `
            <tr>
              <td>${epochToDateTime(timestamp)}</td>
              <td>${formatReading(current)}</td>
              <td>${formatReading(voltage)}</td>
              <td>${formatReading(power)}</td>
              <td>${formatReading(ERS)}<td>
            </tr>`;
          $('#tbody').append(content);
        });
      }
    };

    viewDataButtonElement.addEventListener('click', () => {
      tableContainerElement.style.display = 'block';
      viewDataButtonElement.style.display = 'none';
      hideDataButtonElement.style.display = 'inline-block';
      loadDataButtonElement.style.display = 'inline-block';
      createTable();
    });

    loadDataButtonElement.addEventListener('click', appendToTable);

    hideDataButtonElement.addEventListener('click', () => {
      tableContainerElement.style.display = 'none';
      viewDataButtonElement.style.display = 'inline-block';
      hideDataButtonElement.style.display = 'none';
      loadDataButtonElement.style.display = 'none';
    });

    // Initialize charts/range if it doesn't exist
    get(chartRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(chartRef, 100); // Set default chart range
        console.log('Initialized charts/range to 100');
      }
    });
  } else {
    // Toggle UI elements for logged-out state
    console.log('Showing login form');
    loginElement.style.display = 'block';
    authBarElement.style.display = 'none';
    userDetailsElement.style.display = 'none';
    contentElement.style.display = 'none';
    // Destroy gauges on logout
    if (gaugeC) gaugeC.destroy();
    if (gaugeV) gaugeV.destroy();
    if (gaugeW) gaugeW.destroy();
    gaugeC = null;
    gaugeV = null;
    gaugeW = null;
  }
};

// Expose setupUI to global scope for auth.js
window.setupUI = setupUI;


