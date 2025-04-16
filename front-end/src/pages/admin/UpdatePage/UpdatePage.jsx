import React from "react";
import { useParams } from "react-router-dom";
import SongFormManagementPage from "../Song/SongFormManagementPage/SongFormManagementPage";
import AlbumFormManagement from "../../admin/Album/AlbumFormManagement/AlbumFormManagement";

const UpdatePage = () => {
  const { managementPage } = useParams();
  const renderPage = () => {
    switch (managementPage) {
      case "albums":
        return <AlbumFormManagement />;

      default:
        return <SongFormManagementPage />;
    }
  };

  return <>{renderPage()}</>;
};

export default UpdatePage;
