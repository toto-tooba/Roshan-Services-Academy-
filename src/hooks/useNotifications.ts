import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export interface AppNotification {
  id: string;
  type: 'message' | 'class_accepted' | 'class_uploaded' | 'article_uploaded' | 'app_update';
  title: string;
  content: string;
  time: Date;
  read: boolean;
  link: string;
  meta?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [rawNotifications, setRawNotifications] = useState<Omit<AppNotification, 'read'>[]>([]);
  const [readIds, setReadIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('read_notifications');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track the currently active discussion classroom in ClassroomView 
  const [activeClassroomChatId, setActiveClassroomChatId] = useState<string | null>(null);

  // Helper to persist read notification IDs
  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev[id]) return prev;
      const updated = { ...prev, [id]: true };
      localStorage.setItem('read_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Sync state whenever rawNotifications or readIds changes
  const notifications = useMemo(() => {
    return rawNotifications.map(notif => {
      const isRead = !!readIds[notif.id];
      if (notif.type === 'message') {
        const count = notif.meta?.messageCount || 1;
        const senderName = notif.meta?.senderName || 'Instructor';
        const latestText = notif.meta?.latestText || '';
        return {
          ...notif,
          read: isRead,
          content: isRead
            ? `${senderName}: "${latestText}"`
            : count === 1
            ? `New message from ${senderName}: "${latestText}"`
            : `You have ${count} unread messages in this classroom.`
        } as AppNotification;
      }
      return {
        ...notif,
        read: isRead,
      } as AppNotification;
    });
  }, [rawNotifications, readIds]);

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const next = { ...prev };
      let changed = false;
      notifications.forEach(notif => {
        if (!next[notif.id]) {
          next[notif.id] = true;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('read_notifications', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, [notifications]);

  // Subscribe to Firebase notifications
  useEffect(() => {
    if (!user) {
      setRawNotifications([]);
      return;
    }

    const unsubs: (() => void)[] = [];
    const dynamicNotificationsMap: Record<string, Omit<AppNotification, 'read'>> = {};

    const updateNotificationsState = () => {
      const list = Object.values(dynamicNotificationsMap)
        .sort((a, b) => b.time.getTime() - a.time.getTime());
      setRawNotifications(list);
    };

    // 1. LISTEN TO CLASSROOM CHAT MESSAGES
    const classroomsQuery = query(
      collection(db, 'classrooms'),
      where('memberIds', 'array-contains', user.uid)
    );

    const activeMessageUnsubs = new Map<string, () => void>();

    const unsubClassrooms = onSnapshot(classroomsQuery, (snapshot) => {
      const currentClassroomIds = new Set<string>();

      snapshot.docs.forEach(classroomDoc => {
        const classroomId = classroomDoc.id;
        const classroomName = classroomDoc.data().name || 'Classroom';
        currentClassroomIds.add(classroomId);

        // Avoid recreating existing listeners
        if (activeMessageUnsubs.has(classroomId)) return;

        // Query latest messages to aggregate
        const messagesQuery = query(
          collection(db, `classrooms/${classroomId}/messages`),
          orderBy('createdAt', 'desc'),
          limit(15)
        );

        const unsubMessages = onSnapshot(messagesQuery, (msgSnapshot) => {
          const otherMessages = msgSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() as any }))
            .filter(msg => msg.senderId !== user.uid);

          const mapKey = `msg_group_${classroomId}`;

          if (otherMessages.length > 0) {
            const latestMsg = otherMessages[0];
            const latestMsgId = latestMsg.id;
            const latestMsgText = latestMsg.text || 'posted a media file';
            const latestSenderName = latestMsg.senderName || 'Instructor';
            const latestMsgTime = latestMsg.createdAt?.toDate ? latestMsg.createdAt.toDate() : new Date();

            const actualNotifId = `msg_group_${classroomId}_${latestMsgId}`;

            dynamicNotificationsMap[mapKey] = {
              id: actualNotifId,
              type: 'message',
              title: `Chat in ${classroomName}`,
              content: '', // populated in useMemo dynamically based on live readIds state
              time: latestMsgTime,
              link: 'classrooms',
              meta: { 
                classroomId, 
                messageCount: otherMessages.length, 
                latestText: latestMsgText, 
                senderName: latestSenderName 
              }
            };
          } else {
            delete dynamicNotificationsMap[mapKey];
          }
          updateNotificationsState();
        }, (err) => {
          console.error(`Failed to fetch messages for classroom ${classroomId}:`, err);
        });

        activeMessageUnsubs.set(classroomId, unsubMessages);
      });

      // Clean up listeners for removed classrooms
      for (const [classroomId, unsub] of activeMessageUnsubs.entries()) {
        if (!currentClassroomIds.has(classroomId)) {
          unsub();
          activeMessageUnsubs.delete(classroomId);
          delete dynamicNotificationsMap[`msg_group_${classroomId}`];
        }
      }
      updateNotificationsState();
    }, (err) => {
      console.error('Failed to fetch classrooms for notifications:', err);
    });

    unsubs.push(() => {
      unsubClassrooms();
      for (const unsub of activeMessageUnsubs.values()) {
        unsub();
      }
      activeMessageUnsubs.clear();
    });

    // 2. LISTEN TO ACTIVE USER'S CLASS_REQUESTS (For Accepted statuses)
    const requestsQuery = query(
      collection(db, 'class_requests'),
      where('uid', '==', user.uid)
    );

    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const reqData = doc.data();
        if (reqData.status === 'accepted') {
          const reqId = doc.id;
          const topic = reqData.topic;
          const time = reqData.accepted_at?.toDate ? reqData.accepted_at.toDate() : new Date();
          const notifId = `req_accepted_${reqId}`;

          dynamicNotificationsMap[notifId] = {
            id: notifId,
            type: 'class_accepted',
            title: 'Class Request Accepted',
            content: `Your class demand for "${topic}" has been accepted!`,
            time,
            link: 'live_classes',
            meta: { requestId: reqId }
          };
        }
      });
      updateNotificationsState();
    }, (err) => {
      console.error('Failed to listen to class requests:', err);
    });

    unsubs.push(unsubRequests);

    // 3. LISTEN TO NEW LIVE CLASSES (Scheduled / Uploaded)
    const liveClassesQuery = query(
      collection(db, 'live_classes'),
      orderBy('start_time', 'desc'),
      limit(10)
    );

    const unsubLiveClasses = onSnapshot(liveClassesQuery, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const classData = doc.data();
        const classId = doc.id;
        const topic = classData.topic;
        const teacher = classData.teacher_name || 'Instructor';
        const time = classData.created_at?.toDate ? classData.created_at.toDate() : new Date();
        const notifId = `class_uploaded_${classId}`;

        dynamicNotificationsMap[notifId] = {
          id: notifId,
          type: 'class_uploaded',
          title: 'New Class Scheduled',
          content: `New lecture on "${topic}" uploaded by ${teacher}.`,
          time,
          link: 'live_classes',
          meta: { classId }
        };
      });
      updateNotificationsState();
    }, (err) => {
      console.error('Failed to listen to live classes:', err);
    });

    unsubs.push(unsubLiveClasses);

    // 4. LISTEN TO ARTICLES & APP UPDATES
    const articlesQuery = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc'),
      limit(15)
    );

    const unsubArticles = onSnapshot(articlesQuery, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const articleData = doc.data();
        const articleId = doc.id;
        const title = articleData.title || '';
        const category = articleData.category || '';
        const isUpdate = category.toLowerCase().includes('update') || 
                         title.toLowerCase().includes('update') || 
                         title.toLowerCase().includes('v1.') || 
                         title.toLowerCase().includes('patch');
                         
        const time = articleData.createdAt?.toDate ? articleData.createdAt.toDate() : new Date();
        const notifId = `article_${articleId}`;

        dynamicNotificationsMap[notifId] = {
          id: notifId,
          type: isUpdate ? 'app_update' : 'article_uploaded',
          title: isUpdate ? 'App Operational Update' : 'New Article Published',
          content: title,
          time,
          link: 'articles',
          meta: { articleId }
        };
      });
      updateNotificationsState();
    }, (err) => {
      console.error('Failed to listen to articles:', err);
    });

    unsubs.push(unsubArticles);

    return () => {
      unsubs.forEach(unsub => {
        try {
          unsub();
        } catch (e) {
          // ignore cleanup
        }
      });
    };
  }, [user]);

  // Automatically mark active chat messages as read instantly when they arrive or when activeClassroomChatId changes
  useEffect(() => {
    if (!activeClassroomChatId) return;

    const unreadMessagesInActiveChat = rawNotifications.filter(
      notif => notif.type === 'message' && 
               notif.meta?.classroomId === activeClassroomChatId && 
               !readIds[notif.id]
    );

    if (unreadMessagesInActiveChat.length > 0) {
      setReadIds(prev => {
        const next = { ...prev };
        let changed = false;
        unreadMessagesInActiveChat.forEach(notif => {
          if (!next[notif.id]) {
            next[notif.id] = true;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('read_notifications', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }
  }, [activeClassroomChatId, rawNotifications, readIds]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    setActiveClassroomChatId
  };
};
