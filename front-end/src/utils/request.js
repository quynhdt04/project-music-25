const API_DOMAIN = `http://127.0.0.1:8000/`;

export const get = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    });

    const result = await response.json();
    return result;
};

export const post = async (path, options) => {
    const responsive = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers:{
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8" 
        },
        body: JSON.stringify(options)
    })
    const result = await responsive.json();
    return result;
}

export const patch = async (path, id , options) => {
    const responsive = await fetch(`${API_DOMAIN}${path}/${id}/`, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    })
    const result = await responsive.json();
    return result;
}

export const del = async (path, id) => {
    const responsive = await fetch(`${API_DOMAIN}${path}/${id}`,{
        method: "DELETE"
    })
    const result = await responsive.json();
    return result;
}