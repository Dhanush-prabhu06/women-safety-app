import numpy as np
import csv
import os
import requests
import librosa
import speech_recognition as sr
from pydub import AudioSegment
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Define the order of emotions expected by the model
emotion_order = ['angry', 'calm', 'disgust', 'fearful', 'happy', 'neutral', 'sad', 'surprised']

def convert_m4a_to_wav(m4a_path):
    logging.info(f"Converting {m4a_path} to WAV format.")
    audio = AudioSegment.from_file(m4a_path, format="m4a")
    wav_path = m4a_path.replace('.m4a', '.wav')
    audio.export(wav_path, format="wav")
    logging.info(f"Conversion complete: {wav_path}")
    return wav_path

def map_emotions(api_response):
    # Initialize the emotion probabilities array with zeros
    emotion_probs = np.zeros(len(emotion_order))
    
    # Fill the emotion_probs array based on the API response
    for item in api_response:
        emotion = item['label'].lower()
        score = item['score']
        if emotion in emotion_order:
            index = emotion_order.index(emotion)
            emotion_probs[index] = score
    return emotion_probs.tolist()  # Convert to a list for easy storage in CSV

def get_emotion_probs(filename):
    logging.info(f"Requesting emotion probabilities for {filename}.")
    API_URL = "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    headers = {"Authorization": "Bearer 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"}

    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    
    if response.status_code == 200:
        logging.info(f"Successfully retrieved emotion probabilities for {filename}.")
        api_response = response.json()
        logging.info(f"Emotion Probabilities: {api_response}")
        return map_emotions(api_response)
    else:
        logging.error(f"Failed to retrieve emotion probabilities for {filename}: {response.status_code}")
        return [0] * len(emotion_order)  # Return an array of zeros in case of an error

def analyze_pitch_and_volume(audio_path):
    logging.info(f"Analyzing pitch and energy for {audio_path}.")
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

    logging.info(f"Pitch and energy analysis complete for {audio_path}. Avg pitch: {avg_pitch}, Avg energy: {avg_energy}")
    
    return avg_pitch, avg_energy

def preprocess_audio(audio_file_path, keywords):
    logging.info(f"Preprocessing audio for keyword detection: {audio_file_path}")
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file_path) as source:
        audio_data = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio_data)
        keyword_detected = any(keyword in text.lower() for keyword in keywords)
        logging.info(f"Keyword detection complete: {text}, Keyword detected: {keyword_detected}")
    except sr.UnknownValueError:
        logging.warning(f"Could not understand audio: {audio_file_path}")
        text = ""
        keyword_detected = False
    except sr.RequestError as e:
        logging.error(f"Could not request results from Speech Recognition service; {e}")
        text = ""
        keyword_detected = False

    avg_pitch, avg_energy = analyze_pitch_and_volume(audio_file_path)

    return text, keyword_detected, avg_pitch, avg_energy

def process_and_save_to_csv(audio_path, csv_file, keywords):
    logging.info(f"Processing audio file: {audio_path}")
    
    # Convert the audio to WAV if necessary
    if audio_path.endswith('.m4a'):
        audio_path = convert_m4a_to_wav(audio_path)

    # Get emotion probabilities
    emotion_probs = get_emotion_probs(audio_path)

    # Get pitch and energy
    _, keyword_detected, avg_pitch, avg_energy = preprocess_audio(audio_path, keywords)

    # Save the data to a CSV file
    fieldnames = ['filename', 'emotion_probs', 'avg_pitch', 'avg_energy', 'keyword_detected', 'label']
    file_exists = os.path.isfile(csv_file)

    with open(csv_file, mode='a', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)

        if not file_exists:
            writer.writeheader()
            logging.info(f"Created new CSV file: {csv_file}")

        writer.writerow({
            'filename': audio_path,
            'emotion_probs': emotion_probs,
            'avg_pitch': avg_pitch,
            'avg_energy': avg_energy,
            'keyword_detected': keyword_detected,
            'label': ''  # Leave empty for manual input
        })

    logging.info(f"Data for {audio_path} saved to CSV: {csv_file}")

# Example usage
audio_file_path = './audioData/AUD-20240830-WA0011.m4a'
csv_file_path = 'audio_data.csv'
keywords = ['help', 'emergency', 'assist']  # Example keywords

process_and_save_to_csv(audio_file_path, csv_file_path, keywords)
