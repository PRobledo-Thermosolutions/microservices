import {
    useWebSocketContext,
} from "../hooks/WebSocketContext";

/**
 * Componente para mostrar notificaciones globales
 */
const GlobalNotifications = () => {
    const { notifications, markNotificationAsRead } = useWebSocketContext();

    if (notifications.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 1000,
                maxWidth: "300px",
            }}
        >
            {notifications.slice(0, 5).map((notification) => (
                <div
                    key={notification.id}
                    style={{
                        marginBottom: "10px",
                        padding: "15px",
                        borderRadius: "8px",
                        backgroundColor:
                            notification.type === "success"
                                ? "#d4edda"
                                : notification.type === "error"
                                    ? "#f8d7da"
                                    : "#d1ecf1",
                        border: `1px solid ${notification.type === "success"
                                ? "#c3e6cb"
                                : notification.type === "error"
                                    ? "#f5c6cb"
                                    : "#bee5eb"
                            }`,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        animation: "slideInRight 0.3s ease-out",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: "14px" }}>{notification.title}</strong>
                            <p
                                style={{
                                    margin: "5px 0 0 0",
                                    fontSize: "13px",
                                    lineHeight: "1.4",
                                }}
                            >
                                {notification.message}
                            </p>
                            <small style={{ color: "#666", fontSize: "11px" }}>
                                {new Date(notification.timestamp).toLocaleTimeString()}
                            </small>
                        </div>
                        <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "18px",
                                cursor: "pointer",
                                color: "#666",
                                marginLeft: "10px",
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}

            <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};

export default GlobalNotifications;
