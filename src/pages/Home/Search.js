import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDebounce } from "use-debounce";
import SearchResult from "../components/SearchResult";

const LiveSuggestions = ({ type, query, onSelect }) => (
  <View style={styles.suggestionContainer}>
    <Text style={styles.suggestionTitle}>Suggestions for "{query}"</Text>
    <TouchableOpacity onPress={() => onSelect({ name: query + " 1" })}>
      <Text style={styles.suggestionItem}>{query} 1</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onSelect({ name: query + " 2" })}>
      <Text style={styles.suggestionItem}>{query} 2</Text>
    </TouchableOpacity>
  </View>
);

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("restaurants");
  const [showFullResults, setShowFullResults] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  useEffect(() => {
    if (isUserTyping) {
      setShowFullResults(false);
    }
  }, [debouncedQuery, activeTab, isUserTyping]);

  const handleInputChange = (text) => {
    setQuery(text);
    setIsUserTyping(true);
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    if (query.trim() === "") return;
    setSearchTerm(query.trim());
    setShowFullResults(true);
    setIsUserTyping(false);
  };

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.headingContainer}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>
          Find your favorite restaurants or products quickly.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["restaurants", "products"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          onChangeText={handleInputChange}
          placeholder={`Search ${activeTab}...`}
          onSubmitEditing={handleSearch}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
          <Icon name="search" size={20} color="#ee1212ff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {!showFullResults && debouncedQuery && isUserTyping && (
          <LiveSuggestions
            type={activeTab}
            query={debouncedQuery}
            onSelect={(item) => {
              setQuery(item.name);
              setSearchTerm(item.name);
              setShowFullResults(true);
              setIsUserTyping(false);
            }}
          />
        )}

        {showFullResults && searchTerm && (
          <SearchResult type={activeTab} query={searchTerm} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ee1212ff",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  activeTab: {
    backgroundColor: "#ee1212ff",
  },
  tabText: {
    fontWeight: "600",
    color: "#4b5563",
  },
  activeTabText: {
    color: "#fff",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingRight: 40,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  suggestionContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  suggestionTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 16,
    color: "#333",
  },
  suggestionItem: {
    paddingVertical: 6,
    fontSize: 16,
    color: "#ee1212ff",
  },
});