import {
    get,
    post
} from "../utils/request";

export const get_all_playList = async () => {
    const result = await get(`play-list/`);
    return result;
}

export const create_playList = async (data) => {
    const result = await post(`play-list/create`, data);
    return result;
}