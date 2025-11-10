import * as Keychain from 'react-native-keychain';

// Define a custom service name for your app tokens
const TOKEN_SERVICE = 'com.bhokexpress.tokens';

/**
 * Save access and refresh tokens securely
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns {Promise<boolean>} true if saved successfully
 */
export async function saveTokens(accessToken, refreshToken) {
  try {
    await Keychain.setGenericPassword(accessToken, refreshToken, {
      service: TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, // Tokens stay on device only
    });
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
}

/**
 * Retrieve access and refresh tokens securely
 * @returns {Promise<{accessToken: string, refreshToken: string} | null>}
 */
export async function getTokens() {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: TOKEN_SERVICE,
    });
    if (credentials) {
      return {
        accessToken: credentials.username,
        refreshToken: credentials.password,
      };
    }
    return null; // No tokens found
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
}

/**
 * Delete stored tokens securely
 * @returns {Promise<boolean>} true if deleted successfully
 */
export async function deleteTokens() {
  try {
    await Keychain.resetGenericPassword({
      service: TOKEN_SERVICE,
    });
    return true;
  } catch (error) {
    console.error('Error deleting tokens:', error);
    return false;
  }
}
