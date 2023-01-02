/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Alert
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {useAuth0, Auth0Provider} from 'react-native-auth0';

const Home = () => {
  const {authorize, clearSession, user, getCredentials, error} = useAuth0();

  const onLogin = async () => {
    await authorize({scope: 'openid profile email'});
    const {accessToken} = await getCredentials();
    Alert.alert('AccessToken: ' + accessToken);
  };

  const loggedIn = user !== undefined && user !== null;

  const onLogout = async () => {
    await clearSession({federated: true}, {localStorageOnly: false});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Auth0Sample - Login </Text>
      {user && <Text>You are logged in as {user.name}</Text>}
      {!user && <Text>You are not logged in</Text>}
      <Button
        onPress={loggedIn ? onLogout : onLogin}
        title={loggedIn ? 'Log Out' : 'Log In'}
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
};

const App: () => Node = () => {
  return (
    <Auth0Provider domain="dev-2gsqftwl.us.auth0.com" clientId="0K14ZMVQ6GCFWI9U1dAryv3lose8yWkt">
      <Home />
    </Auth0Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  error: {
    margin: 20,
    textAlign: 'center',
    color: '#D8000C'
  },
//  sectionContainer: {
//    marginTop: 32,
//    paddingHorizontal: 24,
//  },
//  sectionTitle: {
//    fontSize: 24,
//    fontWeight: '600',
//  },
//  sectionDescription: {
//    marginTop: 8,
//    fontSize: 18,
//    fontWeight: '400',
//  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
