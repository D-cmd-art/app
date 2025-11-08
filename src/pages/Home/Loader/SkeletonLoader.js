// SkeletonLoader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonLoader = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor="#E1E9EE"
        highlightColor="#F2F8FC"
      >
        <View style={styles.row}>
          {/* Card 1 */}
          <View style={styles.card} />
          {/* Card 2 */}
          <View style={styles.card} />
          {/* Card 3 */}
          <View style={styles.card} />
          {/* Card 4 */}
          <View style={styles.card} />
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '23%',
    height: 180,
    borderRadius: 15,
  },
});

export default SkeletonLoader;