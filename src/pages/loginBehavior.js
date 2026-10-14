export function checkLoginAttempt(password, expectedPassword, onSuccess, onFailure) {
    if (password === expectedPassword) {
        onSuccess();
        return true;
    }

    onFailure();
    return false;
}