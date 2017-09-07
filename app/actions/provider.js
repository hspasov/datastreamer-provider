export default function registerProvider(provider) {
    return {
        type: "REGISTER_PROVIDER",
        payload: provider
    }
}