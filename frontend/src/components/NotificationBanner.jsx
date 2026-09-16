import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../store/complaintsSlice';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function NotificationBanner() {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.complaints.notification);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold ${
        isSuccess
          ? 'bg-emerald-600 text-white border-emerald-500'
          : 'bg-rose-600 text-white border-rose-500'
      }`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span>{notification.message}</span>
        <button
          onClick={() => dispatch(clearNotification())}
          className="p-1 hover:bg-white/20 rounded-md transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
