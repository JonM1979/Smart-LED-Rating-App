# Circuit Diagram 
I used an ESP32-WROOM-C and an INA219 sensor for this project. The ESP32 is a perfect microcontroller for this project as it already has WiFi capabilities already installed and is easily compatible with the Arduino IDE. Using I2C for data communication, I connect the VIN+ to the positive line of my power supply, then connect that through the anode/+ leg of the LED. The cathode/- leg of the LED is then connected to the GND pin of the ESP32 and the GND of the power supply; the GND pin of the ESP32 must be used so that it can read the sensor data. I color matched the diagram to the actual physical board so that it can be easier to follow. Now the ESP32 and INA219 should be reading the current, voltage, and power values from whatever LED or LED lightbulb that is connected to the circuit! 

I've also included the various links for materials that were used in this project!

[ESP32](https://www.amazon.com/dp/B0D8T53CQ5?ref=ppx_yo2ov_dt_b_fed_asin_title)

[INA219](https://www.amazon.com/dp/B0CRKGQJ8P?ref=ppx_yo2ov_dt_b_fed_asin_title)

[Wires](https://www.amazon.com/dp/B01EV70C78?ref=ppx_yo2ov_dt_b_fed_asin_title)

[Breadboards](https://www.amazon.com/dp/B07DL13RZH?ref=ppx_yo2ov_dt_b_fed_asin_title)

[KONPWAY Lightbulb](https://www.amazon.com/dp/B075XZ3CTL?ref=ppx_yo2ov_dt_b_fed_asin_title&th=1)

[Haian Lightbulb](https://www.amazon.com/dp/B081DG1L2X?ref=ppx_yo2ov_dt_b_fed_asin_title&th=1)

[Ziomitus G4 RV Ceiling LED](https://www.amazon.com/dp/B0D2CVC9H9?ref=ppx_yo2ov_dt_b_fed_asin_title&th=1)

(I don't have a link for the alligator clips that I used since I had those laying around)

<img width="1530" height="917" alt="schematic" src="https://github.com/user-attachments/assets/1b50ef4d-c755-4278-9f5a-a4addd783c84" />

![board layout](https://github.com/user-attachments/assets/60e91235-71e5-4501-9a84-869a6c0bcdc2)
