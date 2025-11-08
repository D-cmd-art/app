import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, BackHandler } from 'react-native';
import { useUserStore } from '../../utils/store/userStore';
import { useDeleteUser } from '../../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';

const UserProfile = () => {
  const { user, clear } = useUserStore();
  const navigation = useNavigation();

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      clear();
      navigation.navigate('AuthStack', { screen: 'Login' });
    },
    onError: (err) => {
      Alert.alert('Deletion Failed', err.response?.data?.error || "Cannot delete at this moment");
    },
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete() },
      ]
    );
  };

  const handleDelete = () => {
    deleteUserMutation.mutate(user.id);
  };

  // 🔹 Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      // Go back to the previous screen (Profile main page)
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // prevent default behavior
      }
      return false; // allow default behavior if no screens to go back
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.title}>Profile Details</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{user.phone}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', padding: 20 },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center', color: '#333' },
  infoContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: '#6C757D' },
  value: { fontSize: 16, fontWeight: '500', color: '#212529', marginTop: 4 },
  deleteButton: { backgroundColor: '#DC3545', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 20 },
  deleteButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default UserProfile;
