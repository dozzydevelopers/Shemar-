import {
  User,
  Celebrity,
  Fan,
  Conversation,
  Message,
  SearchQueryOptions,
  SearchResultItem,
  SearchResponse,
} from '../types';
import { evaluateSearchPermissions, matchesCategoryFilter } from './searchFilters';

export function executeGlobalSearch(
  options: SearchQueryOptions,
  currentUser: User,
  allUsers: User[],
  allCelebrities: Celebrity[],
  allFans: Fan[],
  allConversations: Conversation[],
  allMessages: Message[]
): SearchResponse {
  const query = (options.query || '').trim().toLowerCase();
  const page = options.page || 1;
  const limit = options.limit || 15;

  // 1. Determine User Fan Record / Celebrity ID
  const fanRecord = allFans.find((f) => f.userId === currentUser.id);
  const celebId = currentUser.celebrityId;
  const permissions = evaluateSearchPermissions(currentUser, celebId, fanRecord?.id);

  // 2. Identify allowed conversation IDs for strict role scoping
  let scopedConversations: Conversation[] = [];
  if (currentUser.role === 'super_admin') {
    scopedConversations = allConversations;
  } else if (currentUser.role === 'celebrity') {
    scopedConversations = allConversations.filter((c) => c.celebrityId === celebId);
  } else if (currentUser.role === 'fan') {
    scopedConversations = fanRecord ? allConversations.filter((c) => c.fanId === fanRecord.id) : [];
  }

  const allowedConvIdSet = new Set(scopedConversations.map((c) => c.id));

  const results: SearchResultItem[] = [];
  const suggestionsSet = new Set<string>();

  // A. Search Messages
  if (matchesCategoryFilter('message', options.category)) {
    for (const msg of allMessages) {
      if (!allowedConvIdSet.has(msg.conversationId)) continue; // Enforce RLS

      // Advanced filters
      if (options.conversationId && msg.conversationId !== options.conversationId) continue;
      if (options.senderId && msg.senderId !== options.senderId) continue;
      if (options.hasAttachments && !msg.attachment) continue;
      if (options.unreadOnly && msg.isRead) continue;

      if (options.startDate) {
        if (new Date(msg.createdAt) < new Date(options.startDate)) continue;
      }
      if (options.endDate) {
        if (new Date(msg.createdAt) > new Date(options.endDate)) continue;
      }

      const textMatch = msg.text.toLowerCase().includes(query);
      const senderMatch = msg.senderName.toLowerCase().includes(query);
      const attachMatch = msg.attachment?.name.toLowerCase().includes(query);

      if (!query || textMatch || senderMatch || attachMatch) {
        results.push({
          id: msg.id,
          type: 'message',
          title: msg.senderName,
          subtitle: `In chat #${msg.conversationId.slice(-4)}`,
          snippet: msg.text,
          badge: msg.attachment ? `📎 ${msg.attachment.name}` : undefined,
          timestamp: msg.createdAt,
          conversationId: msg.conversationId,
          metadata: { senderRole: msg.senderRole, isRead: msg.isRead },
        });

        if (textMatch && query) suggestionsSet.add(msg.text.slice(0, 30));
      }
    }
  }

  // B. Search Celebrities
  if (matchesCategoryFilter('celebrity', options.category)) {
    for (const celeb of allCelebrities) {
      const nameMatch = celeb.displayName.toLowerCase().includes(query);
      const unameMatch = celeb.username.toLowerCase().includes(query);
      const bioMatch = celeb.bio.toLowerCase().includes(query);

      if (!query || nameMatch || unameMatch || bioMatch) {
        results.push({
          id: celeb.id,
          type: 'celebrity',
          title: celeb.displayName,
          subtitle: `@${celeb.username} • Verified Celebrity`,
          snippet: celeb.bio,
          avatar: celeb.avatar,
          badge: 'Verified VIP',
          metadata: { fanCount: celeb.fanCount, isVerified: celeb.isVerified },
        });

        if (nameMatch && query) suggestionsSet.add(celeb.displayName);
      }
    }
  }

  // C. Search People / Fans according to role permissions
  if (matchesCategoryFilter('person', options.category)) {
    let allowedFans: Fan[] = [];
    if (currentUser.role === 'super_admin') {
      allowedFans = allFans;
    } else if (currentUser.role === 'celebrity') {
      // Celebrity can search only their assigned fans
      allowedFans = allFans.filter((f) => f.assignedCelebrityId === celebId);
    } // Fans cannot search other fans

    for (const fan of allowedFans) {
      const nameMatch = fan.name.toLowerCase().includes(query);
      const emailMatch = fan.email.toLowerCase().includes(query);

      if (!query || nameMatch || emailMatch) {
        results.push({
          id: fan.id,
          type: 'person',
          title: fan.name,
          subtitle: fan.email,
          avatar: fan.avatar,
          badge: 'Fan Supporter',
          metadata: { assignedCelebrityId: fan.assignedCelebrityId },
        });

        if (nameMatch && query) suggestionsSet.add(fan.name);
      }
    }
  }

  // D. Search Conversations
  if (matchesCategoryFilter('conversation', options.category)) {
    for (const conv of scopedConversations) {
      if (options.unreadOnly) {
        const unreadCount = currentUser.role === 'fan' ? conv.unreadCountFan : conv.unreadCountCelebrity;
        if (unreadCount === 0) continue;
      }

      if (options.celebrityId && conv.celebrityId !== options.celebrityId) continue;

      const fanMatch = conv.fanName.toLowerCase().includes(query);
      const msgMatch = conv.lastMessageText.toLowerCase().includes(query);

      if (!query || fanMatch || msgMatch) {
        results.push({
          id: conv.id,
          type: 'conversation',
          title: conv.fanName,
          subtitle: conv.fanEmail,
          snippet: conv.lastMessageText,
          avatar: conv.fanAvatar,
          timestamp: conv.lastMessageTime,
          conversationId: conv.id,
          metadata: {
            unreadFan: conv.unreadCountFan,
            unreadCeleb: conv.unreadCountCelebrity,
          },
        });

        if (fanMatch && query) suggestionsSet.add(conv.fanName);
      }
    }
  }

  // Paginate results
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    query: options.query,
    totalResults,
    page,
    totalPages,
    results: paginatedResults,
    suggestions: Array.from(suggestionsSet).slice(0, 6),
  };
}
