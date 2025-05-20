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

import SinglePostPage from "./pages/Postpage.jsx";
import FriendManager from "./pages/FriendManager.jsx";
import LicensePage from './pages/LicensePage.jsx';
import SearchPage from "./pages/SearchPage";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import VideoPage from "./pages/VideoPage.jsx";
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/chat" element={<Chat />}/>
                    <Route path="/video" element={<Video />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/post/:id" element={<SinglePostPage />} />
                    <Route path="//login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/friends" element={<FriendManager />} />
                    <Route path="/license" element={<LicensePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/createpost" element={<CreatePostPage />} />
                    <Route path="/video/:id" element={<VideoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
