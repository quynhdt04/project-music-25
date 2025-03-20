import {
    get,
    patch,
    post
} from "../utils/request"

export const get_all_accounts = async () => {
    const result = await get(`api/accounts`);
    return result;
}

export const create_account = async (data) => {
    const result = await post(`api/accounts/create`, data);
    return result;
}

export const login = async (email, password = "") => {
    let pass = "";
    if (password !== "") {
        pass = `&password=${password}`;
    }
    const result = await get(`api/account?email=${email}${pass}`);
    return result;
};

export const get_account_by_id = async (id) => {
    const result = await get(`api/accounts/${id}/`);
    return result;
}

export const patch_account = async (id, data) => {
    const result = await patch(`api/accounts/edit`,id, data);
    return result;
}