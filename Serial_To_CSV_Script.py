import serial
import csv
from datetime import datetime

# Configuration
SERIAL_PORT = 'COM3'  # Replace with your actual port
BAUD_RATE = 115200
CSV_FILENAME = 'led_ers_data_log.csv'
SAMPLES_PER_ERS = 100

def main():
    # Prompt user for ERS level
    ers_level = input("Enter the ERS level for this batch (e.g., 100, 75, 50, 25): ").strip()

    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print(f"Connected to {SERIAL_PORT} at {BAUD_RATE} baud.")
        
        with open(CSV_FILENAME, 'a', newline='') as csvfile:
            writer = csv.writer(csvfile)
            # Write header only if file is empty
            if csvfile.tell() == 0:
                writer.writerow(['Timestamp (ISO)', 'Epoch Time', 'Voltage (V)', 'Current (mA)', 'Power (mW)', 
                                 'LED Brand', 'LED Rated Voltage (V)', 'ERS'])

            print(f"Collecting {SAMPLES_PER_ERS} samples for ERS level {ers_level}...")
            sample_count = 0

            while sample_count < SAMPLES_PER_ERS:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line and ',' in line:
                    try:
                        parts = line.split(',')
                        if len(parts) == 6:
                            epoch, voltage, current, power, brand, rated_voltage = parts
                            timestamp = datetime.now().isoformat()
                            writer.writerow([timestamp, epoch, voltage, current, power, brand, rated_voltage, ers_level])
                            print(f"{sample_count+1}/{SAMPLES_PER_ERS} | {timestamp} | {epoch}, {voltage} V, {current} mA, {power} mW, {brand}, {rated_voltage} V, ERS: {ers_level}")
                            sample_count += 1
                    except ValueError:
                        print(f"Skipping malformed line: {line}")
    except KeyboardInterrupt:
        print("\nLogging stopped by user.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()

