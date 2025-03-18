import { get, patch, post } from "../utils/request"

export const get_all_roles =  async() => {
    const result = await get(`api/roles`);
    return result;
}

export const create_role = async(options) => {
    const result = await post(`/api/roles/create`, options);
    return result;
}

export const patch_role = async(id, option) => {
    const result = await patch(`api/roles/edit`,id , option);
    return result;
}

export const get_role = async(id) => {
    const result = await get(`api/roles/${id}`);
    return result;
}

// export const del_role = async(id) => {
//     const result = await get(`api/roles/del`,id);
//     return result;
// }