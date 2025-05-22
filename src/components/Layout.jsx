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

import CircleIcon from "@mui/icons-material/Circle";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import { Outlet, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { validateSession, getMyId } from "../api/auth";
import { fetchContacts } from "../api/contact.js";

const drawerWidth = 240;

export function Layout() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);

    const [selected, setSelected] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {isMobile && (
                <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => setMobileOpen(false)} aria-label="Закрыть меню">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        Меню
                    </Typography>
                </Box>
            )}

            {isMobile && (
                <Box sx={{ p: 1 }}>
                    <Divider sx={{ my: 1 }} />

                    <Button fullWidth onClick={() => handleNav("/profile/friends")}>
                        Друзья
                    </Button>
                    <Button fullWidth onClick={() => handleNav("/chat")}>
                        Чаты
                    </Button>
                    <Button fullWidth onClick={() => handleNav("/post/feed")}>
                        Лента
                    </Button>
                    <Button fullWidth onClick={() => handleNav("/video/feed")}>
                        Видео
                    </Button>
                    <Button fullWidth onClick={() => handleNav("/logout")}>
                        Выйти
                    </Button>
                    <Divider sx={{ my: 1 }} />
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

            <AppBar position="fixed" sx={{ backgroundColor: "#d3d3d3" }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((prev) => !prev)}>
                            {mobileOpen ? <ArrowBackIcon /> : <MenuIcon />}
                        </IconButton>
                    )}

                    <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                        <img
                            src="https://cdn.jsdelivr.net/gh/pupsikdhd/ProjectCDN/main-logo-white.svg"
                            alt="Логотип"
                            style={{ height: 60, cursor: "pointer" }}
                            onClick={() => navigate("/")}
                        />

                        {/* Поле поиска */}
                        <TextField
                            size="small"
                            placeholder="Поиск..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchInput.trim()) {
                                    navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
                                    setSearchInput("");
                                }
                            }}
                            sx={{ bgcolor: "white", borderRadius: 1, ml: 2, width: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {valid === true && myId && (
                        <Link to={`/profile/${myId}`}>
                            <IconButton>
                                <CircleIcon sx={{ color: "#8bc34a" }} />
                            </IconButton>
                        </Link>
                    )}

                    {valid === false && (
                        <IconButton onClick={() => navigate("/login")}>
                            <CircleIcon sx={{ color: "#f44336" }} />
                        </IconButton>
                    )}

                    {valid === null && (
                        <IconButton disabled>
                            <CircleIcon sx={{ color: "#ccc" }} />
                        </IconButton>
                    )}

                    {!isMobile && (
                        <>

                            <Button onClick={() => navigate("/profile/friends")}>Друзья</Button>
                            <Button onClick={() => navigate("/chat")}>Чаты</Button>
                            <Button onClick={() => navigate("/post/feed")}>Посты</Button>
                            <Button onClick={() => navigate("/video/feed")}>Видео</Button>
                            <Button onClick={() => navigate("/logout")}>Выйти</Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Навигационный Drawer */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
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
                            backgroundColor: "#a29797",
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
