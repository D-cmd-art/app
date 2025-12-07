// RegistrationScreen.jsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRegister } from "../hooks/useRegister";
import { useUserStore } from "../utils/store/userStore";
import {jwtDecode} from "jwt-decode";
import { saveTokens } from "../utils/tokenStorage";

const { width } = Dimensions.get("window");

const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, "Invalid phone number")
    .required("Phone number is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const LoadingOverlay = ({ visible }) => (
  <Modal transparent animationType="fade" visible={visible}>
    <View style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#92400e" />
        <Text style={{ marginTop: 10, color: "#92400e", fontWeight: "600" }}>Registering...</Text>
      </View>
    </View>
  </Modal>
);

export default function RegistrationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setUser } = useUserStore();
  const { mutate } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };

  const handleRegister = (values, { resetForm }) => {
    const { name, email, phone, password } = values;

    setLoading(true);

    mutate(
      { name, email, phone, password },
      {
        onSuccess: async (resData) => {
          try {
            const { accessToken, refreshToken } = resData;
            await saveTokens(accessToken, refreshToken);
            const user = jwtDecode(accessToken);
            setUser(user);

            resetForm();
            Alert.alert("Success", `Welcome ${user.name || "User"}!`);
           navigation.getParent()?.replace("App");
          } catch (err) {
            console.error("Registration post-processing error:", err);
            Alert.alert("Error", "Something went wrong after registration.");
          } finally {
            setLoading(false);
          }
        },
        onError: (error) => {
          const msg = error?.response?.data?.error || error.message || "Registration failed";
          Alert.alert("Error", msg);
          setLoading(false);
        },
      }
    );
  };

  const LoadingButton = ({ onPress, loading, title }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        loading && { opacity: 0.7 },
      ]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <Image
            source={require("../assets/applogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.header}>Create Your Account</Text>

          <Formik
            initialValues={initialValues}
            validationSchema={SignupSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                {[
                  { field: "name", placeholder: "Full Name", icon: "user" },
                  { field: "email", placeholder: "Email Address", icon: "envelope" },
                  { field: "phone", placeholder: "Phone Number", icon: "phone" },
                ].map(({ field, placeholder, icon }) => (
                  <View key={field} style={styles.fieldContainer}>
                    <View style={styles.inputWrapper}>
                      <Icon name={icon} size={16} color="#999" style={{ marginRight: 10 }} />
                      <TextInput
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        onChangeText={handleChange(field)}
                        onBlur={handleBlur(field)}
                        value={values[field]}
                        keyboardType={field === "phone" ? "phone-pad" : "default"}
                        style={styles.input}
                        autoCapitalize="none"
                      />
                    </View>
                    {errors[field] && touched[field] && (
                      <Text style={styles.error}>{errors[field]}</Text>
                    )}
                  </View>
                ))}

                {[
                  { field: "password", placeholder: "Password" },
                  { field: "confirmPassword", placeholder: "Confirm Password" },
                ].map(({ field, placeholder }) => (
                  <View key={field} style={styles.fieldContainer}>
                    <View style={styles.inputWrapper}>
                      <Icon name="lock" size={16} color="#999" style={{ marginRight: 10 }} />
                      <TextInput
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        onChangeText={handleChange(field)}
                        onBlur={handleBlur(field)}
                        value={values[field]}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ paddingHorizontal: 5 }}
                      >
                        <Icon
                          name={showPassword ? "eye-slash" : "eye"}
                          size={16}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors[field] && touched[field] && (
                      <Text style={styles.error}>{errors[field]}</Text>
                    )}
                  </View>
                ))}

                <LoadingButton
                  onPress={handleSubmit}
                  loading={loading}
                  title="Register Now"
                />
              </View>
            )}
          </Formik>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={({ pressed }) => [
              styles.loginContainer,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.loginText}>
              Already registered?{" "}
              <Text style={styles.loginLink}>Login now</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f8fa" },
  scrollView: { flexGrow: 1, justifyContent: "center" },
  container: { paddingHorizontal: 24, backgroundColor: "#f7f8fa" },
  logo: { width: 200, height: 150, alignSelf: "center" },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#fd0000ff",
  },
  form: { width: "100%" },
  fieldContainer: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: width < 360 ? 14 : 16,
    color: "#4d2828ff",
  },
  error: { color: "#d9534f", marginTop: 4, fontSize: 12 },
  button: {
    backgroundColor: "#ee1212ff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#ee1212ff",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loginContainer: { marginTop: 20 },
  loginText: { textAlign: "center", color: "#6c757d", fontSize: 14 },
  loginLink: { color: "#ee1212ff", fontWeight: "600" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: "center",
  },
});
