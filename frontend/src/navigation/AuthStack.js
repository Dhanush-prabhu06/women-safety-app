// src/navigation/AuthStack.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import Landing from "../screens/LandingScreen";
import HomeScreen from "../screens/HomeScreen";
import NightSupportScreen from "../screens/NightSupportScreen";
import ProfileScreen from "../screens/ProfileScreen";
import serviceScreen from "../screens/serviceScreen";
import control from "../screens/control";
import DialerScreen from "../screens/DialerScreen";
import Temp from "../screens/HomeTemp";
const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Landing"
        component={Landing}
        options={{ headerShown: false }} // Hide header for Landing page
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="NightSupport" component={NightSupportScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="service" component={serviceScreen} />
      <Stack.Screen name="cont" component={control} />
      <Stack.Screen name="dialer" component={DialerScreen} />
      <Stack.Screen name="homeTemp" component={Temp} />
    </Stack.Navigator>
  );
};

export default AuthStack;
