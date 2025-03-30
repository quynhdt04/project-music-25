import React from "react";
import { useParams } from "react-router-dom";
import SongDetailPage from "../Song/SongDetailPage/SongDetailPage";

const ViewDetailPage = () => {
  const { managementPage } = useParams(); // Get all parameters

  const renderPage = () => {
    switch (managementPage) {
      case "songs-approval":
        return <SongDetailPage managementPage="songs-approval" />;

      //   case "albums-approval":
      //     return <CreatePage />;

      //   case "edit-info":
      //     return <UpdatePage />;

      default:
        // Default to ListPage with the managementPage parameter
        return <SongDetailPage />;
    }
  };

  return <>{renderPage()}</>;
};

export default ViewDetailPage;
