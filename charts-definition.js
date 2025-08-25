/*
  Code orginally from Random Nerd Tutorials: https://randomnerdtutorials.com/esp32-esp8266-firebase-gauges-charts/
  modified by JonM1979 for Smart LED Rating Web App
*/

// we disable UTC timing to allow for charts to display 
// correct times according to user time-zone
Highcharts.setOptions({
  time: {
    useUTC: false
  }
});

export function createCurrentChart() {
  return Highcharts.chart('chart-current', {
    chart: { type: 'line', zoomType: 'x' },
    title: { text: 'Current (mA)' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Current (mA)' } },
    series: [{ name: 'Current', data: [] }]
  });
}

export function createVoltageChart() {
  return Highcharts.chart('chart-voltage', {
    chart: { type: 'line', zoomType: 'x' },
    title: { text: 'Voltage (V)' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Voltage (V)' } },
    series: [{ name: 'Voltage', data: [] }]
  });
}

export function createPowerChart() {
  return Highcharts.chart('chart-power', {
    chart: { type: 'line', zoomType: 'x' },
    title: { text: 'Power (mW)' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Power (mW)' } },
    series: [{ name: 'Power', data: [] }]
  });
}

export function createERSChart() {
  return Highcharts.chart('chart-ERS', {
    chart: { type: 'line', zoomType: 'x' },
    title: { text: 'ERS' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'ERS' } },
    series: [{ name: 'ERS', data: [] }]
  });
}
