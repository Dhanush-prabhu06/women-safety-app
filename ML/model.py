import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, concatenate, Dropout, BatchNormalization
from sklearn.preprocessing import StandardScaler
import librosa

# Load data from CSV
data = pd.read_csv('./audio_data.csv')
print(data.head())

# Extract the relevant columns
emotion_probs = np.array([eval(row) for row in data['emotion_probs']])
keyword_flags = data['keyword_detected'].values.reshape(-1, 1)
pitch_values = data['avg_pitch'].values.reshape(-1, 1)
energy_values = data['avg_energy'].values.reshape(-1, 1)
labels = data['label'].values.reshape(-1, 1)

# Standardize pitch and energy values
scaler = StandardScaler()
pitch_values = scaler.fit_transform(pitch_values)
energy_values = scaler.fit_transform(energy_values)

# Data augmentation function
def augment_audio_data(pitch, energy, emotion_probs):
    # Apply a small amount of noise to the pitch and energy values
    pitch_augmented = pitch + np.random.normal(0, 0.01, pitch.shape)
    energy_augmented = energy + np.random.normal(0, 0.01, energy.shape)
    
    # Shuffle emotion probabilities slightly
    emotion_augmented = emotion_probs + np.random.normal(0, 0.01, emotion_probs.shape)
    emotion_augmented = np.clip(emotion_augmented, 0, 1)  # Ensure probabilities are still between 0 and 1
    
    return pitch_augmented, energy_augmented, emotion_augmented

# Augment the data to increase the dataset size
augmented_pitch_values = []
augmented_energy_values = []
augmented_emotion_probs = []
augmented_labels = []

for i in range(len(labels)):
    pitch_aug, energy_aug, emotion_aug = augment_audio_data(pitch_values[i], energy_values[i], emotion_probs[i])
    augmented_pitch_values.append(pitch_aug)
    augmented_energy_values.append(energy_aug)
    augmented_emotion_probs.append(emotion_aug)
    augmented_labels.append(labels[i])

# Convert lists to numpy arrays
augmented_pitch_values = np.array(augmented_pitch_values)
augmented_energy_values = np.array(augmented_energy_values)
augmented_emotion_probs = np.array(augmented_emotion_probs)
augmented_labels = np.array(augmented_labels)

# Combine the original and augmented data
pitch_values_combined = np.vstack([pitch_values, augmented_pitch_values])
energy_values_combined = np.vstack([energy_values, augmented_energy_values])
emotion_probs_combined = np.vstack([emotion_probs, augmented_emotion_probs])
labels_combined = np.vstack([labels, augmented_labels])

# Define the input layers
keyword_input = Input(shape=(1,), name='keyword_input')
pitch_input = Input(shape=(1,), name='pitch_input')
energy_input = Input(shape=(1,), name='energy_input')
emotion_input = Input(shape=(8,), name='emotion_input')

# Define dense layers for each input
keyword_dense = Dense(16, activation='relu')(keyword_input)
pitch_dense = Dense(16, activation='relu')(pitch_input)
energy_dense = Dense(16, activation='relu')(energy_input)
emotion_dense = Dense(16, activation='relu')(emotion_input)

# Concatenate the dense layers
concatenated = concatenate([keyword_dense, pitch_dense, energy_dense, emotion_dense])

# Add more layers with dropout and batch normalization
dense_1 = Dense(32, activation='relu')(concatenated)
dense_1 = Dropout(0.5)(dense_1)

output = Dense(1, activation='sigmoid')(dense_1)  # Binary classification (Help or No Help)

# Define the model
model = Model(inputs=[keyword_input, pitch_input, energy_input, emotion_input], outputs=output)

# Compile the model with a lower learning rate
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005), 
              loss='binary_crossentropy', metrics=['accuracy'])

# Early stopping callback with higher patience
early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

# Train the model with the combined dataset
model.fit([keyword_flags, pitch_values_combined, energy_values_combined, emotion_probs_combined], 
          labels_combined, 
          validation_split=0.2,
          epochs=100, batch_size=4, callbacks=[early_stopping])

# Save the model
model.save('help_detection_model_augmented.h5')
