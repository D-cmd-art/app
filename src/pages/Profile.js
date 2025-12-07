import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../utils/store/userStore";
import { useLogout } from "../hooks/useLogin";
import { deleteTokens } from "../utils/tokenStorage";

const Profile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loading state for modal

  const navigation = useNavigation();
  const { user, clear, setUser } = useUserStore();

  const { mutate: logout } = useLogout({
    onSuccess: async () => {
      await deleteTokens();
      setUser(null);
      clear();

      setLoading(false); // 🔥 Hide loading

      // Reset RootStack to Login
      const parent = navigation.getParent();
      if (parent?.reset) {
        parent.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        console.warn("Parent navigator not found");
      }
    },
    onError: (err) => {
      setLoading(false); // ❌ Stop loading on error
      Alert.alert("Logout failed", err.message || "Please try again");
    },
  });

  const handleLogout = () => {
    setLoading(true); // ⏳ Show loading
    logout();
  };

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode ? "light-content" : "dark-content"}
      />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.headerBg,
            paddingTop:
              Platform.OS === "android"
                ? StatusBar.currentHeight + 12
                : 50,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
          <Icon name="user" size={45} color={theme.primary} />
        </View>
        <Text style={[styles.name, { color: theme.headerText }]}>
          {user?.name || "Guest"}
        </Text>
        <Text style={[styles.date, { color: theme.headerText }]}>
          {formattedDate}
        </Text>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section title="General" theme={theme}>
          <MenuItem
            icon="user"
            label="Profile"
            theme={theme}
            onPress={() => navigation.navigate("ProfileDetails")}
          />
          <MenuItem
            icon="first-order"
            label="Order History"
            theme={theme}
            onPress={() => navigation.navigate("Order")}
          />

          <View style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <View style={styles.menuLeft}>
              <Icon name="moon" size={18} color={theme.icon} />
              <Text style={[styles.menuText, { color: theme.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </Section>

        <Section title="Help & Support" theme={theme}>
          <MenuItem
            icon="question-circle"
            label="Help & Support"
            theme={theme}
            onPress={() => navigation.navigate("HelpAndSupport")}
          />
          <MenuItem
            icon="info-circle"
            label="About Us"
            theme={theme}
            onPress={() => navigation.navigate("Aboutus")}
          />
          <MenuItem
            icon="file-contract"
            label="Terms & Conditions"
            theme={theme}
            onPress={() => navigation.navigate("TermsAndConditions")}
          />
          <MenuItem
            icon="lock"
            label="Privacy Policy"
            theme={theme}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />
        </Section>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.danger }]}
          onPress={handleLogout}
        >
          <Icon name="sign-out-alt" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 🔥 Full Screen Loading Overlay */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#ee1212ff" />
            <Text style={styles.loadingText}>Logging out...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ------------------------------ COMPONENTS ------------------------------ */

const Section = React.memo(({ title, children, theme }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.accent }]}>{title}</Text>
    {children}
  </View>
));

const MenuItem = React.memo(({ icon, label, theme, onPress }) => (
  <TouchableOpacity
    style={[styles.menuItem, { backgroundColor: theme.card }]}
    onPress={onPress}
  >
    <View style={styles.menuLeft}>
      <Icon name={icon} size={18} color={theme.icon} />
      <Text style={[styles.menuText, { color: theme.text }]}>{label}</Text>
    </View>
  </TouchableOpacity>
));

/* ------------------------------ THEMES ------------------------------ */

const lightTheme = {
  bg: "#f7f7f7",
  card: "#fff",
  text: "#222",
  icon: "#da0808e8",
  accent: "#da0808e8",
  headerBg: "#da0808e8",
  headerText: "#fff",
  avatarBg: "#fff",
  primary: "#da0808e8",
  danger: "#da0808e8",
};

const darkTheme = {
  bg: "#121212",
  card: "#1e1e1e",
  text: "#eee",
  icon: "#ccc",
  accent: "#ff0000ff",
  headerBg: "#e01616ff",
  headerText: "#fff",
  avatarBg: "#fd0505ff",
  primary: "#90caf9",
  danger: "#e53935",
};

/* ------------------------------ STYLES ------------------------------ */
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: { fontSize: 20, fontWeight: "700" },
  date: { fontSize: 13, opacity: 0.9 },

  scrollContent: { paddingBottom: 80, paddingTop: 10 },

  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 10 },

  menuItem: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { fontSize: 15, marginLeft: 12, fontWeight: "500" },

  logoutBtn: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 35,
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  /* 🔥 Loading Screen */
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
});

export default Profile;
