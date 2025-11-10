import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Dimensions,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import validatePhoneNumber from "nepali-phone-number-validator";
import { useLogin } from "../hooks/useLogin";
import { jwtDecode } from "jwt-decode";
import { useUserStore } from "../utils/store/userStore";
import Icon from "react-native-vector-icons/FontAwesome5";
import {saveTokens} from "../utils/tokenStorage"
const { width } = Dimensions.get("window");

const LoginSchema = Yup.object().shape({
  emailorphone: Yup.string()
    .test(
      "is-valid",
      "Enter a valid Nepali phone number or email",
      (val) =>
        !!val &&
        (validatePhoneNumber(val.replace(/^(\+977|00977)/, "")) ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
    )
    .required("Phone number or email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  remember: Yup.boolean(),
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setUser } = useUserStore();
  const { mutate } = useLogin(); // Removed isLoading from here, we’ll handle manually

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Local state for spinner

  const handleLogin = (values, { resetForm }) => {
    const { emailorphone, password } = values;
    setLoading(true); // 🔄 Start spinner

    mutate(
      { emailorphone, password },
      {
        onSuccess: async(resData) => {
          const accessToken = resData.accessToken;
          const refreshToken=resData.refreshToken;
         await  saveTokens(accessToken,refreshToken)
          const user = jwtDecode(accessToken);
          setUser(user);
          resetForm();
          setLoading(false); // ✅ Stop spinner
        },
        onError: (error) => {
          const msg =
            error.response?.data?.error || error.message || "Login failed";
            console.log(msg);
          Alert.alert("Login Failed try again");
          setLoading(false); // ❌ Stop spinner on error
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.header}>Bhok Express</Text>
          <Text style={styles.header1}>Login</Text>

          <Formik
            initialValues={{ emailorphone: "", password: "", remember: false }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View style={styles.form}>
                {/* Email or Phone */}
                <View style={styles.fieldContainer}>
                  <TextInput
                    placeholder="Email or Phone Number"
                    placeholderTextColor="#666"
                    value={values.emailorphone}
                    onChangeText={handleChange("emailorphone")}
                    onBlur={handleBlur("emailorphone")}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.emailorphone && touched.emailorphone && (
                    <Text style={styles.error}>{errors.emailorphone}</Text>
                  )}
                </View>

                {/* Password */}
                <View style={styles.fieldContainer}>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#666"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry={!showPassword}
                      style={[styles.input, { flex: 1 }]}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showPassword ? "eye-slash" : "eye"}
                        size={18}
                        color="#666"
                      />
                    </Pressable>
                  </View>
                  {errors.password && touched.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.rememberContainer}>
                  <Switch
                    value={values.remember}
                    onValueChange={(val) => setFieldValue("remember", val)}
                  />
                  <Text style={styles.rememberText}>Remember me</Text>
                  <Pressable
                    onPress={() => navigation.navigate("Forget")}
                  >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                </View>

                {/* Login Button */}
                <Pressable
                  onPress={handleSubmit}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </Pressable>

                {/* Register */}
                <Pressable
                  onPress={() => navigation.navigate("Register")}
                  style={({ pressed }) => [
                    pressed && { opacity: 0.6 },
                    { marginTop: 20 },
                  ]}
                >
                  <Text style={styles.registerText}>
                    New here?{" "}
                    <Text style={styles.registerLink}>Register now</Text>
                  </Text>
                </Pressable>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  scrollView: { flexGrow: 1, justifyContent: "center" },
  container: {
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    ...Platform.select({ android: { elevation: 5 } }),
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#92400e",
    marginBottom: 2,

  },
  header1: {
    fontSize: 22,
    fontWeight: "600",
textAlign: "center",
    color: "#92400e",
    marginBottom: 2,
  },
  form: { width: "100%" },
  fieldContainer: { marginBottom: 16 },
  input: {
    backgroundColor: "#f9fafb",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: width < 360 ? 14 : 16,
    color: "#000",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingRight: 10,
  },
  eyeIcon: { paddingHorizontal: 8 },
  error: { color: "#d9534f", marginTop: 4, fontSize: 12 },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rememberText: { fontSize: 14, color: "#333" },
  forgotText: {
    fontSize: 14,
    color: "#d6336c",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#92400e",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  registerText: {
    textAlign: "center",
    color: "#6c757d",
    fontSize: 14,
  },
  registerLink: { color: "#92400e", fontWeight: "600" },
});
