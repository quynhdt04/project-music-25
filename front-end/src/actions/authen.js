export const setAuthAccount = (value) => {
    return {
        type: "ACCOUNT",
        value: value
    };
};

export const setAuthRole = (value) => {
    return {
        type: "ROLE",
        value: value
    };
}