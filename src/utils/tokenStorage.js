import * as Keychain from 'react-native-keychain';

export async function saveTokens(accessToken, refreshToken) {
  await Keychain.setGenericPassword(accessToken, refreshToken);
}

export async function getTokens() {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return {
      accessToken: credentials.username,
      refreshToken: credentials.password,
    };
  }
  return null;
}

export async function deleteTokens() {
  await Keychain.resetGenericPassword();
}