import {
    get,
    post,
    patch
} from "../utils/request"

export const get_all_singers = async () => {
    const result = await get(`api/singers`);
    return result;
}

export const create_singer = async (data) => {
    const result = await post(`api/singers/create`, data);
    return result;
}

export const patch_singer = async (id, data) => {
    const result = await patch(`api/singers/edit`, id, data);
    return result;
}

export const get_singer_by_id = async (id) => {
    const result = await get(`api/singers/${id}/`);
    return result;
};

                
