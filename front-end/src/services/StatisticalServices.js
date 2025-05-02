import { get } from "../utils/request";

export const get_total_statistics = async () => {
    const result = await get(`api/statistical/total`);
    return result;
};

export const get_playcount_by_topic = async () => {
    const result = await get(`api/statistical/playcount-by-topic`);
    return result;
};

export const get_songcount_by_topic = async () => {
    const result = await get(`api/statistical/songcount-by-topic`);
    return result;
};


export const get_top_liked_songs = async () => {
    const result = await get(`api/statistical/top-liked-songs`);
    return result;
};