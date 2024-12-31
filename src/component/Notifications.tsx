import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const Notifications = () => {
    const [notifications, setNotifications] = useState<string[]>([]);

    useEffect(() => {
        // Kết nối đến SignalR Hub
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/notificationHub") // Địa chỉ backend
            .withAutomaticReconnect()
            .build();

        // Nhận thông báo từ server
        connection.on("ReceiveNotification", (message) => {
            setNotifications((prev) => [...prev, message]);
        });

        connection
            .start()
            .then(() => console.log("SignalR Connected"))
            .catch((err) => console.error("SignalR Connection Error:", err));

        // Hủy kết nối khi component bị unmount
        return () => {
            connection.stop();
        };
    }, []);

    return (
        <ul>
            {notifications.map((notification, index) => (
                <li key={index}>{notification}</li>
            ))}
        </ul>
    );
};

export default Notifications;
