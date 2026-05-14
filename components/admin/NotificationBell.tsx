"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import type { Notification } from "@/lib/types/domain";
import { getNotificationsAction, markReadAction, markAllReadAction } from "@/lib/actions/notifications";

interface NotificationBellProps {
  initialUnread: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${d}j`;
}

export function NotificationBell({ initialUnread }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loaded, setLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleOpen() {
    setOpen((prev) => !prev);
    if (!loaded) {
      startTransition(async () => {
        const result = await getNotificationsAction();
        if (result.data) {
          setNotifications(result.data);
          setUnread(result.data.filter((n) => !n.isRead).length);
        }
        setLoaded(true);
      });
    }
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      router.refresh();
    });
  }

  function handleNotificationClick(notif: Notification) {
    if (!notif.isRead) handleMarkRead(notif.id);
    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-800">
              Notifications
              {unread > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full">
                  {unread} non lue{unread > 1 ? "s" : ""}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={isPending}
                  title="Tout marquer comme lu"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {!loaded && isPending ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-slate-400">Chargement…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Aucune notification</p>
              </div>
            ) : notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${notif.isRead ? "" : "bg-blue-50/40"}`}
              >
                {/* Dot non lu */}
                <div className="mt-1.5 shrink-0">
                  {!notif.isRead ? (
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold text-slate-800 leading-snug ${notif.isRead ? "opacity-60" : ""}`}>
                    {notif.title}
                  </p>
                  <p className={`text-[11px] text-slate-500 mt-0.5 leading-snug ${notif.isRead ? "opacity-50" : ""}`}>
                    {notif.body}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                    disabled={isPending}
                    title="Marquer comme lu"
                    className="shrink-0 mt-0.5 w-6 h-6 rounded-lg hover:bg-blue-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
