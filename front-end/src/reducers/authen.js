import { getCookie, deleteCookie, setCookie } from "../helpers/cookie";

const initialState = {
  account: getCookie("account") ? JSON.parse(getCookie("account")) : null,
  role: getCookie("role") ? JSON.parse(getCookie("role")) : null,
  user: sessionStorage.getItem("user") && sessionStorage.getItem("user") !== "undefined"
    ? JSON.parse(sessionStorage.getItem("user"))
    : null,
  token: sessionStorage.getItem("token") || null,
};

export const authenReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ACCOUNT":
      return { ...state, account: action.value };
    case "ROLE":
      return { ...state, role: action.value };
    case "ACCOUNT_UPDATE":
      return { ...state, account: action.value };
    case "USER":
      return { ...state, user: action.value };
    case "LOGIN_SUCCESS":
      // sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      // sessionStorage.setItem("token", action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGOUT":
      deleteCookie("user");
      deleteCookie("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return { ...initialState, user: null, token: null };

      case "UPDATE_USER":
        return {
          ...state,
          user: action.payload, // Cập nhật dữ liệu người dùng mới
        };
    default:
      return state;
  }
};
