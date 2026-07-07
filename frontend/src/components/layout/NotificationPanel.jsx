import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";

export default function NotificationPanel({ isOpen, onClose, notifications = [] }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-40 w-80 rounded-lg border border-white/[0.08] bg-bg/95 backdrop-blur-xl shadow-2xl md:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                <h2 className="font-semibold">Notifications</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 hover:bg-white/[0.05]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
                  <Bell size={32} className="text-muted opacity-50" />
                  <p className="text-sm text-muted">No notifications yet</p>
                  <p className="text-xs text-muted/50">
                    You'll see game updates and achievements here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.08]">
                  {notifications.map((notification, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-primary px-5 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted">{notification.message}</p>
                      <p className="text-xs text-muted/50 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
