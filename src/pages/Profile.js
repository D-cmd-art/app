import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../utils/store/userStore";
import { useLogout } from "../hooks/useLogin";
import { deleteTokens } from "../utils/tokenStorage"; // adjust path as needed

const Profile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation();
  const { user, clear, setUser } = useUserStore();
 
const { mutate: logout } = useLogout({
  onSuccess: async () => {
    await deleteTokens(); // Clear secure tokens
    setUser(null);
    clear();
  },
  onError: (err) => {
    console.log("Logout error:", err);
  },
});

  const handleLogout = () => logout();

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Make status bar blend with header */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode ? "light-content" : "light-content"}
      />

      {/* Header Section */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.headerBg,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
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

      {/* Scrollable Content */}
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
            icon="map-marker-alt"
            label="My Address"
            theme={theme}
            onPress={() => navigation.navigate("MapTilerPicker")}
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

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.danger }]}
          onPress={handleLogout}
        >
          <Icon name="sign-out-alt" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

/* ===== Reusable Components ===== */

const Section = ({ title, children, theme }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.accent }]}>{title}</Text>
    {children}
  </View>
);

const MenuItem = ({ icon, label, right, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.menuItem, { backgroundColor: theme.card }]}
    onPress={onPress}
  >
    <View style={styles.menuLeft}>
      <Icon name={icon} size={18} color={theme.icon} />
      <Text style={[styles.menuText, { color: theme.text }]}>{label}</Text>
    </View>
    {right && <View>{right}</View>}
  </TouchableOpacity>
);

/* ===== Themes ===== */

const lightTheme = {
  bg: "#f7f7f7",
  card: "#fff",
  text: "#222",
  icon: "#555",
  accent: "#bd5a14ff",
  headerBg: "#92400e",
  headerText: "#fff",
  avatarBg: "#fff",
  primary: "#a8520bff",
  danger: "#99400cff",
};

const darkTheme = {
  bg: "#121212",
  card: "#1e1e1e",
  text: "#eee",
  icon: "#ccc",
  accent: "#FFB74D",
  headerBg: "#92400e",
  headerText: "#fff",
  avatarBg: "#333",
  primary: "#90caf9",
  danger: "#e53935",
};

/* ===== Styles ===== */

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  date: {
    fontSize: 13,
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: 80,
    paddingTop: 10,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
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
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 15,
    marginLeft: 12,
    fontWeight: "500",
  },
  badgeRed: {
    backgroundColor: "#FF4D4D",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeGray: {
    backgroundColor: "#EEE",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    color: "#333",
  },
  logoutBtn: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 35,
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default Profile;
