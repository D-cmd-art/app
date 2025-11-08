import {React,use,useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
   BackHandler,
  ScrollView,
} from 'react-native';
import { useUserOrders } from '../../hooks/useOrder';
import { useUserStore } from '../../utils/store/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');
const RESPONSIVE_PADDING = Math.min(Math.max(width * 0.04, 10), 20);


const Order = () => {
    const navigation = useNavigation();
  const { user } = useUserStore();
  const { data: orders, isLoading, error } = useUserOrders(user?.id);

  // --- Loading State ---
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f9e44" />
      </View>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <View style={styles.center}>
        <Icon name="sentiment-dissatisfied" size={40} color="#e74c3c" />
        <Text style={styles.errorText}>Failed to load orders.</Text>
      </View>
    );
  }

  // --- Empty Orders ---
  if (!orders || orders.length === 0) {
    return (
      <View style={styles.center}>
        <Icon name="inbox" size={50} color="#ccc" />
        <Text style={styles.emptyText}>No order history.</Text>
      </View>
    );
  }
  // 🔹 Hardware back button handler
  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // prevent default behavior
      }
      return false; // allow default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);
  // --- Order Card ---
  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Top Info Row */}
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>Order #{item.orderId?.slice(0, 10)}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: item.paymentStatus === 'paid' ? '#dcfce7' : '#e0e7ff' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: item.paymentStatus === 'paid' ? '#ff6b6bff' : '#173483ff' },
            ]}
          >
            {item.paymentStatus || 'unpaid'}
          </Text>
        </View>
      </View>

      <Text style={styles.orderText}>
        Date: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.orderText}>Payment: {item.payment_method || 'N/A'}</Text>
  
      <Text style={styles.orderText}> Total Amount: NPR {item.totalPayment?.toFixed(2)}</Text>
      <Text style={styles.orderstatus}>Orderstatus: {item.subStatus || 'pending'}</Text>

      {/* Order Items */}
      <Text style={styles.itemHeader}>Order Items</Text>
      {item.products &&
        item.products.map((product, index) => (
          <View key={index} style={styles.itemRow}>
            <Image
              source={{
                uri:
                  product.image ||
                  'https://via.placeholder.com/80x80.png?text=Item',
              }}
              style={styles.foodImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.foodName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.foodDetails}>
                Qty: {product.quantity} | Total: NPR {product.price?.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

      {/* Delivery Address */}
      <View style={[styles.footerRow, { marginTop: 8 }]}>
        <Icon name="location-on" size={16} color="#999" style={{ marginRight: 5 }} />
        <Text style={styles.addressText} numberOfLines={1}>
          Deliver to: {item.location?.name || 'N/A'}
        </Text>
      </View>
    </View>
  );

  // --- Render List ---
  return (
    <SafeAreaView style={{ flex: 1,backgroundColor:"#A62A22"} }>
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Your Orders</Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.orderId}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView></SafeAreaView>
  );
};

export default Order;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    padding: RESPONSIVE_PADDING,
    backgroundColor: '#f1f1f1ff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  listContainer: {
    padding: RESPONSIVE_PADDING,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  orderCard: {
    backgroundColor: '#f7f7f7ff',
    borderRadius: 12,
    padding: RESPONSIVE_PADDING,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 15,
  },
  orderText: {
    fontSize: 14,
    color: '#111c4dff',
    marginVertical: 2,
  },
  orderstatus: {
    fontSize: 17,
    color: '#A62A22',
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
  itemHeader: {
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#111827',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 8,
    padding: 8,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemInfo: {
    marginLeft: 10,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  foodDetails: {
    color: '#4B5563',
    fontSize: 13,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    color: '#777',
    flex: 1,
  },
});
