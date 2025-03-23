import { getCookie } from "../helpers/cookie";


const initialState = {
    account: getCookie("account") ? JSON.parse(getCookie("account")) : null,
    role: getCookie("role") ? JSON.parse(getCookie("role")) : null
};

export const authenReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ACCOUNT":
            return { ...state, account: action.value }; 
        case "ROLE":
            return { ...state, role: action.value }; 
        case "ACCOUNT_UPDATE":
            return {...state, account: action.value};
        default:
            return state;
    }
};
