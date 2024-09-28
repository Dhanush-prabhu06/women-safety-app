import React, { useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail, // Fetch sign-in methods for email existence check
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firestore functions
import Input from "../components/Input";
import { auth } from "../../configure"; // Import initialized auth
import { app } from "../../configure"; // Import initialized app

// Initialize Firestore database
const firestore = getFirestore(app);

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [trustedPerson1, setTrustedPerson1] = useState({
    name: "",
    gender: "",
    phone: "",
  });
  const [trustedPerson2, setTrustedPerson2] = useState({
    name: "",
    gender: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // Expects a 10-digit number
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!gender) newErrors.gender = "Gender is required.";
    if (!email || !validateEmail(email))
      newErrors.email = "Valid email is required.";
    if (!phone || !validatePhone(phone))
      newErrors.phone = "Valid 10-digit phone number is required.";
    if (!password) newErrors.password = "Password is required.";

    // Trusted Person 1 validations
    if (!trustedPerson1.name.trim())
      newErrors.trustedPerson1Name = "Trusted Person 1 name is required.";
    if (!trustedPerson1.gender)
      newErrors.trustedPerson1Gender = "Trusted Person 1 gender is required.";
    if (!trustedPerson1.phone || !validatePhone(trustedPerson1.phone))
      newErrors.trustedPerson1Phone =
        "Valid Trusted Person 1 phone number is required.";

    // Trusted Person 2 validations
    if (!trustedPerson2.name.trim())
      newErrors.trustedPerson2Name = "Trusted Person 2 name is required.";
    if (!trustedPerson2.gender)
      newErrors.trustedPerson2Gender = "Trusted Person 2 gender is required.";
    if (!trustedPerson2.phone || !validatePhone(trustedPerson2.phone))
      newErrors.trustedPerson2Phone =
        "Valid Trusted Person 2 phone number is required.";

    // Check if Trusted Person 1 and 2 details are identical
    if (
      trustedPerson1.name.trim() === trustedPerson2.name.trim() &&
      trustedPerson1.phone.trim() === trustedPerson2.phone.trim() &&
      trustedPerson1.gender === trustedPerson2.gender
    ) {
      newErrors.trustedPersonDuplicate =
        "Trusted Person 1 and 2 cannot be the same.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Function to check if email already exists
  const checkEmailExists = async () => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        // Email already exists
        Alert.alert(
          "Account Exists",
          "This email is already registered. Please log in."
        );
        navigation.navigate("Login"); // Navigate to Login screen
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert("Error", error.message);
      return false;
    }
  };

  // Function to handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Registration Failed", "Please correct the errors.");
      return;
    }

    // Check if the email already exists
    if (await checkEmailExists()) {
      try {
        // Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Save user details to Firestore
        await setDoc(doc(firestore, "users", user.uid), {
          name,
          gender,
          email,
          phone,
          trustedPersons: [
            {
              name: trustedPerson1.name,
              gender: trustedPerson1.gender,
              phone: trustedPerson1.phone,
            },
            {
              name: trustedPerson2.name,
              gender: trustedPerson2.gender,
              phone: trustedPerson2.phone,
            },
          ],
        });

        Alert.alert("Registration Successful");
        navigation.replace("Home");
      } catch (error) {
        Alert.alert("Registration Failed", "Please try again later.");
        console.log(error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* User Details */}
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input}/>

        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.pickerContainer}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>

        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        <TextInput
          placeholder="Phone Number"
          keyboardType="phone-pad" // This will display the number pad
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />

        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {/* Trusted Person 1 */}
        {errors.trustedPerson1Name && (
          <Text style={styles.errorText}>{errors.trustedPerson1Name}</Text>
        )}
        <TextInput
          placeholder="Trusted Person 1 Name"
          value={trustedPerson1.name}
          onChangeText={(text) =>
            setTrustedPerson1({ ...trustedPerson1, name: text })
          }
          style={styles.input}
        />

        {errors.trustedPerson1Gender && (
          <Text style={styles.errorText}>{errors.trustedPerson1Gender}</Text>
        )}
        <Picker
          selectedValue={trustedPerson1.gender}
          onValueChange={(itemValue) =>
            setTrustedPerson1({ ...trustedPerson1, gender: itemValue })
          }
          style={styles.pickerContainer}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        {errors.trustedPerson1Phone && (
          <Text style={styles.errorText}>{errors.trustedPerson1Phone}</Text>
        )}
        <TextInput
          placeholder="Trusted Person 1 Phone"
          value={trustedPerson1.phone}
          keyboardType="phone-pad"
          onChangeText={(text) =>
            setTrustedPerson1({ ...trustedPerson1, phone: text })
          }
          style={styles.input}
        />

        {/* Trusted Person 2 */}
        {errors.trustedPerson2Name && (
          <Text style={styles.errorText}>{errors.trustedPerson2Name}</Text>
        )}
        <TextInput
          placeholder="Trusted Person 2 Name"
          value={trustedPerson2.name}
          onChangeText={(text) =>
            setTrustedPerson2({ ...trustedPerson2, name: text })
          }
          style={styles.input}
        />

        {errors.trustedPerson2Gender && (
          <Text style={styles.errorText}>{errors.trustedPerson2Gender}</Text>
        )}
        <Picker
          selectedValue={trustedPerson2.gender}
          onValueChange={(itemValue) =>
            setTrustedPerson2({ ...trustedPerson2, gender: itemValue })
          }
          style={styles.pickerContainer}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        {errors.trustedPerson2Phone && (
          <Text style={styles.errorText}>{errors.trustedPerson2Phone}</Text>
        )}
        <TextInput
          placeholder="Trusted Person 2 Phone"
          value={trustedPerson2.phone}
          keyboardType="phone-pad"
          onChangeText={(text) =>
            setTrustedPerson2({ ...trustedPerson2, phone: text })
          }
          style={styles.input}
        />

        {errors.trustedPersonDuplicate && (
          <Text style={styles.errorText}>{errors.trustedPersonDuplicate}</Text>
        )}

        <TouchableOpacity title="Register" onPress={handleRegister} style={styles.button} >
        <Text style={styles.buttonText}>
          Register
        </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor:"#FF5A5F",
    padding: 20,
  },
  errorText: {
    color: "white",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#fff", // White underline for input fields
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "black", // White text for input fields
  },
  button: {
    backgroundColor: "white", // Use the same button color from the landing page
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
  pickerContainer: {
    height: 40,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    marginBottom: 15,
    
  },
});

export default RegisterScreen;
