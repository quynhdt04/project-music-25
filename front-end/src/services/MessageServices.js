import {
    get,
    post,
} from "../utils/request"

export const get_messages_by_conversation = async (id) => {
    const result = await get(`api/conversations/messages/${id}/`);
    return result;
}

export const create_message = async (data) => {
    const result = await post(`api/conversations/messages/create`, data);
    return result;
}