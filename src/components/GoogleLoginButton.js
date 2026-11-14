import React from "react";

import {
    Button,
    Alert
} from "react-native";

import * as WebBrowser
    from "expo-web-browser";

import * as Google
    from "expo-auth-session/providers/google";

import {
    useAuth
} from "../context/AuthContext";

import {
    GOOGLE_CLIENT_IDS
} from "../config/google";


WebBrowser.maybeCompleteAuthSession();


export default function GoogleLoginButton({ onIdToken, title = "Continue with Google" }) {

    const {
        loginWithGoogle
    } = useAuth();


    const [
        request,
        response,
        promptAsync
    ] = Google.useIdTokenAuthRequest({

        webClientId:
            GOOGLE_CLIENT_IDS.web,

        androidClientId:
            GOOGLE_CLIENT_IDS.android,

        iosClientId:
            GOOGLE_CLIENT_IDS.ios
    });


    React.useEffect(() => {

        if (
            response?.type === "success"
        ) {

            // `useIdTokenAuthRequest` returns the credential in params on web
            // and in authentication on native.  Supporting both keeps the
            // backend contract identical on Android, iOS and web.
            const idToken =
                response.authentication?.idToken ||
                response.params?.id_token;

            if (idToken) {

                (onIdToken || loginWithGoogle)(idToken)
                .catch(error => {

                    Alert.alert(
                        error.title || "Google Login Error",
                        [error.message, error.action, error.reference ? `Reference: ${error.reference}` : null].filter(Boolean).join("\n\n")
                    );

                });

            }
        }

    }, [response, loginWithGoogle, onIdToken]);


    return (

        <Button
            title={title}
            disabled={!request}
            onPress={() =>
                promptAsync()
            }
        />

    );
}
