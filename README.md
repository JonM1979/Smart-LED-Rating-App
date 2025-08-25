# Smart-LED-Rating-Web-App
This web app tracks current, voltage, and power consumption through an INA219 and uses an ESP32 to send those values to a Firebase Database to then display on a web app. I also created a value called an Energy Rating Score (ERS) as a metric to quantify if an LED is working the best it possibly can. I recorded current, voltage, and power values from 3 different branded 12V LED lightbulbs; Ziomitus, Haian, and KONPWAY lightbulbs to train a machine learning algorithm to give an LED connected to the circuit an ERS score based on the current, voltage, and power values it is currently reading. 

In the schematic section I show the electric schematic that goes with this project and show an image of how the circuit looks physically in person. 

In the coding section, I include all the code that I used, go into detail behind the process of developing the code, and more detail behind how the ERS score works in the context of this project. (the majority of the project details are in this section)

The conclusion/demo section includes my concluding thoughts on the project and a video that shows the web app working alongside the circuitry! 

![Circuit Example 1](https://github.com/user-attachments/assets/b6d137b0-6c8e-493e-8118-b61368767403)

![Layout 1](https://github.com/user-attachments/assets/736a78d1-fef9-455c-a33a-764bab22f5bc)
