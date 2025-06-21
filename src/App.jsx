import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from './components/Layout';

import Chat from "./pages/Chat";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Video from "./pages/VideoFeed.jsx";
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
import UploadVideo from "./pages/UploadVideo";
import SessionsPage from "./pages/SessionsPage.jsx";
import Forbidden from "./pages/Forbidden.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
    return (
        <BrowserRouter >
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />

                    <Route path="/error/403" element={<Forbidden />} />
                    <Route path="/error/404" element={<NotFound />} />

                    <Route path="/post/feed" element={<Feed />} />
                    <Route path="/post/:id" element={<SinglePostPage />} />
                    <Route path="/post/upload" element={<CreatePostPage />} />

                    <Route path="/video/feed" element={<Video />} />
                    <Route path="/video/:id" element={<VideoPage />} />
                    <Route path="/video/upload" element={<UploadVideo />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/logout" element={<Logout />} />

                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/profile/friends" element={<FriendManager />} />
                    <Route path="/profile/sessions" element={<SessionsPage />} />

                    <Route path="/chat" element={<Chat />}/>
                    <Route path="/license" element={<LicensePage />} />
                    <Route path="/search" element={<SearchPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
