import LayoutClient from "../layouts/client/LayoutDefault";
import LayoutAdmin from "../layouts/admin/LayoutDefault";
import Home from "../pages/client/Home";
import PrivateRoutes from "../components/PrivateRoutes";
import BXH from "../pages/client/BXH";
import Dashboard from "../pages/admin/Dashboard";
import Role from "../pages/admin/Role";
import Account from "../pages/admin/Account";
import Permissions from "../pages/admin/Role/permissions";
import CreateRole from "../pages/admin/Role/createRole";
import EditRole from "../pages/admin/Role/editRole";
import CreateAccount from "../pages/admin/Account/createAccount";
import Login from "../pages/admin/Login";
import Logout from "../pages/admin/Logout";
import Topic from "../pages/admin/Topic";
import Singer from "../pages/admin/Singer";
import User from "../pages/admin/User";
import General from "../pages/admin/General";
import PrivateRouteClient from "../components/PrivateRouteClient";
import MusicLove from "../pages/client/MusicLove";
import InfoUser from "../pages/admin/InfoUser";
import EditAccount from "../pages/admin/Account/editAccount";
import CreateTopic from "../pages/admin/Topic/createTopic";
import EditTopic from "../pages/admin/Topic/editTopic";

import CreateSinger from "../pages/admin/Singer/createSinger";
import EditSinger from "../pages/admin/Singer/editSinger";

import Profile from "../pages/client/Profile";
import MainContent from "../pages/admin/MainContent/MainContent";
import AlbumDetail from "../pages/client/AlbumDetail/AlbumDetail";

import PlayList from "../pages/client/PlayList";
import PlayListDetail from "../pages/client/PlayList/PlayListDetail";
import CreateUser from "../pages/admin/User/createUser";
import EditUser from "../pages/admin/User/editUser";
import UserDetail from "../pages/admin/User/userDetail";
import Conversation from "../pages/admin/Conversation/";

import Vip from "../pages/client/Vip";
import IndexPage from "../pages/client/VnpayPage/index";
import PaymentForm from "../pages/client/VnpayPage/PaymentForm";
import PaymentReturn from "../pages/client/VnpayPage/PaymentReturn";
import SeeMorePage from "../pages/client/SeeMore/SeeMorePage";
export const allRoutes = [
  // Routes cho Client
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "bxh",
        element: <BXH />,
      },
      {
        path: ":type/:id",
        element: <AlbumDetail />,
      },
      {
        path: ":type/see-more",
        element: <SeeMorePage />,
      },
      {
        element: <PrivateRouteClient />,
        children: [
          {
            path: "music-love",
            element: <MusicLove />,
          },
          {
            path: "playlist",
            element: <PlayList />,
          },
          {
            path: "playlist/detail/:id",
            element: <PlayListDetail />,
          },
        ],
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/profile/:userId",
        element: <Profile />,
      },
      {
        path: "/vip",
        element: <Vip />,
      },
    ],
  },
    // Route  cho  Payment
    {
      path: "/index", // Đường dẫn tới IndexPage
      element: <IndexPage title="Trang Chính" />, // Pass title as prop
    },
    {
      path: "/payment", 
      element: <PaymentForm />, 
    },  
    {
      path: "/payment_return", 
      element: <PaymentReturn />, 
    },

  // Routes cho Admin
  {
    path: "/admin/login",
    element: <Login />,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/admin",
        element: <LayoutAdmin />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "roles",
            element: <Role />,
          },
          {
            path: "roles/permissions",
            element: <Permissions />,
          },
          {
            path: "roles/create",
            element: <CreateRole />,
          },
          {
            path: "roles/edit/:id",
            element: <EditRole />,
          },
          {
            path: "accounts",
            element: <Account />,
          },
          {
            path: "accounts/create",
            element: <CreateAccount />,
          },
          {
            path: "accounts/edit/:id",
            element: <EditAccount />,
          },
          {
            path: "topics",
            element: <Topic />,
          },
          {
            path: "singers",
            element: <Singer />,
          },
          {
            path: "singers/create",
            element: <CreateSinger />,
          },
          {
            path: "singers/edit/:id",
            element: <EditSinger />,
          },
          {
            path: "users",
            element: <User />,
          },
          {
            path: "users/create",
            element: <CreateUser />,
          },
          {
            path: "users/edit/:id",
            element: <EditUser />,
          },
          {
            path: "users/view/:id",
            element: <UserDetail />,
          },
          {
            path: "general",
            element: <General />,
          },
          {
            path: "logout",
            element: <Logout />,
          },
          {
            path: "info-user",
            element: <InfoUser />,
          },
          {
            path: "topics/create",
            element: <CreateTopic />,
          },
          {
            path: "topics/edit/:id",
            element: <EditTopic />,
          },
          {
            path: ":managementPage/:action?/:id?",
            element: <MainContent />,
          },
          // {
          //   path: "songs/:action?/:id?",
          //   element: <SongFormManagementPage />,
          // },
          {
            path: "conversations",
            element: <Conversation />,
          },
        ],
      },
    ],
  },
];