import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (e) {
    console.error('Failed to remove token', e);
  }
};
