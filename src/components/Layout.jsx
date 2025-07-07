import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    IconButton,
    useTheme,
    useMediaQuery,

    Divider,
    TextField,
    InputAdornment,
} from "@mui/material";



import { useLocation } from "react-router-dom";

import CircleIcon from "@mui/icons-material/Circle";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


import { Outlet, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { validateSession, getMyId } from "../api/auth";
import { fetchContacts } from "../api/contact.js";
import {ip,port} from "../assets/config.js";
import {useAuthGuard} from "./LoginValid.jsx";
import request from "../api/funcapi.js";

const drawerWidth = 240;

export async function fetchUserById(id) {
    const res = await request(`${ip}:${port}/api/user/${id}`,'GET');

    if (!res.ok) throw new Error("Не удалось получить данные пользователя");
    return res.json();
}

export function Layout() {
    const settingsicon = "/settings.svg";
    const chaticon = "/chat.svg";
    const feedicon = "/feed.svg";
    const exiticon = "/exit.svg";
    const videoicon = "/video.svg";
    const friendsicon = "/friends.svg";
    const defoltsicon = "/anonymous-512.png";
    const location = useLocation();
        useAuthGuard(location);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);

    const [selected, setSelected] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);



    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    useEffect(() => {
        (async () => {
            try {

                const id = getMyId();
                setMyId(id);
                const res = await request(`${ip}:${port}/api/User/avatar/${id}`,'GET')
                setAvatarUrl(await res.text());



            } catch (e) {
                console.error("Ошибка при получении моего профиля", e);
            }
        })();
    }, []);

    useEffect(() => {
        fetchContacts()
            .then((data) => {
                setContacts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const id = getMyId();
                setMyId(id);
            } catch (e) {
                console.error("Failed to get my ID", e);
            }
        })();
    }, []);

    const handleNav = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#121212", // тёмный фон
                color: "white", // белый текст
            }}
        >
            {isMobile && (
                <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => setMobileOpen(false)} aria-label="Закрыть меню" sx={{ color: "white" }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        Меню
                    </Typography>
                </Box>
            )}

            {isMobile && (
                <Box sx={{ p: 1 }}>
                    <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

                    <Button fullWidth onClick={() => handleNav("/profile/friends")} sx={{ color: "white" }}>
                        Друзья
                    </Button>
                    {/*
                        <Button fullWidth onClick={() => handleNav("/chat")} sx={{ color: "white" }}>
                          Чаты
                        </Button>
                    */}

                    <Button fullWidth onClick={() => handleNav("/post/feed")} sx={{ color: "white" }}>
                        Лента
                    </Button>
                    <Button fullWidth onClick={() => handleNav("/video/feed")} sx={{ color: "white" }}>
                        Видео
                    </Button>
                    <Button fullWidth onClick={() => handleNav("/logout")} sx={{ color: "white" }}>
                        Выйти
                    </Button>

                    <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
                </Box>
            )}

            <List>
                {loading ? (
                    <ListItem>
                        <ListItemText primary="Загрузка..." />
                    </ListItem>
                ) : contacts.length === 0 ? (
                    <ListItem>
                        <ListItemText primary="Нет друзей" />
                    </ListItem>
                ) : (
                    contacts.map((user) => (
                        <ListItem
                            button
                            key={user.id}
                            selected={selected === user.id}
                            onClick={() => {
                                setSelected(user.id);
                                navigate(`/profile/${user.id}`);
                                setMobileOpen(false);
                            }}
                            sx={{
                                bgcolor: selected === user.id ? "rgba(255,255,255,0.08)" : "transparent",
                                borderRadius: 2,
                                border: "1px solid rgba(255,255,255,0.2)",
                                mb: 1,
                                transition: "background 0.2s",
                                "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.05)"
                                },
                                color: "white"
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar src={user.avatarUrl} />
                            </ListItemAvatar>
                            <ListItemText primary={user.name} />
                        </ListItem>
                    ))
                )}
            </List>
        </Box>

    );

    const [valid, setValid] = useState(null);

    useEffect(() => {
        (async () => {
            const isValid = await validateSession();
            setValid(isValid);
        })();
    }, []);

    return (
        <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
            <CssBaseline />

            <AppBar position="fixed" sx={{ backgroundColor: "#040108" }}>
                <Toolbar >
                    {isMobile && (
                        <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((prev) => !prev)}>
                            {mobileOpen ? <ArrowBackIcon /> : <MenuIcon />}
                        </IconButton>
                    )}

                    <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                        <img
                            src="https://cdn.jsdelivr.net/gh/pupsikdhd/ProjectCDN/main-logo.svg"
                            alt="Логотип"
                            style={{ height: 60, cursor: "pointer" }}
                            onClick={() => navigate("/")}
                        />



                    </Box>


                    {valid && (
                        <Link to={`/profile/${myId}`}>
                            <IconButton sx={{ p: 0 }}>
                                <Avatar src={avatarUrl}    sx={{ width: 40, height: 40 }} />
                            </IconButton>
                        </Link>
                    )}







                    {!isMobile && (
                        <div>
                            <Button onClick={() => navigate("/post/feed")}><img
                                src={feedicon}
                                alt="посты"
                                width={30}
                                height={30}
                            /></Button>
                            <Button onClick={() => navigate("/video/feed")}><img
                                src={videoicon}
                                alt="видео"
                                width={30}
                                height={30}
                            /></Button>
                            <Button onClick={() => navigate("/profile/friends")}><img
                                src={friendsicon}
                                alt="друзья"
                                width={30}
                                height={30}
                            /></Button>
                            {/*
                                <Button onClick={() => navigate("/chat")}>
                                    <img
                                        src={chaticon}
                                        alt="чаты"
                                        width={30}
                                        height={30}
                                    />
                                </Button>
                             */}

                            <IconButton onClick={() => navigate("/settings")} >
                                <img
                                    src={settingsicon}
                                    alt="настройки"
                                    width={30}
                                    height={30}
                                />
                            </IconButton>
                            <Button onClick={() => navigate("/logout")}><img
                                src={exiticon}
                                alt="выйти"
                                width={30}
                                height={30}
                            /></Button>


                        </div>
                    )}
                </Toolbar>
            </AppBar>

            {/* Навигационный Drawer */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } ,}}>
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#a29797",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            backgroundColor: "#242323",
                            top: "64px",
                            height: "calc(100vh - 64px)",

                        },

                    }}
                    open
                >
                    <Toolbar />
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Контент */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 2,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: "64px",
                    overflow: "auto",
                    bgcolor: "#d9d9d9",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
