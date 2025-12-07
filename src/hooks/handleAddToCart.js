import toast from "react-native-toast-message"; // make sure you have this installed

const handleAddToCart = () => {
  if (!isOpen) {
    toast.show({
      type: "error",
      text1: "Restaurant is closed",
    });
    return;
  }

  if (items.length > 0) {
    const cartRestaurantId = items[0].restaurant?._id;
    const currentRestaurantId = item.restaurant?._id;

    // If cart already has items from a different restaurant
    if (cartRestaurantId && cartRestaurantId !== currentRestaurantId) {
      toast.show({
        type: "error",
        text1: "You can only order from one restaurant at a time",
      });
      return;
    }
  }

  addItem(item);
  toast.show({
    type: "success",
    text1: "Added to cart",
  });
};