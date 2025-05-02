import {
    get,
    post,
    patch,
    del
} from "../utils/request"

export const get_all_conversations = async () => {
    const result = await get(`api/conversations`);
    return result;
}

export const create_conversation = async (data) => {
    const result = await post(`api/conversations/create`, data);
    return result;
}

export const update_conversation = async (id, data) => {
    const result = await patch(`api/conversations/edit`, id, data);
    return result;
}

export const get_conversation_by_id = async (id) => {
    const result = await get(`api/conversations/${id}/`);
    return result;
};

export const delete_conversation = async (id) => {
    const result = await del(`api/conversations/delete`, id);
    return result;
}
                
