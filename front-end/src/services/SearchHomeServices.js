import { get } from "../utils/request";

export const search_songs = async (keyword) => {
    const result = await get(`search/songs?keyword=${keyword}`);
    return result;
};

export const search_albums = async (keyword) => {
    const result = await get(`search/albums?keyword=${keyword}`);
    return result;
};

export const search_singers = async (keyword) => {
    const result = await get(`search/singers?keyword=${keyword}`);
    return result;
};