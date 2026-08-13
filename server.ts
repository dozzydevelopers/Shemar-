import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_CELEBRITIES,
  INITIAL_FANS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_INVITATIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_NOTIFICATIONS,
} from './src/data/initialData.ts';
import { generatePHPCodebase } from './src/data/phpExporter.ts';
import {
  User,
  Celebrity,
  Fan,
  Conversation,
  Message,
  Invitation,
  Report,
  AuditLog,
  SystemSettings,
  AppNotification,
} from './src/types.ts';
import { executeGlobalSearch } from './src/search/globalSearch.ts';
import { WebResearchAgent } from './src/ai/webResearchAgent.ts';
import { FactCheckAgent } from './src/ai/factCheckAgent.ts';
import { NewsAgent } from './src/ai/newsAgent.ts';
import { PaymentService } from './src/services/paymentService.ts';
import { VerificationService } from './src/services/verificationService.ts';
import { TelephonyService } from './src/services/telephonyService.ts';
import { ObservabilityService } from './src/services/observabilityService.ts';
import { PrivacyService } from './src/services/privacyService.ts';
import { FeatureFlagsService } from './src/services/featureFlagsService.ts';

// State Persistence Engine
let usersStore: User[] = [...INITIAL_USERS];
let celebritiesStore: Celebrity[] = [...INITIAL_CELEBRITIES];
let fansStore: Fan[] = [...INITIAL_FANS];
let conversationsStore: Conversation[] = [...INITIAL_CONVERSATIONS];
let messagesStore: Message[] = [...INITIAL_MESSAGES];
let invitationsStore: Invitation[] = [...INITIAL_INVITATIONS];
let reportsStore: Report[] = [...INITIAL_REPORTS];
let auditLogsStore: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let settingsStore: SystemSettings = { ...INITIAL_SYSTEM_SETTINGS };
let notificationsStore: AppNotification[] = [...INITIAL_NOTIFICATIONS];

// Default current session for app startup: Super Admin (Shemar Moore)
let currentUser: User = usersStore[0];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper log function
  const addAuditLog = (userId: string, userName: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      userId,
      userName,
      action,
      details,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    auditLogsStore.unshift(newLog);
  };

  // 1. Health API
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // 2. Bootstrap API
  app.get('/api/bootstrap', (req: Request, res: Response) => {
    const userNotifications = notificationsStore.filter(
      (n) => n.recipientId === currentUser.id || currentUser.role === 'super_admin'
    );

    res.json({
      currentUser,
      users: usersStore,
      celebrities: celebritiesStore,
      fans: fansStore,
      conversations: conversationsStore,
      messages: messagesStore,
      invitations: invitationsStore,
      reports: reportsStore,
      auditLogs: auditLogsStore,
      settings: settingsStore,
      notifications: userNotifications,
    });
  });

  // 3. Switch active user session (for multi-tenant demo testing)
  app.post('/api/auth/switch-user', (req: Request, res: Response) => {
    const { userId } = req.body;
    const targetUser = usersStore.find((u) => u.id === userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    currentUser = targetUser;
    addAuditLog(currentUser.id, currentUser.name, 'SWITCH_SESSION', `Switched active session to ${currentUser.name} (${currentUser.role})`);
    res.json({ status: 'success', currentUser });
  });

  // 4. Auth - Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended by the platform administrator.' });
    }

    currentUser = user;
    addAuditLog(user.id, user.name, 'USER_LOGIN', `Successfully logged in as ${user.email}`);
    res.json({ status: 'success', user });
  });

  // 5. Auth - Fan Registration
  app.post('/api/auth/register-fan', (req: Request, res: Response) => {
    const { name, email, password, celebrityId } = req.body;

    if (!name || !email || !password || !celebrityId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const assignedCeleb = celebritiesStore.find((c) => c.id === celebrityId);
    if (!assignedCeleb) {
      return res.status(400).json({ error: 'Selected celebrity profile not found.' });
    }

    const userId = `usr_fan_${Date.now()}`;
    const fanId = `fan_${Date.now()}`;

    const newUser: User = {
      id: userId,
      name,
      username: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      email: email.trim().toLowerCase(),
      role: 'fan',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`,
      status: 'active',
      celebrityId: assignedCeleb.id,
      onlineStatus: 'online',
      lastSeen: 'Just now',
      createdAt: new Date().toISOString(),
    };

    const newFan: Fan = {
      id: fanId,
      userId,
      name,
      email: email.trim().toLowerCase(),
      avatar: newUser.avatar,
      assignedCelebrityId: assignedCeleb.id,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Increment celebrity fan count
    assignedCeleb.fanCount += 1;

    // Create initial conversation between this Fan and Celebrity
    const convId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: convId,
      celebrityId: assignedCeleb.id,
      fanId: newFan.id,
      fanName: name,
      fanAvatar: newUser.avatar,
      fanEmail: email.trim().toLowerCase(),
      lastMessageText: `Welcome to ${assignedCeleb.displayName}'s private chat!`,
      lastMessageTime: 'Just now',
      unreadCountCelebrity: 1,
      unreadCountFan: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Seed welcoming message from celebrity
    const welcomeMsg: Message = {
      id: `msg_welcome_${Date.now()}`,
      conversationId: convId,
      senderId: assignedCeleb.userId,
      senderName: assignedCeleb.displayName,
      senderRole: 'celebrity',
      text: `Hello ${name}! Welcome to my private VIP chat space. Feel free to leave me a message! ✨`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    usersStore.push(newUser);
    fansStore.push(newFan);
    conversationsStore.unshift(newConv);
    messagesStore.push(welcomeMsg);

    currentUser = newUser;
    addAuditLog(newUser.id, newUser.name, 'FAN_REGISTER', `Registered new fan assigned to ${assignedCeleb.displayName}`);

    res.json({ status: 'success', user: newUser, conversation: newConv });
  });

  // 6. Super Admin - Invite Celebrity
  app.post('/api/admin/invite-celebrity', (req: Request, res: Response) => {
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Permission denied. Super Admin required.' });
    }

    const { displayName, username, email, bio, avatar } = req.body;
    if (!displayName || !username || !email) {
      return res.status(400).json({ error: 'Display Name, Username, and Email are required.' });
    }

    const token = `CELEB_INV_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newInv: Invitation = {
      id: `inv_${Date.now()}`,
      celebrityDisplayName: displayName,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: email.trim().toLowerCase(),
      token,
      bio: bio || 'Official celebrity VIP profile.',
      avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      status: 'pending',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    invitationsStore.unshift(newInv);
    addAuditLog(currentUser.id, currentUser.name, 'INVITE_CELEBRITY', `Created invite link for ${displayName} (${token})`);

    res.json({
      status: 'success',
      invitation: newInv,
      inviteUrl: `${process.env.APP_URL || 'http://localhost:3000'}/invite/${token}`,
    });
  });

  // 7. Activate Celebrity via Invite Token
  app.post('/api/auth/activate-celebrity', (req: Request, res: Response) => {
    const { token, password } = req.body;

    const inv = invitationsStore.find((i) => i.token === token && i.status === 'pending');
    if (!inv) {
      return res.status(400).json({ error: 'Invalid or expired invitation token.' });
    }

    const userId = `usr_celeb_${Date.now()}`;
    const celebId = `celeb_${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: inv.celebrityDisplayName,
      username: inv.username,
      email: inv.email,
      role: 'celebrity',
      avatar: inv.avatar,
      bio: inv.bio,
      isVerified: true,
      status: 'active',
      celebrityId: celebId,
      onlineStatus: 'online',
      lastSeen: 'Just now',
      createdAt: new Date().toISOString(),
    };

    const newCeleb: Celebrity = {
      id: celebId,
      userId,
      displayName: inv.celebrityDisplayName,
      username: inv.username,
      email: inv.email,
      bio: inv.bio,
      avatar: inv.avatar,
      isVerified: true,
      status: 'active',
      fanCount: 0,
      totalMessagesSent: 0,
      createdAt: new Date().toISOString(),
    };

    inv.status = 'accepted';
    usersStore.push(newUser);
    celebritiesStore.push(newCeleb);

    currentUser = newUser;
    addAuditLog(newUser.id, newUser.name, 'ACTIVATE_CELEBRITY', `Activated celebrity account for ${inv.celebrityDisplayName}`);

    res.json({ status: 'success', user: newUser, celebrity: newCeleb });
  });

  // Create or retrieve conversation dynamically
  app.post('/api/conversations/start', (req: Request, res: Response) => {
    const { celebrityId } = req.body;
    if (!celebrityId) {
      return res.status(400).json({ error: 'Celebrity ID is required' });
    }

    const celeb = celebritiesStore.find((c) => c.id === celebrityId);
    if (!celeb) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    let fanRecord = fansStore.find((f) => f.userId === currentUser.id);
    if (!fanRecord) {
      if (currentUser.role === 'fan') {
        fanRecord = {
          id: `fan_${Date.now()}`,
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          assignedCelebrityId: celebrityId,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        fansStore.push(fanRecord);
      } else {
        return res.status(400).json({ error: 'Only fans can initiate chats.' });
      }
    }

    let conv = conversationsStore.find(
      (c) => c.celebrityId === celebrityId && c.fanId === fanRecord!.id
    );

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        celebrityId: celebrityId,
        fanId: fanRecord.id,
        fanName: currentUser.name,
        fanAvatar: currentUser.avatar,
        fanEmail: currentUser.email,
        lastMessageText: `Welcome to ${celeb.displayName}'s private chat!`,
        lastMessageTime: 'Just now',
        unreadCountCelebrity: 1,
        unreadCountFan: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      conversationsStore.unshift(conv);

      const welcomeMsg: Message = {
        id: `msg_welcome_${Date.now()}`,
        conversationId: conv.id,
        senderId: celeb.userId,
        senderName: celeb.displayName,
        senderRole: 'celebrity',
        text: `Hello ${currentUser.name}! Welcome to my private VIP chat space. Feel free to leave me a message! ✨`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      messagesStore.push(welcomeMsg);
    }

    res.json({ status: 'success', conversation: conv });
  });

  // 8. Conversations endpoint (Enforces strict data isolation!)
  app.get('/api/conversations', (req: Request, res: Response) => {
    let filteredConvs: Conversation[] = [];

    if (currentUser.role === 'super_admin') {
      // Super Admin sees all conversations across platform
      filteredConvs = conversationsStore;
    } else if (currentUser.role === 'celebrity') {
      // Celebrity strictly sees ONLY conversations where celebrityId matches their celebrityId
      filteredConvs = conversationsStore.filter((c) => c.celebrityId === currentUser.celebrityId);
    } else if (currentUser.role === 'fan') {
      // Fan strictly sees conversations where fanId matches their fan record
      const fanRecord = fansStore.find((f) => f.userId === currentUser.id);
      if (fanRecord) {
        filteredConvs = conversationsStore.filter((c) => c.fanId === fanRecord.id);
      }
    }

    res.json({ status: 'success', conversations: filteredConvs });
  });

  // 9. Messages endpoint (Enforces strict data isolation!)
  app.get('/api/messages/:conversationId', (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const conv = conversationsStore.find((c) => c.id === conversationId);

    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // MULTI-TENANT AUTHORIZATION CHECK
    if (currentUser.role === 'celebrity' && conv.celebrityId !== currentUser.celebrityId) {
      return res.status(403).json({
        error: 'Security Authorization Error: You cannot access conversations belonging to another celebrity.',
      });
    }

    if (currentUser.role === 'fan') {
      const fanRecord = fansStore.find((f) => f.userId === currentUser.id);
      if (!fanRecord || conv.fanId !== fanRecord.id) {
        return res.status(403).json({ error: 'Access Denied: Conversation does not belong to your account.' });
      }
    }

    // Clear unread counter for current reader
    if (currentUser.role === 'celebrity' || currentUser.role === 'super_admin') {
      conv.unreadCountCelebrity = 0;
    } else if (currentUser.role === 'fan') {
      conv.unreadCountFan = 0;
    }

    const conversationMessages = messagesStore.filter((m) => m.conversationId === conversationId);
    res.json({ status: 'success', messages: conversationMessages, conversation: conv });
  });

  // 10. Send Message API
  app.post('/api/messages', (req: Request, res: Response) => {
    const { conversationId, text, attachment } = req.body;

    const conv = conversationsStore.find((c) => c.id === conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // MULTI-TENANT AUTHORIZATION CHECK
    if (currentUser.role === 'celebrity' && conv.celebrityId !== currentUser.celebrityId) {
      return res.status(403).json({ error: 'Unauthorized message dispatch.' });
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: text ? text.trim() : (attachment ? `Sent attachment: ${attachment.name}` : ''),
      attachment,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    messagesStore.push(newMsg);

    // Update conversation metadata
    conv.lastMessageText = newMsg.text;
    conv.lastMessageTime = 'Just now';

    if (currentUser.role === 'fan') {
      conv.unreadCountCelebrity += 1;
    } else {
      conv.unreadCountFan += 1;
      // Increment celebrity total messages count
      const celeb = celebritiesStore.find((c) => c.id === conv.celebrityId);
      if (celeb) celeb.totalMessagesSent += 1;
    }

    // Determine recipient user ID
    let recipientUserId = '';
    let notifType: any = 'message';

    if (currentUser.role === 'fan') {
      const celeb = celebritiesStore.find((c) => c.id === conv.celebrityId);
      if (celeb) recipientUserId = celeb.userId;
      notifType = 'message';
    } else {
      const fanObj = fansStore.find((f) => f.id === conv.fanId);
      if (fanObj) recipientUserId = fanObj.userId;
      notifType = 'celebrity_reply';
    }

    if (recipientUserId) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        recipientId: recipientUserId,
        celebrityId: conv.celebrityId,
        conversationId: conv.id,
        type: notifType,
        title: notifType === 'celebrity_reply' ? `${currentUser.name} replied!` : `New message from ${currentUser.name}`,
        body: newMsg.text.slice(0, 100),
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      notificationsStore.unshift(newNotif);
    }

    res.json({ status: 'success', message: newMsg, conversation: conv });
  });

  // 11. Delete Message
  app.post('/api/messages/delete', (req: Request, res: Response) => {
    const { messageId } = req.body;
    const msg = messagesStore.find((m) => m.id === messageId);

    if (!msg) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    // Only sender or Super Admin can delete
    if (msg.senderId !== currentUser.id && currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this message.' });
    }

    msg.isDeleted = true;
    msg.text = 'This message was deleted';
    delete msg.attachment;

    res.json({ status: 'success', message: msg });
  });

  // 12. Submit Report
  app.post('/api/reports', (req: Request, res: Response) => {
    const { reportedUserId, reportedUserName, messageId, messageText, reason } = req.body;

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reportedUserId,
      reportedUserName,
      messageId,
      messageText,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    reportsStore.unshift(newReport);
    addAuditLog(currentUser.id, currentUser.name, 'SUBMIT_REPORT', `Reported user ${reportedUserName} for: ${reason}`);

    res.json({ status: 'success', report: newReport });
  });

  // 13. Super Admin - Action Report
  app.post('/api/admin/reports/action', (req: Request, res: Response) => {
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required.' });
    }

    const { reportId, action } = req.body; // action: 'dismiss' | 'actioned'
    const report = reportsStore.find((r) => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    report.status = action;
    addAuditLog(currentUser.id, currentUser.name, 'ACTION_REPORT', `Updated report ${reportId} status to ${action}`);

    res.json({ status: 'success', report });
  });

  // 14. Super Admin - Toggle Celebrity Account Status (Suspend / Reactivate)
  app.post('/api/admin/celebrity/status', (req: Request, res: Response) => {
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required.' });
    }

    const { celebrityId, status } = req.body;
    const celeb = celebritiesStore.find((c) => c.id === celebrityId);
    if (!celeb) {
      return res.status(404).json({ error: 'Celebrity not found.' });
    }

    celeb.status = status;
    const userRec = usersStore.find((u) => u.id === celeb.userId);
    if (userRec) userRec.status = status;

    addAuditLog(currentUser.id, currentUser.name, 'UPDATE_CELEB_STATUS', `Changed status of ${celeb.displayName} to ${status}`);

    res.json({ status: 'success', celebrity: celeb });
  });

  // 15. Export PHP Files endpoint
  app.get('/api/export-php', (req: Request, res: Response) => {
    const files = generatePHPCodebase();
    res.json({ status: 'success', files });
  });

  // 16. Notifications API - Mark Single Read
  app.post('/api/notifications/read', (req: Request, res: Response) => {
    const { notificationId } = req.body;
    const notif = notificationsStore.find((n) => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date().toISOString();
    }
    res.json({ status: 'success', notification: notif });
  });

  // 17. Notifications API - Mark All Read
  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    notificationsStore.forEach((n) => {
      if (n.recipientId === currentUser.id || currentUser.role === 'super_admin') {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      }
    });
    res.json({ status: 'success' });
  });

  // 18. Notifications API - Delete Single Notification
  app.post('/api/notifications/delete', (req: Request, res: Response) => {
    const { notificationId } = req.body;
    notificationsStore = notificationsStore.filter((n) => n.id !== notificationId);
    res.json({ status: 'success' });
  });

  // 19. Advanced Global Search API (Enforces Database / Role Level Security)
  app.post('/api/search', (req: Request, res: Response) => {
    const options = req.body || {};
    const searchResult = executeGlobalSearch(
      options,
      currentUser,
      usersStore,
      celebritiesStore,
      fansStore,
      conversationsStore,
      messagesStore
    );
    res.json({ status: 'success', ...searchResult });
  });

  // 20. Web Intelligence API - Research Query (Gemini + Google Search Grounding)
  app.post('/api/ai/research', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Research query is required.' });
      }
      const result = await WebResearchAgent.executeResearch(query);
      addAuditLog(currentUser.id, currentUser.name, 'WEB_INTELLIGENCE_RESEARCH', `Queried: "${query}"`);
      res.json({ status: 'success', result });
    } catch (err: any) {
      console.error('Web Intelligence Research Error:', err);
      res.status(500).json({ error: err.message || 'Web research service unavailable.' });
    }
  });

  // 21. Web Intelligence API - Fact Check Claim
  app.post('/api/ai/fact-check', async (req: Request, res: Response) => {
    try {
      const { claim } = req.body;
      if (!claim || typeof claim !== 'string') {
        return res.status(400).json({ error: 'Claim statement is required for fact checking.' });
      }
      const result = await FactCheckAgent.executeFactCheck(claim);
      addAuditLog(currentUser.id, currentUser.name, 'WEB_INTELLIGENCE_FACTCHECK', `Evaluated claim: "${claim}"`);
      res.json({ status: 'success', result });
    } catch (err: any) {
      console.error('Fact Check Agent Error:', err);
      res.status(500).json({ error: err.message || 'Fact check agent failed to process claim.' });
    }
  });

  // 22. Web Intelligence API - Breaking News Query
  app.post('/api/ai/news', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'News topic query is required.' });
      }
      const result = await NewsAgent.executeNewsQuery(query);
      addAuditLog(currentUser.id, currentUser.name, 'WEB_INTELLIGENCE_NEWS', `Searched news: "${query}"`);
      res.json({ status: 'success', result });
    } catch (err: any) {
      console.error('News Agent Error:', err);
      res.status(500).json({ error: err.message || 'News agent service failed.' });
    }
  });

  // 23. Enterprise Payments API - Get Transactions
  app.get('/api/payments/history', (req: Request, res: Response) => {
    const history = PaymentService.getPaymentsForUser(currentUser.id, currentUser.role, currentUser.celebrityId);
    res.json({ status: 'success', payments: history });
  });

  // 24. Enterprise Payments API - Create Checkout Session
  app.post('/api/payments/checkout-session', (req: Request, res: Response) => {
    const { celebrityId, amount, provider, membershipTier } = req.body;
    if (!celebrityId || !amount) {
      return res.status(400).json({ error: 'Celebrity ID and Amount are required.' });
    }

    const session = PaymentService.createCheckoutSession({
      userId: currentUser.id,
      celebrityId,
      amount: amount || 1000.0,
      provider: provider || 'stripe',
      membershipTier: membershipTier || '$1,000 Celebrity VIP Pass',
    });

    addAuditLog(currentUser.id, currentUser.name, 'CREATE_CHECKOUT_SESSION', `Initiated $${amount} payment session via ${provider}`);
    res.json({ status: 'success', session });
  });

  // 25. Enterprise Payments API - Webhook Listener
  app.post('/api/payments/webhook', (req: Request, res: Response) => {
    try {
      const { event, providerTransactionId, metadata } = req.body;
      const updatedRecord = PaymentService.processWebhook({ event, providerTransactionId, metadata });
      addAuditLog('system', 'Stripe Webhook', 'PAYMENT_WEBHOOK', `Processed webhook ${event} for ${providerTransactionId}`);
      res.json({ status: 'success', payment: updatedRecord });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 26. Verification & Passkeys API
  app.get('/api/verification/status', (req: Request, res: Response) => {
    const verification = VerificationService.getVerificationForUser(currentUser.id);
    const passkeys = VerificationService.getPasskeys(currentUser.id);
    const sessions = VerificationService.getDeviceSessions(currentUser.id);

    res.json({ status: 'success', verification, passkeys, sessions });
  });

  app.post('/api/verification/submit', (req: Request, res: Response) => {
    const { provider, documentType, country } = req.body;
    const record = VerificationService.submitVerification({
      userId: currentUser.id,
      provider: provider || 'jumio',
      documentType: documentType || 'passport',
      country: country || 'US',
    });

    addAuditLog(currentUser.id, currentUser.name, 'SUBMIT_VERIFICATION', `Submitted ${documentType} verification reference ${record.verificationReference}`);
    res.json({ status: 'success', verification: record });
  });

  app.post('/api/auth/passkey/register', (req: Request, res: Response) => {
    const { deviceName } = req.body;
    const passkey = VerificationService.registerPasskey(currentUser.id, deviceName || 'iPhone TouchID / FaceID');
    addAuditLog(currentUser.id, currentUser.name, 'REGISTER_PASSKEY', `Registered new WebAuthn passkey credential ${passkey.credentialId}`);
    res.json({ status: 'success', passkey });
  });

  app.post('/api/auth/sessions/revoke', (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const ok = VerificationService.revokeSession(sessionId);
    if (ok) {
      addAuditLog(currentUser.id, currentUser.name, 'REVOKE_SESSION', `Revoked device session ${sessionId}`);
      res.json({ status: 'success' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  // 27. WebRTC Call Signaling API
  app.get('/api/calls/history/:conversationId', (req: Request, res: Response) => {
    const history = TelephonyService.getCallHistory(req.params.conversationId);
    res.json({ status: 'success', calls: history });
  });

  app.post('/api/calls/initiate', (req: Request, res: Response) => {
    const { conversationId, tenantId, receiverId, receiverName, callType } = req.body;
    const callRecord = TelephonyService.initiateCall({
      conversationId,
      tenantId,
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      receiverId,
      receiverName,
      callType: callType || 'video',
    });

    addAuditLog(currentUser.id, currentUser.name, 'INITIATE_CALL', `Started ${callType} VIP call to ${receiverName}`);
    res.json({ status: 'success', call: callRecord });
  });

  app.post('/api/calls/signal', (req: Request, res: Response) => {
    const { callId, receiverId, type, payload } = req.body;
    TelephonyService.sendSignal({
      callId,
      senderId: currentUser.id,
      receiverId,
      type,
      payload,
      timestamp: Date.now(),
    });
    res.json({ status: 'success' });
  });

  app.get('/api/calls/signals', (req: Request, res: Response) => {
    const signals = TelephonyService.getSignalsForUser(currentUser.id);
    res.json({ status: 'success', signals });
  });

  app.post('/api/calls/end', (req: Request, res: Response) => {
    const { callId, durationSeconds } = req.body;
    const call = TelephonyService.endCall(callId, durationSeconds || 0);
    res.json({ status: 'success', call });
  });

  // 28. Observability & System Health Metrics API
  app.get('/api/admin/health-metrics', (req: Request, res: Response) => {
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin authorization required.' });
    }
    const metrics = ObservabilityService.getSystemHealth();
    res.json({ status: 'success', metrics });
  });

  // 29. Privacy Center & GDPR Data Export API
  app.get('/api/privacy/export', (req: Request, res: Response) => {
    const exportData = PrivacyService.generateUserDataExport(currentUser);
    addAuditLog(currentUser.id, currentUser.name, 'PRIVACY_DATA_EXPORT', `Downloaded full GDPR/CCPA personal data export archive`);
    res.json({ status: 'success', exportData });
  });

  app.get('/api/privacy/preferences', (req: Request, res: Response) => {
    const prefs = PrivacyService.getPreferences(currentUser.id);
    res.json({ status: 'success', preferences: prefs });
  });

  app.post('/api/privacy/preferences', (req: Request, res: Response) => {
    const updated = PrivacyService.updatePreferences(currentUser.id, req.body);
    addAuditLog(currentUser.id, currentUser.name, 'UPDATE_PRIVACY_PREFERENCES', 'Updated marketing and data sharing preferences');
    res.json({ status: 'success', preferences: updated });
  });

  // 30. Commercial Feature Flags API
  app.get('/api/feature-flags', (req: Request, res: Response) => {
    const flags = FeatureFlagsService.getFlags();
    res.json({ status: 'success', flags });
  });

  app.post('/api/feature-flags/toggle', (req: Request, res: Response) => {
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin authorization required.' });
    }
    const { flagKey, enabled } = req.body;
    const flag = FeatureFlagsService.toggleFlag(flagKey, enabled);
    addAuditLog(currentUser.id, currentUser.name, 'TOGGLE_FEATURE_FLAG', `Set feature flag ${flagKey} to ${enabled}`);
    res.json({ status: 'success', flag });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
