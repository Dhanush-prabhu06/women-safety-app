import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Linking, Alert } from 'react-native';

const contacts = [
  { city: 'Bengaluru Urban', number: '080-2222 1222' },
  { city: 'Bengaluru Rural', number: '080-2972 1519' },
  { city: 'Bagalkot', number: '08354-235 360' },
  { city: 'Ballari', number: '08392-244 744' },
  { city: 'Belagavi', number: '0831-240 5201' },
  { city: 'Bidar', number: '08482-228 971' },
  { city: 'Chamarajanagar', number: '08226-222 022' },
  { city: 'Chikkaballapur', number: '08156-270 550' },
  { city: 'Chikkamagaluru', number: '08262-222 435' },
  { city: 'Chitradurga', number: '08194-222 811' },
  { city: 'Dakshina Kannada (Mangalore)', number: '0824-222 0588' },
  { city: 'Davanagere', number: '08192-234 640' },
  { city: 'Dharwad', number: '0836-223 3840' },
  { city: 'Gadag', number: '08372-237 300' },
  { city: 'Hassan', number: '08172-267 345' },
  { city: 'Haveri', number: '08375-249 088' },
  { city: 'Kalaburagi', number: '08472-278 601' },
  { city: 'Kodagu', number: '08272-225 500 (WhatsApp: +91 85500 01077)' },
  { city: 'Kolar', number: '08152-243 666' },
  { city: 'Koppal', number: '08539-220 844' },
  { city: 'Mandya', number: '08232-224 600' },
  { city: 'Mysore', number: '0821-244 4800' },
  { city: 'Raichur', number: '08532-226 600' },
  { city: 'Ramanagara', number: '080-2727 0155' },
  { city: 'Shivamogga', number: '08182-271 101' },
  { city: 'Tumakuru', number: '0816-227 4900' },
  { city: 'Udupi', number: '0820-257 4802' },
  { city: 'Uttara Kannada (Karwar)', number: '08382-226 430' },
  { city: 'Vijayapura (Bijapur)', number: '08352-250 214' },
  { city: 'Yadgir', number: '08473-252 222' },
];

const Control = () => {
  const openDialPad = (number) => {
    const phoneNumber = `tel:${number}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'Unable to open dialer');
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency Contacts</Text>
      <ScrollView style={styles.scrollView}>
        {contacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactItem}
            onPress={() => openDialPad(contact.number)}
            activeOpacity={0.7} // Button press effect
          >
            <Text style={styles.cityText}>{contact.city}:</Text>
            <Text style={styles.numberText}>{contact.number}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#EAF0F1',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF5A5F',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    marginBottom: 20,
  },
  contactItem: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3A47',
  },
  numberText: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
});

export default Control;
