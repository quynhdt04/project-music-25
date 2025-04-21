import { post } from "../utils/request";

export const create_favoriteSong = async (data) => {
    const result = await post(`favorite/create/`, data);
    return result;
}