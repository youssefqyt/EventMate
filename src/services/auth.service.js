import { apiRequest, throwResponseError } from "./api";
import { getAccessToken, saveTokens } from "../storage/auth.storage";

const throwApiError = throwResponseError;


export const register = async (
    name,
    email,
    password
) => {

    const {
        response,
        data
    } = await apiRequest(
        "/auth/register",
        {
            method: "POST",

            body: JSON.stringify({
                name,
                email,
                password
            })
        }
    );


    if (!response.ok) {

        throwApiError(data, "We couldn’t create your account. Please try again.");
    }


    return data;
};

export const loginWithGoogle =
    async (googleToken) => {

        const {
            response,
            data
        } = await apiRequest(
            "/auth/google",
            {
                method: "POST",

                body: JSON.stringify({
                    googleToken
                })
            }
        );


        if (!response.ok) {

            throwApiError(data, "Google sign-in could not be completed.");
        }


        await saveTokens(
            data.accessToken,
            data.refreshToken
        );


        return data;
    };

export const linkGoogle = async (googleToken) => {
    const { response, data } = await apiRequest("/auth/google/link", {
        method: "POST",
        headers: { Authorization: `Bearer ${await getAccessToken()}` },
        body: JSON.stringify({ googleToken })
    });
    if (!response.ok) throwApiError(data, "Could not link Google account");
    return data;
};
export const login = async (
    email,
    password
) => {

    const {
        response,
        data
    } = await apiRequest(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password
            })
        }
    );


    if (!response.ok) {

        throwApiError(data, "We couldn’t sign you in. Please try again.");
    }


    await saveTokens(
        data.accessToken,
        data.refreshToken
    );


    return data;
};
