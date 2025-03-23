export const removeVietnameseTones = (str) => {
    return str
        .normalize("NFD") // Tách dấu khỏi ký tự
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .toLowerCase(); // Chuyển về chữ thường
};
