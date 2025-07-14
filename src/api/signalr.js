import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("localhost:5000/chatHub") // URL хаба с бэкенда
    .withAutomaticReconnect()
    .build();

export default connection;
