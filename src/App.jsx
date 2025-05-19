import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from './components/Layout';

import Chat from "./pages/Chat";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Video from "./pages/Videolist";
import LoginPage from "./pages/LoginPage.jsx";
import Logout from "./pages/Logout.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Profile from "./pages/Profile";
import SingleVideoPage from "./pages/Video.jsx";
import SinglePostPage from "./pages/Postpage.jsx";
import FriendManager from "./pages/FriendManager.jsx";
import LicensePage from './pages/LicensePage.jsx';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/massk" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/massk/chat" element={<Chat />}/>
                    <Route path="/massk/video" element={<Video />} />
                    <Route path="/massk/video/:id" element={<SingleVideoPage />} />
                    <Route path="/massk/feed" element={<Feed />} />
                    <Route path="/massk/post/:id" element={<SinglePostPage />} />
                    <Route path="/massk/login" element={<LoginPage />} />
                    <Route path="/massk/register" element={<RegisterPage />} />
                    <Route path="/massk/profile/:id" element={<Profile />} />
                    <Route path="/massk/logout" element={<Logout />} />
                    <Route path="/massk/friends" element={<FriendManager />} />
                    <Route path="/massk/license" element={<LicensePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
