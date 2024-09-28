import requests
from pydub import AudioSegment
import numpy as np
import librosa
import speech_recognition as sr
import tensorflow as tf

# Convert .m4a to .wav
def convert_m4a_to_wav(m4a_path):
    audio = AudioSegment.from_file(m4a_path, format="m4a")
    wav_path = m4a_path.replace('.m4a', '.wav')
    audio.export(wav_path, format="wav")
    return wav_path

# Function to query Hugging Face API for emotion detection
def get_emotion_probs(filename):
    API_URL = "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    headers = {"Authorization": "Bearer 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"}

    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()

# Path to the uploaded .m4a file
m4a_file_path = '/content/Recording.m4a'
wav_file_path = convert_m4a_to_wav(m4a_file_path)

# Define the functions from your existing code
def detect_keywords(text, keywords):
    return any(keyword in text.lower() for keyword in keywords)

def analyze_pitch_and_volume(audio_path):
    y, sr = librosa.load(audio_path)

    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)

    pitch_values = []
    for i in range(pitches.shape[1]):
        pitch = pitches[:, i]
        pitch = pitch[pitch > 0]
        if len(pitch) > 0:
            pitch_values.append(np.mean(pitch))

    energy = np.sum(librosa.feature.rms(y=y))
    avg_pitch = np.mean(pitch_values) if pitch_values else 0
    avg_energy = energy / len(y)

    return avg_pitch, avg_energy

def preprocess_audio(audio_file_path, keywords):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file_path) as source:
        audio_data = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio_data)
        keyword_detected = detect_keywords(text, keywords)
    except sr.UnknownValueError:
        text = ""
        keyword_detected = False
    except sr.RequestError as e:
        print(f"Could not request results from Speech Recognition service; {e}")
        text = ""
        keyword_detected = False

    avg_pitch, avg_energy = analyze_pitch_and_volume(audio_file_path)

    return text, keyword_detected, avg_pitch, avg_energy

# Load the trained model
model = tf.keras.models.load_model('help_detection_model.h5')

# Define keywords for detection
keywords = ["help", "emergency", "assist", "danger", "scream"]

# Preprocess the audio to extract features
text, keyword_detected, avg_pitch, avg_energy = preprocess_audio(wav_file_path, keywords)

# Get emotion probabilities using Hugging Face API
emotion_response = get_emotion_probs(wav_file_path)

# Extract emotion labels and probabilities
emotion_labels = [emotion['label'] for emotion in emotion_response]
emotion_probs = np.array([[emotion['score'] for emotion in emotion_response]])

# Expand emotion_probs to 8 values if needed
if emotion_probs.shape[1] < 8:
    padding = np.zeros((1, 8 - emotion_probs.shape[1]))
    emotion_probs = np.concatenate([emotion_probs, padding], axis=1)

# Print the recognized text, keywords, pitch, energy, and emotion probabilities
print(f"Recognized Text: {text}")
print(f"Keywords Detected: {keyword_detected}")
print(f"Average Pitch: {avg_pitch}")
print(f"Average Energy: {avg_energy}")

# Print emotion labels and their corresponding probabilities
print("Emotion Probabilities:")
for label, prob in zip(emotion_labels, emotion_probs[0]):
    print(f"{label}: {prob}")

# Prepare input data
keyword_input = np.array([[int(keyword_detected)]])
pitch_input = np.array([[avg_pitch]])
energy_input = np.array([[avg_energy]])

# Conditional prediction
if keyword_detected:
    # Make a prediction
    prediction = model.predict([keyword_input, pitch_input, energy_input, emotion_probs])

    # Interpret the prediction
    if prediction[0][0] > 0.5:
        print("The audio indicates a 'Help' request.")
    else:
        print("The audio does not indicate a 'Help' request.")
else:
    print("No keyword detected. The audio indicates 'No Help'.")
