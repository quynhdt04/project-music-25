import {
    get,
    patch,
    post
} from "../utils/request";

export const get_all_playList = async () => {
    const result = await get(`play-list`);
    return result;
}

export const get_play_list_by_id = async (id) => {
    const result = await get(`play-list/${id}/`);
    return result;
}

export const create_playList = async (data) => {
    const result = await post(`play-list/create`, data);
    return result;
}

export const path_playList = async (id, data) => {
    const result = await patch(`play-list/edit`, id, data);
    return result;
}

export const add_song_to_playlist = async (id, data) =>{
    const result = await patch(`play-list/addSong`, id, data);
    return result;
}