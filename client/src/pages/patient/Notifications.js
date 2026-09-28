import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './Notifications.css';

const TYPE_ICONS = {
  appointment_booked: '📅', appointment_approved: '✅', appointment_rejected: '❌',
  appointment_cancelled: '🚫', appointment_rescheduled: '🔄', doctor_approved: '🎉',
  doctor_rejected: '❌', prescription_created: '💊', appointment_reminder: '⏰', general: '🔔',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    notificationAPI.getAll().then(r => setNotifications(r.data)).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
  };

  const handleMarkAll = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    toast.success('All marked as read');
  };

  const handleDeleteRead = async () => {
    await notificationAPI.deleteRead();
    setNotifications(prev => prev.filter(n => !n.isRead));
    toast.success('Read notifications deleted');
  };

  const filtered = tab === 'unread' ? notifications.filter(n => !n.isRead)
    : tab === 'read' ? notifications.filter(n => n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {unreadCount > 0 && (
            <button className="btn-cs btn-outline btn-sm" onClick={handleMarkAll}>
              <CheckCheck size={14}/> Mark All Read
            </button>
          )}
          <button className="btn-cs btn-ghost btn-sm" onClick={handleDeleteRead}>
            <Trash2 size={14}/> Delete Read
          </button>
        </div>
      </div>

      <div className="cs-tabs">
        <button className={`cs-tab ${tab==='all'?'active':''}`} onClick={() => setTab('all')}>All ({notifications.length})</button>
        <button className={`cs-tab ${tab==='unread'?'active':''}`} onClick={() => setTab('unread')}>Unread ({unreadCount})</button>
        <button className={`cs-tab ${tab==='read'?'active':''}`} onClick={() => setTab('read')}>Read ({notifications.length - unreadCount})</button>
      </div>

      {loading ? <div className="cs-loading" style={{minHeight:300}}><div className="cs-spinner"/></div>
      : filtered.length === 0 ? (
        <div className="empty-state cs-card"><Bell size={48}/><h3>No notifications</h3></div>
      ) : (
        <div className="notifs-list cs-card" style={{padding:0,overflow:'hidden'}}>
          {filtered.map((n, i) => (
            <div key={n._id} className={`notif-row ${!n.isRead ? 'unread' : ''} ${i < filtered.length-1 ? 'bordered' : ''}`}
              onClick={() => !n.isRead && handleMarkRead(n._id)}>
              <div className="notif-type-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
              <div className="notif-body">
                <p className="notif-msg">{n.message}</p>
                <small className="notif-time">{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              {!n.isRead && <div className="notif-unread-dot"/>}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
