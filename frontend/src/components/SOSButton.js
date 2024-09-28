import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

export default function SOSButton({ onPress }) {
  return (
    <View style={styles.outerButtonCircle}>
      <TouchableOpacity style={styles.emergencyButton} onPress={onPress}>
        <View style={styles.innerButtonCircle}>
          <Text style={styles.text}>SOS</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerButtonCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    borderColor: "#ff7777",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emergencyButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ff5555",
    justifyContent: "center",
    alignItems: "center",
  },
  innerButtonCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#ff7777",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});
