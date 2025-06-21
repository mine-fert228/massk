import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { ip, port } from "/src/assets/config.js";
import { getMyId } from "../api/auth.js";

import {
    Button,
    TextField,
    Typography,
    Modal,
    Box,
    Backdrop,
    Fade,
} from "@mui/material";
import {toast, ToastContainer} from "react-toastify";
import request from "../api/funcapi.js";

const API_BASE = `http://${ip}:${port}`;
const Token = localStorage.getItem("token");

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#eee",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function Profile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFriends, setShowFriends] = useState(window.innerWidth > 768);
    const [isMe, setIsMe] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const handleOpen = () => setEditOpen(true);
    const handleClose = () => setEditOpen(false);

    const [editData, setEditData] = useState({
        name: "",
        description: "",
        status: "",
        avatarUrl: "",
        class: "",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);



    const HandleRemoveFriend = async () => {
        try {
            const res = await request(`${API_BASE}/api/friends/unfriend/${id}`,"DELETE");



            if (!res.ok) throw new Error("Не удалось удалить из друзей");
            window.location.reload();
        } catch (err) {

            toast.error("Ошибка: " + err.message);
        }
    };

    const HandleSendFriendRequest = async () => {
        if (isMe) return toast.error("Нельзя отправить запрос самому себе.");
        if (isFriend) return toast.error("Вы уже друзья.");
        if (requestSent) return toast.error("Запрос уже отправлен.");

        setSendingRequest(true);
        try {
            const res = await request(`${API_BASE}/api/friends/send/${id}`,'POST');
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Ошибка при отправке запроса");
            }
            setRequestSent(true);
            toast.success("Запрос в друзья отправлен!");
        } catch (err) {
            toast.error("Ошибка: " + err.message);
        } finally {
            setSendingRequest(false);
        }
    };

    useEffect(() => {
        async function fetchUser() {
            try {
                setLoading(true);
                setError(null);

                const res = await request(`${API_BASE}/api/user/${id}`,'GET');

                if (!res.ok) throw new Error("Пользователь не найден или нет доступа");

                const data = await res.json();
                setUser(data);

                const myId = getMyId();
                setIsMe(id === myId);

                const friendIds = data.friends?.map((f) => f.friendId) || [];
                setIsFriend(friendIds.includes(myId));

                setEditData({
                    name: data.profile.name || "",
                    description: data.profile.description || "",
                    status: data.profile.status || "",
                    avatarUrl: data.profile.avatarUrl || "",
                    class: data.profile.class || "",
                });

                if (data.friends && data.friends.length > 0) {
                    const friendsData = await Promise.all(
                        data.friends.map(async (friend) => {
                            const friendRes = await request(`${API_BASE}/api/user/${friend.friendId}`,'GET');
                            if (!friendRes.ok) return null;
                            return await friendRes.json();
                        })
                    );
                    setFriends(friendsData.filter(Boolean));
                } else {
                    setFriends([]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [id]);

    const toggleFriends = () => setShowFriends((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            const res = await request(`${API_BASE}/api/user/me`,"POST",JSON.stringify(editData));

            if (!res.ok) throw new Error("Ошибка при обновлении");

            const updated = await res.json();
            toast.success("Профиль обновлён!");
            setUser((prev) => ({ ...prev, profile: updated }));
            setEditOpen(false);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <h2 style={{ padding: 20 }}>Загрузка...</h2>;
    if (error) return <h2 style={{ padding: 20 }}>{error}</h2>;
    if (!user || !user.profile) return <h2 style={{ padding: 20 }}>Пользователь не найден</h2>;

    return (
        <div style={{ backgroundColor: "#c0b4b4", padding: 20, fontFamily: "sans-serif", borderRadius: 10 }}>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                stacked
            />
            {/* Header */}
            <div style={{
                marginBottom: "15px",
                backgroundColor: "#dcdcdc",
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 10,
                flexWrap: "wrap",
            }}>
                <img
                    src={user.profile.avatarUrl || "/default-avatar.png"}
                    alt="Аватар"
                    style={{ borderRadius: "50%", width: 100, height: 100 }}
                />
                <div>
                    <h2 style={{ margin: 0 }}>{user.profile.name || "Без имени"}</h2>
                    <p style={{ margin: "4px 0" }}>{user.profile.description || "Описание отсутствует"}</p>
                    <p style={{ margin: "4px 0", fontStyle: "italic", fontSize: 14 }}>
                        Статус: {user.profile.status || "нет статуса"}
                    </p>
                    <p style={{ margin: 0, fontSize: 14 }}>
                        Класс: {user.profile.class || "не указан"}
                    </p>
                </div>

                {!isMe ? (
                    isFriend ? (
                        <button onClick={HandleRemoveFriend} style={buttonStyle}>
                            Удалить из друзей
                        </button>
                    ) : (
                        <button
                            onClick={HandleSendFriendRequest}
                            style={buttonStyle}
                            disabled={sendingRequest || requestSent}
                        >
                            {requestSent ? "Запрос отправлен" : "Добавить в друзья"}
                        </button>
                    )
                ) : (
                    <button onClick={handleOpen} style={buttonStyle}>
                        Изменить профиль
                    </button>
                )}
            </div>

            {/* Modal */}
            <Modal open={editOpen} onClose={handleClose} closeAfterTransition slots={{ backdrop: Backdrop }}
                   slotProps={{ backdrop: { timeout: 500 } }}>
                <Fade in={editOpen}>
                    <Box sx={style} component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6" mb={2}>Редактирование профиля</Typography>
                        <TextField label="Имя" value={editData.name} onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))} fullWidth margin="normal" />
                        <TextField label="Описание" value={editData.description} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} fullWidth margin="normal" multiline rows={3} />
                        <TextField label="Статус" value={editData.status} onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))} fullWidth margin="normal" />
                        <TextField label="Класс" value={editData.class} onChange={(e) => setEditData(prev => ({ ...prev, class: e.target.value }))} fullWidth margin="normal" />
                        <TextField label="Ссылка на аватар (макс. 100 символов)" value={editData.avatarUrl} onChange={(e) => setEditData(prev => ({ ...prev, avatarUrl: e.target.value }))} fullWidth margin="normal" inputProps={{ maxLength: 100 }} helperText={`${editData.avatarUrl.length}/100 символов`} />
                        {formError && <Typography color="error" mt={2}>{formError}</Typography>}
                        <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ mt: 3 }} fullWidth>
                            {saving ? "Сохраняем..." : "Сохранить"}
                        </Button>
                        <Button type="button" onClick={handleClose} sx={{ mt: 1 }} fullWidth variant="outlined">Отмена</Button>
                    </Box>
                </Fade>
            </Modal>

            {/* Toggle Friends */}
            <div style={{ marginBottom: 15 }}>
                <button onClick={toggleFriends} style={{ ...buttonStyle, display: window.innerWidth <= 768 ? "block" : "none", width: "100%" }}>
                    {showFriends ? "Скрыть друзей" : "Показать друзей"}
                </button>
            </div>

            {/* Main Content */}
            <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", gap: 20 }}>
                <div style={{ flex: 2, backgroundColor: "#5c5c5c", color: "white", padding: 20, borderRadius: 10 }}>
                    <h3>Контент пользователя</h3>
                </div>

                {showFriends && (
                    <div style={{ flex: 0.5, backgroundColor: "#7a7a7a", color: "white", padding: 20, borderRadius: 10 }}>
                        <h3>Друзья</h3>
                        {friends.length > 0 ? (
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {friends.map((friend) => (
                                    <li key={friend.id} style={{ marginBottom: 10 }}>
                                        <Link to={`/profile/${friend.id}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "white", textDecoration: "none" }}>
                                            <img src={friend.profile.avatarUrl || "/default-avatar.png"} alt="друг" width={25} height={25} style={{ borderRadius: "50%" }} />
                                            <span>{friend.profile.name || "Без имени"}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Нет друзей</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const buttonStyle = {
    backgroundColor: "#4e4a4a",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: 10,
};
