"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info", duration = 5000) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => removeNotification(id), duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationPopup
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

const NotificationPopup = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-2 right-2 z-100 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const { type, id, message } = notification;

  const typeStyles = {
    error: {
      light: "bg-red-100 border-red-500 text-red-700",
      dark: "dark:bg-red-900 dark:border-red-700 dark:text-red-200",
    },
    success: {
      light: "bg-green-100 border-green-500 text-green-700",
      dark: "dark:bg-green-900 dark:border-green-700 dark:text-green-200",
    },
    info: {
      light: "bg-blue-100 border-blue-500 text-blue-700",
      dark: "dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200",
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`p-4 rounded-lg shadow-lg border-l-4 min-w-64 ${styles.light} ${styles.dark}`}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold">{message}</span>
        <button
          onClick={() => onRemove(id)}
          className={`ml-4 ${styles.light} ${styles.dark} cursor-pointer size-6 text-2xl inline-flex justify-center items-center`}
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
