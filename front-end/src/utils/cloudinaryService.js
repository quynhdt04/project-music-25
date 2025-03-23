export const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error("Vui lòng chọn một file để upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "could_python");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dtycrb54t/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload ảnh thất bại!");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    return null;
  }
};
