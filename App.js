/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import {
    Alert,
    Button,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Platform
} from 'react-native';
import Auth0 from 'react-native-auth0';
import DeviceInfo from 'react-native-device-info';

var credentials = require('./auth0-configuration');
const auth0 = new Auth0(credentials);
const credentialsManager = auth0.credentialsManager;
const App = () => {

    let [credentials, setCredentials] = useState(null);
    const [isRealDevice, setRealDevice] = useState(false);
    const [deviceHasCredentials, setDeviceHasCredentials] = useState(false);
    const [firstTimeLogin, setFirstTimeLogin] = useState(false);
    const [isLoading, setLoading] = useState(true);

    DeviceInfo.isEmulator().then((isEmulator) => {
        setRealDevice(!isEmulator);
        console.log('Running on real device:' + isRealDevice);
    })

    credentialsManager.hasValidCredentials().then(result => {
        setDeviceHasCredentials(result);
        console.log('Device has credentials:' + deviceHasCredentials)
        setLoading(false);
    })

    const onRenewCredentials = () => {
        credentialsManager.getCredentials()
            .then(credentials => {
                Alert.alert('Obtained access_token with scope: ' + credentials.scope);
                setCredentials(credentials);
            })
            .catch(error => console.log(error));
    }

    const onLogin = () => {
        if (deviceHasCredentials) {
            console.log('Valid credentials exist, attempting to get credentials')
            if (isRealDevice) {
                credentialsManager.requireLocalAuthentication(null, null, 'Cancel', 'Try Again', 2)
                    .then(res => {
                        credentialsManager.getCredentials()
                           .then(credentials => {
                                Alert.alert('Obtained access_token with scope: ' + credentials.scope);
                                setCredentials(credentials);
                                setFirstTimeLogin(false);
                           })
                           .catch(error => console.log(error));
                })
                .catch(error => console.log('Local Auth fail.', error))
            } else {
                Alert.alert('Simulating Local Authentication on Emulator');
                credentialsManager.getCredentials()
                   .then(credentials => {
                        Alert.alert('Obtained access_token with scope: ' + credentials.scope);
			            console.log(credentials.accessToken);
                        setFirstTimeLogin(false);
                        setCredentials(credentials);
                   })
                   .catch(error => console.log(error));

            }
        } else {
            console.log('No credentials have been saved in this device. Need to sign in with PKCE')
            auth0.webAuth
                .authorize({
                    audience: 'https://lgtm.com.au/api',
                    scope: 'openid profile email offline_access'
                }, { ephemeralSession: true })
                .then(credentials => {
                    console.log('First time login done');
                    setFirstTimeLogin(true);
                    setCredentials(credentials);
                    Alert.alert(
                          "Set PIN/Biometric",
                          "Do you want to save credentials on the device to login with PIN/Biometric in the  future?",
                          [
                            {
                              text: "No",
                              onPress: () => console.log("Credentials will not be stored on device"),
                              style: "cancel"
                            },
                            { text: "Yes", onPress: () => {
                                    console.log("Saving credentials on the device");
                                    credentialsManager.saveCredentials(credentials)
                                    .then(result => {console.log(result); setDeviceHasCredentials(true)})
                                    .catch(error => console.log(error))
                                }
                            }
                          ]
                        );

                    })
                    .catch(error => console.log(error));
        }
    };

    const onLogout = () => {
        // Clear shared session cookie only if it has been created during login process
        if (Platform.OS === 'android' && firstTimeLogin) {
            auth0.webAuth.clearSession()
                .then(() => {console.log('Session Cleared in Android device.')})
        }
        Alert.alert('Logged out!');
        setCredentials(null);
    };

    const onClearCredentials = () => {
        credentialsManager.clearCredentials()
            .then(() => {
                    setDeviceHasCredentials(false);
                    console.log('Cleared Credentials')
                    }
                )
    };

    const onRequestMFAScope = () => {
        auth0.webAuth.authorize({audience: 'https://lgtm.com.au/api', scope: 'delete:appointments'},
                                {ephemeralSession: true})
            .then((credentials) => {
                    Alert.alert('Obtained MFA scope:' + credentials.scope);
                    console.log('Requesting MFA scope', credentials)
                    }
                )
                .catch(error => {
                    Alert.alert('Failed!!! To obtained MFA scope');
                    console.log('Error requesting MFA scope:', error);
                });

    }
    let accessToken = credentials && credentials.accessToken;
    let loggedIn = credentials && credentials.accessToken !== null;
    // Auth0 returns different values for expiresIn in authorize and getCredentails

    let expiresIn = null;
    if (credentials?.expiresIn < 1000000) {
        expiresIn = new Date(new Date().getTime() + credentials?.expiresIn * 1000);
    } else {
        expiresIn = new Date(credentials?.expiresIn * 1000);
    }

    let expiresInStr = expiresIn?.toLocaleDateString() +  ' ' + expiresIn?.toLocaleTimeString()
    let timeNow = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    console.log(expiresIn, new Date());

    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator/>}
            {!isLoading && <><Text style={styles.header}> Auth0 Demo App </Text>
            <Text>You are{loggedIn ? ' ' : ' not '}logged in. </Text>
            <Button onPress={loggedIn ? onLogout : onLogin}
                title={loggedIn ? 'Log Out' : deviceHasCredentials? 'Subsequent Login' : 'First time Login'} />
            {accessToken && <Button onPress={onRenewCredentials} title='Renew Credentials' />}
            {accessToken && <Button onPress={onRequestMFAScope} title='Request MFA Scope' />}
            {deviceHasCredentials && <Button onPress={onClearCredentials} title='Clear Credentials' />}
            {accessToken && <Text>Expires at: {expiresInStr}</Text>}
            {accessToken && <Text>Time Now: {timeNow}</Text>}
            <Text>{isRealDevice ? 'You are using a Real Device' : 'You are using Emulator/Simulator'}</Text></>}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    header: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    }
});

export default App;
