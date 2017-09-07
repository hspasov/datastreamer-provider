export default function loginProvider(provider) {
    return {
        type: "LOGIN_PROVIDER",
        payload: provider
    }
}