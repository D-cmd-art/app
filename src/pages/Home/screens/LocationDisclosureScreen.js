import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function LocationDisclosureScreen() {
  const navigation = useNavigation();

  const handleAgree = async () => {
    await AsyncStorage.setItem("location_disclosure_accepted", "true");
    navigation.replace("Login"); // go to your login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Permission Required</Text>

      <Text style={styles.text}>
        Bhok Express collects location data to enable live order tracking and
        delivery updates even when the app is closed or not in use.
      </Text>

      <Text style={styles.text}>
        This data is used only for providing delivery services and is not shared
        with third parties.
      </Text>

      <Pressable style={styles.button} onPress={handleAgree}>
        <Text style={styles.buttonText}>Agree & Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#ee1212ff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
