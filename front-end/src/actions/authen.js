export const setAuthAccount = (value) => {
    return {
        type: "ACCOUNT",
        value: value
    };
};

export const setAuthUpdateAccount = (value) => {
    return {
        type: "ACCOUNT_UPDATE",
        value: value
    };
};

export const setAuthRole = (value) => {
    return {
        type: "ROLE",
        value: value
    };
};