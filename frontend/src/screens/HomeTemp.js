import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SOSButton from "../components/SOSButton";
import { Camera, CameraType } from 'expo-camera/legacy';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../configure'; 
import * as MediaLibrary from 'expo-media-library';

export default function Temp({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = Camera.useMicrophonePermissions();
  const cameraRef = useRef(null); 

  if (!cameraPermission || !microphonePermission) {
    return <View />;
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to access the camera and microphone.</Text>
        <Button onPress={() => { requestCameraPermission(); requestMicrophonePermission(); }} title="Grant permission" />
      </View>
    );
  }

  const uploadVideoToFirebase = async (uri) => {
    try {
      console.log('Video URI:', uri); 

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Media Library permission not granted');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      const videoAsset = await MediaLibrary.getAssetInfoAsync(asset);

      const response = await fetch(videoAsset.localUri || uri); 
      if (!response.ok) {
        throw new Error('Failed to fetch the video file');
      }
      const blob = await response.blob();

      const videoRef = ref(storage, `videos/video_${Date.now()}.mp4`);

      const uploadTask = uploadBytesResumable(videoRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('Upload failed:', error.code, error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
          });
        }
      );

      stopRecording();
    } catch (error) {
      console.error('Error uploading video to Firebase:', error);
    }
  };

  const handleSOSPress = async () => {
    console.log("SOS Clicked");
    try {
        const response = await fetch("http://10.1.6.189:5000/send-call", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log("Call initiated:", result);
        Alert.alert(
          "Alert Sent",
          "A call has been initiated to notify emergency services."
        );
    }catch (error){
        console.error("Failed to send call alert:", error);
        Alert.alert("Error", "Failed to send call alert. Please try again.");
    }
    await startRecording();
  };

  const startRecording = async () => {
    console.log('Attempting to start recording...');

    if (cameraRef.current) {
      try {
        if (!isRecording) { 
          console.log('Starting recording...');
          setIsRecording(true);
          // Start recording with maxDuration set to 5 seconds
          const video = await cameraRef.current.recordAsync({ maxDuration: 5 });
          console.log('Recording started:', video.uri);
          await uploadVideoToFirebase(video.uri);
        } else {
          console.log('Recording is already in progress');
        }
      } catch (e) {
        console.error('Failed to start recording:', e);
      }
    } else {
      console.error('Camera reference is not set');
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Having an Emergency?</Text>
      <Text style={styles.subtitle}>
        Tap the SOS button to alert the emergency services.
      </Text>
      <SOSButton onPress={handleSOSPress} />

      <Camera
        style={{ width: '1%', height: '1%' }} 
        type={type}
        ref={cameraRef}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.button}>
          <Ionicons name="home" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("NightSupport")} style={styles.button}>
          <Ionicons name="moon" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>Night Support</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.button}>
          <Ionicons name="person" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 80,
    color: "#333",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  button: {
    alignItems: "center",
  },
  buttonText: {
    marginTop: 4,
    color: "#FF5A5F",
  },
});
