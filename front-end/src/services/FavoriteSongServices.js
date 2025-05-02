import { get, post } from "../utils/request";

export const create_favoriteSong = async (data) => {
    const result = await post(`favorite/create/`, data);
    return result;
}

export const get_favoriteSong = async (id) => {
    const result = await get(`favorite/${id}`);
    return result;
}