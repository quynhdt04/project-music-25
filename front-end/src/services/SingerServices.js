import {
    get
} from "../utils/request"

export const get_all_singers = async () => {
    const result = await get(`api/singers`);
    return result;
}

// export const create_account = async (data) => {
//     const result = await post(`api/singers/create`, data);
//     return result;
// }
