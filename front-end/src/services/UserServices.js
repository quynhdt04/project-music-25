import {
    get,
    post,
    patch,
    del
} from "../utils/request"

export const get_all_users = async () => {
    const result = await get(`api/users`);
    return result;
}

export const create_user = async (data) => {
    const result = await post(`api/users/create`, data);
    return result;
}

export const patch_user = async (id, data) => {
    const result = await patch(`api/users/edit`, id, data);
    return result;
}

export const get_user_by_id = async (id) => {
    const result = await get(`api/users/${id}/`);
    return result;
};

export const delete_user = async (id) => {
    const result = await del(`api/users/delete`, id);
    return result;
}
                
