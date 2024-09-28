import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DialerScreen = ({ navigation }) => {
  const emergencyNumbers = [
    { number: '112', name: 'General Emergency' },
    { number: '101', name: 'Police' },
    { number: '102', name: 'Fire' },
    { number: '108', name: 'Ambulance' },
  ];

  const handleEmergencyCall = (number, name) => {
    Alert.alert(
      'Emergency Call',
      `Are you sure you want to call ${name} (${number})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Services</Text>
      <View style={styles.buttonContainer}>
        {emergencyNumbers.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => handleEmergencyCall(item.number, item.name)}
          >
            <Ionicons name="call" size={24} color="white" />
            <Text style={styles.buttonText}>{item.name}</Text>
            <Text style={styles.buttonNumber}>{item.number}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.disclaimer}>
        Please only use these numbers in case of a genuine emergency.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5A5F',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  buttonNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default DialerScreen;