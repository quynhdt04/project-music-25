import { combineReducers } from "redux";
import { authenReducer } from "./authen";

export const allReducers = combineReducers({
    authenReducer,
})
export const loginSuccess = (user, token) => {
    return {
      type: "LOGIN_SUCCESS",
      payload: { user, token },
    };
  };

export const updateUser = (userData) => {
  console.log("Dispatching UPDATE_USER với payload:", userData);
  return {
    type: "UPDATE_USER",
    payload: userData,
  };
};

export const logout = () => ({
    type: "LOGOUT",
});
