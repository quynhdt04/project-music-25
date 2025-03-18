import { combineReducers } from "redux";
import { authenReducer } from "./authen";

export const allReducers = combineReducers({
    authenReducer,
})