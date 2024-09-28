import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleLogin = async () => {
    const auth = getAuth(); // Initialize Firebase Auth
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Navigate to Profile Screen after successful login
      navigation.navigate("Home");
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#fff" }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.promptText}>
        New around here?
        <Text style={styles.registerText} onPress={handleRegister}>
          Join us today
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    //backgroundColor: "#F95959",
    backgroundColor: "#F95959", // Match background color to the landing page
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff", // White text to match the landing page
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#fff", // White underline for input fields
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#fff", // White text for input fields
  },
  button: {
    backgroundColor: "#FFB830", // Use the same button color from the landing page
    paddingVertical: 12,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#F95959", // Match button text color to the landing page
    fontWeight: "bold",
    fontSize: 16,
  },
  promptText: {
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
    fontSize: 18,
  },
  registerText: {
    color: "#FFB830", // Highlight the "Register" text in button color
    fontWeight: "bold",
  },
});
