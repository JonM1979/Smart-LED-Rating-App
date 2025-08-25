/*
  Code orginally from Random Nerd Tutorials: https://randomnerdtutorials.com/esp32-esp8266-firebase-gauges-charts/
  modified by JonM1979 for Smart LED Rating Web App
*/

export function createCurrentGauge() {
    return new RadialGauge({
        renderTo: 'gauge-current',
        width: 300,
        height: 300,
        units: "Current (mA)",
        minValue: 0,
        maxValue: 2000,
        colorValueBoxRect: "#049faa",
        colorValueBoxRectEnd: "#049faa",
        colorValueBoxBackground: "#f1fbfc",
        valueInt: 2,
        majorTicks: [
            "0",
            "400",
            "800",
            "1200",
            "1600",
            "2000"
        ],
        minorTicks: 4,
        strokeTicks: true,
        highlights: [
            {
                "from": 1600,
                "to": 2000,
                "color": "#d21d1dff"
            }
        ],
        colorPlate: "#fff",
        borderShadowWidth: 0,
        borders: false,
        needleType: "line",
        colorNeedle: "#007F80",
        colorNeedleEnd: "#007F80",
        needleWidth: 2,
        needleCircleSize: 3,
        colorNeedleCircleOuter: "#007F80",
        needleCircleOuter: true,
        needleCircleInner: false,
        animationDuration: 1500,
        animationRule: "linear"
    });
}

export function createVoltageGauge() {
    return new RadialGauge({
        renderTo: 'gauge-voltage',
        width: 300,
        height: 300,
        units: "Voltage (V)",
        minValue: 0,
        maxValue: 12,
        colorValueBoxRect: "#049faa",
        colorValueBoxRectEnd: "#049faa",
        colorValueBoxBackground: "#f1fbfc",
        valueInt: 2,
        majorTicks: [
            "0",
            "2",
            "4",
            "6",
            "8",
            "10",
            "12"
        ],
        minorTicks: 2,
        strokeTicks: true,
        highlights: [
            {
                "from": 10,
                "to": 12,
                "color": "#e8131eff"
            }
        ],
        colorPlate: "#fff",
        borderShadowWidth: 0,
        borders: false,
        needleType: "line",
        colorNeedle: "#007F80",
        colorNeedleEnd: "#007F80",
        needleWidth: 2,
        needleCircleSize: 3,
        colorNeedleCircleOuter: "#007F80",
        needleCircleOuter: true,
        needleCircleInner: false,
        animationDuration: 1500,
        animationRule: "linear"
    });
}

export function createPowerGauge() {
    return new RadialGauge({
        renderTo: 'gauge-power',
        width: 300,
        height: 300,
        units: "Power (mW)",
        minValue: 0,
        maxValue: 10000,
        colorValueBoxRect: "#049faa",
        colorValueBoxRectEnd: "#049faa",
        colorValueBoxBackground: "#f1fbfc",
        valueInt: 2,
        majorTicks: [
            "0",
            "2000",
            "4000",
            "6000",
            "80000",
            "10000"
        ],
        minorTicks: 4,
        strokeTicks: true,
        highlights: [
            {
                "from": 8000,
                "to": 10000,
                "color": "#ed0c26ff"
            }
        ],
        colorPlate: "#fff",
        borderShadowWidth: 0,
        borders: false,
        needleType: "line",
        colorNeedle: "#007F80",
        colorNeedleEnd: "#007F80",
        needleWidth: 2,
        needleCircleSize: 3,
        colorNeedleCircleOuter: "#007F80",
        needleCircleOuter: true,
        needleCircleInner: false,
        animationDuration: 1500,
        animationRule: "linear"
    });
}

