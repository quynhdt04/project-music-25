import {
    get
} from "../utils/request"

export const get_songs_by_singerID = async (id) => {
    const result = await get(`artists/detail/${id}/`);
    return result;
};