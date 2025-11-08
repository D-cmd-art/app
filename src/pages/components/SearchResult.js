import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSearch } from "../../hooks/useSearch";
import ProductCard from "./ProductCard";
import RestaurantCard from "./RestaurantCard";

export default function SearchResult({ query, type }) {
  const { data, isLoading, isError } = useSearch(query, type);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [query, type]);

  if (!query) return null;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#92400e" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load results</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelected(item)}
      style={styles.cardTouchable}
    >
      {type === "products" ? (
        <ProductCard item={item} />
      ) : (
        <RestaurantCard restaurant={item} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Selected Item Details */}
      {selected && (
        <View style={styles.selectedSection}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle}>
              Selected {type === "products" ? "Product" : "Restaurant"}
            </Text>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardWrapper}>
            {type === "products" ? (
              <ProductCard product={selected} />
            ) : (
              <RestaurantCard restaurant={selected} />
            )}
          </View>
        </View>
      )}

      {/* List of Results */}
      {!selected && data?.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>
            {type === "products" ? "Products" : "Restaurants"} matching "
            {query}"
          </Text>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item._id || item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* No Results */}
      {!selected && data?.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results found for "{query}"</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  selectedSection: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#92400e",
  },
  clearButton: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
  },
  cardWrapper: {
    marginBottom: 10,
  },
  listSection: {
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#92400e",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  cardTouchable: {
    flex: 1,
    marginHorizontal: 4,
  },
});