import React from "react";
import { useParams } from "react-router-dom";
import SongFormManagementPage from "../Song/SongFormManagementPage/SongFormManagementPage";
import AlbumFormManagement from "../../admin/Album/AlbumFormManagement/AlbumFormManagement";

const CreatePage = () => {
  const { managementPage } = useParams();

  const renderPage = () => {
    switch (managementPage) {
      case "albums":
        return <AlbumFormManagement />;

      //   case "edit-info":
      //     return <UpdatePage />;

      default:
        return <SongFormManagementPage />;
    }
  };

  return <>{renderPage()}</>;
};

export default CreatePage;
