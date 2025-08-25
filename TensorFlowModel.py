# Code made by JonM1979 for Smart LED Rating App

import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load CSV and drop non-numeric header rows
df = pd.read_csv("led_ers_data_log.csv")

# Keep only necessary columns
df = df[["voltage (V)", "current (mA)", "power (mW)", "ers"]]

# Drop any rows with non-numeric data
df = df[pd.to_numeric(df["voltage (V)"], errors="coerce").notnull()]
df = df[pd.to_numeric(df["current (mA)"], errors="coerce").notnull()]
df = df[pd.to_numeric(df["power (mW)"], errors="coerce").notnull()]
df = df[pd.to_numeric(df["ers"], errors="coerce").notnull()]

# Convert all columns to float
df = df.astype(float)

# Features and label
X = df[["voltage (V)", "current (mA)", "power (mW)"]]
y = df["ers"]

# Normalize inputs
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Build model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(3,)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1)
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])
model.fit(X_train, y_train, epochs=100, validation_data=(X_test, y_test), verbose=1)

# Export tflite model
tflite_model = tf.lite.TFLiteConverter.from_keras_model(model).convert()
with open("ers_model.tflite", "wb") as f:
    f.write(tflite_model)

# For the final version of the project, I used the tflite model as 
# before I was having trouble with the quantized model but I'll leave 
# it here for those who may want to use it! 

# # Export quantized tflite model
# converter = tf.lite.TFLiteConverter.from_keras_model(model)
# converter.optimizations = [tf.lite.Optimize.DEFAULT]
# tflite_quant = converter.convert()
# with open("ers_model_quant.tflite", "wb") as f:
#     f.write(tflite_quant)
