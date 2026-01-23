import config from "../config";
import ChatPage from "../pages/ChatPage";
import LoginPage from "../pages/LoginPage";
import DefaultLayout from "../layouts/DefaultLayout";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import FriendRequestPage from "../pages/FriendRequestPage/FriendRequestPage";
import SearchPage from "../pages/SearchPage/SearchPage";
import FriendPage from "../pages/FriendPage/FriendPage";
import CreateGroupPage from "../pages/CreateGroupPage";
import GroupSettingsPage from "../pages/GroupSettingsPage";

const privateRoutes = [
    { path: config.routes.home, component: ChatPage, layout: DefaultLayout },
    { path: config.routes.chat, component: ChatPage, layout: DefaultLayout },
    {
        path: config.routes.search,
        component: SearchPage,
        layout: DefaultLayout,
    },
    {
        path: config.routes.friendRequest,
        component: FriendRequestPage,
        layout: DefaultLayout,
    },
    {
        path: config.routes.friends,
        component: FriendPage,
        layout: DefaultLayout,
    },
    {
        path: config.routes.createGroup,
        component: CreateGroupPage,
        layout: DefaultLayout,
    },
    {
        path: config.routes.groupSettings,
        component: GroupSettingsPage,
        layout: DefaultLayout,
    },
];

const publicRoutes = [
    { path: config.routes.login, component: LoginPage, layout: null },
    { path: config.routes.register, component: RegisterPage, layout: null },
];

export { privateRoutes, publicRoutes };

