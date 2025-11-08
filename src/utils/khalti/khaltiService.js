
const createOrderPayload = (status = "unpaid", paymentMethod = "cash") => {
  const { user } = useUserStore.getState();
  const { location } = useLocationStore.getState();
  const { items, discountedTotal } = useCartStore.getState();

  if (!user || !location) {
    Alert.alert("Missing Info", "Please sign in and select a delivery location.");
    return null;
  }

  if (items.length === 0) {
    Alert.alert("Empty Cart", "Your cart is empty.");
    return null;
  }

  if (!isValidNepaliPhone(phone)) {
    Alert.alert("Invalid Phone", "Please enter a valid delivery phone number.");
    return null;
  }

  const products = items.map(item => ({
    productId: item._id,
    quantity: item.quantity,
  }));

  return {
    user: {
      name: user.name,
      id: user.id,
      phone: user.phone,
      email: user.email,
    },
    location: {
      name: location.name,
      lat: location.lat,
      lng: location.lng,
    },
    totalPayment: parseFloat(discountedTotal),
    products,
    status,
    deliveryNumber: phone,
    payment_method: paymentMethod,
  };
};