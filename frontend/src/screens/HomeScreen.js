import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SOSButton from "../components/SOSButton";

export default function HomeScreen({ navigation }) {
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
    } catch (error) {
      console.error("Failed to send call alert:", error);
      Alert.alert("Error", "Failed to send call alert. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Having an Emergency?</Text>
      <Text style={styles.subtitle}>
        Tap the SOS button to alert the emergency services.
      </Text>
      <SOSButton onPress={handleSOSPress} />

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.button}
        >
          <Ionicons name="home" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("NightSupport")}
          style={styles.button}
        >
          <Ionicons name="moon" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>Night Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("service")}
          style={styles.button}
        >
          <Ionicons name="settings-sharp" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("dialer")}
          style={styles.button}
        >
          <Ionicons name="call" size={24} color="#FF5A5F" />
          <Text style={styles.buttonText}>dialer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.button}
        >
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
