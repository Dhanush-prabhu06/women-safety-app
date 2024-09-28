import os
import numpy as np
import librosa
import torch
import requests
import asyncio
import aiofiles
from pydub import AudioSegment
from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
import concurrent.futures
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
from tensorflow.keras.models import load_model
import logging
import speech_recognition as sr

from flask_socketio import SocketIO, emit

# Configure logging to show only errors
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

# /send-call

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = "..."
client = Client(account_sid, auth_token)

# Load the trained help detection model
try:
    help_detection_model = load_model('help_detection_model.h5')
except Exception as e:
    logger.error(f'Error loading model: {str(e)}')
    raise

# Load the Wav2Vec2 model and feature extractor once
# model_name = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
# model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)
# feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flask server is running!'})

def send_call():
    try:
        live_location = "https://disp-map.vercel.app/"
        twiml = VoiceResponse()
        twiml.say(voice='alice', message='Hello! Your friend might be in big trouble. Please check the SMS message.')

        call = client.calls.create(
            twiml=twiml,
            to='+917483523450',
            from_='+16122844698'
        )
        logger.error(f'Call initiated. Call SID: {call.sid}')

        call = client.calls.create(
            twiml=twiml,
            to='+916361304218',
            from_='+16122844698'
        )

        # call = client.calls.create(
        #     twiml=twiml,
        #     to='112',
        #     from_='+16122844698'
        # )

        # call = client.calls.create(
        #     twiml=twiml,
        #     to='{control}',
        #     from_='+16122844698'
        # )

        logger.error(f'Call initiated. Call SID: {call.sid}')

    except Exception as e:
        logger.error(f'Failed to send call alert: {str(e)}')

def send_sms():
    try:
        live_location = "https://disp-map.vercel.app/"

        client.messages.create(
            from_='+16122844698',
            to='+917483523450',
            body=f'Your friend is in big trouble, please check out the link: {live_location}'
        )
        logger.error('SMS alert sent successfully.')

        client.messages.create(
            from_='+16122844698',
            to='+916361304218',
            body=f'Your friend is in big trouble, please check out the link: {live_location}'
        )

        # client.messages.create(
        #     from_='+16122844698',
        #     to='+916361304218',
        #     body=f'Your friend is in big trouble, please check out the link: {live_location}'
        # )

        # client.messages.create(
        #     from_='+16122844698',
        #     to='{control}',
        #     body=f'Your friend is in big trouble, please check out the link: {live_location}'
        # )
        logger.error('SMS alert sent successfully.')

    except Exception as e:
        logger.error(f'Failed to send SMS alert: {str(e)}')



@app.route('/send-call', methods=['POST'])
def send_call_endpoint():
    try:
        send_call()
        send_sms()
        return jsonify({'message': 'Call and SMS initiated successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/send-sms', methods=['POST'])
def send_sms_endpoint():
    try:
        send_sms()
        return jsonify({'message': 'SMS sent successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# Asynchronous Twilio SMS function
async def async_send_sms():
    try:
        live_location = "https://disp-map.vercel.app/"
        await client.messages.create(
            from_='+16122844698',
            to='+917483523450',
            body=f'Your friend is in big trouble, please check out the link: {live_location}'
        )

        await client.messages.create(
            from_='+16122844698',
            to='+916361304218',
            body=f'Your friend is in big trouble, please check out the link: {live_location}'
        )
    except Exception as e:
        logger.error(f'Failed to send SMS alert: {str(e)}')

# Asynchronous Twilio call function
async def async_send_call():
    try:
        live_location = "https://disp-map.vercel.app/"
        twiml = VoiceResponse()
        twiml.say(voice='alice', message='Hello! Your friend might be in big trouble. Please check the SMS message.')

        await client.calls.create(
            twiml=twiml,
            to='+917483523450',
            from_='+16122844698'
        )
        await client.calls.create(
            twiml=twiml,
            to='+916361304218',
            from_='+16122844698'
        )
    except Exception as e:
        logger.error(f'Failed to send call alert: {str(e)}')

@app.route('/send-alerts', methods=['POST'])
async def send_alerts():
    try:
        await asyncio.gather(async_send_sms(), async_send_call())
        return jsonify({'message': 'Alerts sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

###########################################################################################################

alert_cancelled = False
call_initiated = False

@app.route('/confirm-call', methods=['POST'])
def confirm_call():
    global call_initiated
    if not call_initiated:
        try:
            call_initiated = True
            asyncio.run(send_alerts())
            return jsonify({'message': 'Call and SMS initiated successfully.'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'message': 'Call already initiated.'}), 200

@app.route('/cancel-call', methods=['POST'])
def cancel_call():
    global call_initiated
    call_initiated = False
    logger.error("The SOS detection retrived")
    return jsonify({'message': 'Call initiation canceled.'}), 200


##########################################################################################################

@app.route('/predict', methods=['POST'])
def predict():
    print("Hit predict")
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        original_file_path = os.path.join('uploads', file.filename)

        # Save file asynchronously
        async def save_file():
            async with aiofiles.open(original_file_path, 'wb') as f:
                await f.write(file.read())
        asyncio.run(save_file())

        if file.filename.endswith('.3gp'):
            audio = AudioSegment.from_file(original_file_path, format='3gp')
            wav_file_path = original_file_path.replace('.3gp', '.wav')
            audio.export(wav_file_path, format='wav')
        else:
            wav_file_path = original_file_path

        # Run preprocessing and emotion recognition in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            # Submit tasks for parallel processing
            preprocess_future = executor.submit(preprocess_audio, wav_file_path)
            emotion_future = executor.submit(get_emotion_probs, wav_file_path)

            # Wait for results
            text, keyword_detected, avg_pitch, avg_energy = preprocess_future.result()
            emotion_response = emotion_future.result()

        if isinstance(emotion_response, list) and len(emotion_response) > 0:
            emotion_probs = np.array([emotion['score'] for emotion in emotion_response], dtype=np.float32)
            emotion_probs = emotion_probs.reshape(1, -1)

            if emotion_probs.shape[1] < 8:
                padding = np.zeros((1, 8 - emotion_probs.shape[1]), dtype=np.float32)
                emotion_probs = np.concatenate([emotion_probs, padding], axis=1)
        else:
            return jsonify({'error': 'Invalid or empty response from Hugging Face API'}), 500

        # Prepare the inputs for the Keras help detection model
        keyword_input = np.array([[int(keyword_detected)]], dtype=np.float32)
        pitch_input = np.array([[avg_pitch]], dtype=np.float32)
        energy_input = np.array([[avg_energy]], dtype=np.float32)
        emotion_probs = emotion_probs.astype(float)

        if keyword_detected:
            # Use the Keras model for prediction
            prediction = help_detection_model.predict([keyword_input, pitch_input, energy_input, emotion_probs])
            label = (prediction > 0.5).astype(int)[0][0]
            result = "Help" if label == 1 else "No Help"
            logger.error(f"Help detection result: {result}")

            if result == "Help":
                # asyncio.run(send_alerts())
                asyncio.run(trigger_start_prediction())
        else:
            result = "No keyword detected. The audio indicates 'No Help'."
            logger.error("Help detection result: No Help (No keyword detected)")

        os.remove(original_file_path)
        if original_file_path != wav_file_path:
            os.remove(wav_file_path)

        return jsonify({
            'text': text,
            'keyword_detected': keyword_detected,
            'avg_pitch': float(avg_pitch),
            'avg_energy': float(avg_energy),
            'emotion_probs': emotion_probs.tolist(),
            'result': result
        })

    except Exception as e:
        logger.error(f'An error occurred during processing: {str(e)}')
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500

#############################################################################################################################################

# Define the function to trigger prediction in the app
def trigger_start_prediction():
    socketio.emit('start_prediction', {'message': 'Start prediction triggered due to Help detection'})


##################################################################################################################################################
def preprocess_audio(audio_file_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file_path) as source:
        audio_data = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio_data)
        keyword_detected = detect_keywords(text)
        
    except sr.UnknownValueError:
        text = ""
        keyword_detected = False
    except sr.RequestError as e:
        text = ""
        keyword_detected = False

    avg_pitch, avg_energy = analyze_pitch_and_volume(audio_file_path)
    return text, keyword_detected, avg_pitch, avg_energy

def detect_keywords(text):
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

def get_emotion_probs(filename):
    try:
        # Load and preprocess the audio file
        audio, sample_rate = librosa.load(filename, sr=16000)  # Resample to 16kHz
        inputs = feature_extractor(audio, sampling_rate=sample_rate, return_tensors="pt", padding=True)

        # Forward pass to get logits
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits

        # Apply softmax to convert logits to probabilities
        probs = torch.nn.functional.softmax(logits, dim=-1)
        emotion_probs = probs[0].cpu().numpy()  # Extract probabilities for each emotion

        # Define the emotion labels based on the model's output
        emotion_labels = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']

        # Map the probabilities to corresponding emotions
        emotion_results = [{'label': emotion_labels[i], 'score': float(emotion_probs[i])} for i in range(len(emotion_probs))]

        return emotion_results

    except Exception as e:
        logger.error(f'Error during local emotion recognition: {str(e)}')
        raise

# Define a list of keywords and phrases for help detection
keywords = [
    "help", "emergency", "assist", "danger", "scream", "rescue", "save me", "trouble", "call 911",
    "need help", "need assistance", "I'm in danger", "can't breathe", "can't move", "someone help",
    "help me", "get me out", "I'm trapped", "I'm hurt", "I'm injured", "can't escape", 
    "please help", "come quickly", "I'm in trouble", "call for help", "it's an emergency", 
    "I'm scared", "something's wrong", "get help", "I'm lost", "lost", "where am I", 
    "find me", "I'm bleeding", "need medical help", "send help", "is anyone there", "is anyone around",
    "can someone hear me", "help needed", "urgent help", "can't find my way", "I need help", 
    "please assist", "there's a problem", "immediate help", "get the police", "get the doctor", 
    "send an ambulance", "urgent", "come quickly", "it's urgent", "get me out of here", 
    "I'm stuck", "I'm being followed", "I'm being attacked", "dangerous situation", "emergency situation",
    "can't see", "can't hear", "I'm blind", "I'm deaf", "can't feel my legs", "I'm scared", 
    "I need help immediately", "something's wrong", "help now", "please come", "it's a life or death situation",
    "I think I'm in danger", "emergency help needed", "I'm in serious trouble", "immediate assistance required"
]

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)