import { User, SearchCategoryFilter, SearchQueryOptions } from '../types';

export interface RoleSearchPermissions {
  canSearchAllMessages: boolean;
  canSearchAllUsers: boolean;
  canSearchAllCelebrities: boolean;
  allowedCelebrityIds?: string[];
  allowedConversationIds?: string[];
  allowedFanIds?: string[];
}

export function evaluateSearchPermissions(
  currentUser: User,
  userCelebrityId?: string,
  userFanId?: string
): RoleSearchPermissions {
  if (currentUser.role === 'super_admin') {
    return {
      canSearchAllMessages: true,
      canSearchAllUsers: true,
      canSearchAllCelebrities: true,
    };
  }

  if (currentUser.role === 'celebrity') {
    return {
      canSearchAllMessages: false,
      canSearchAllUsers: false,
      canSearchAllCelebrities: true, // Celebrities can view public celeb profiles
      allowedCelebrityIds: userCelebrityId ? [userCelebrityId] : [],
    };
  }

  // Fan role
  return {
    canSearchAllMessages: false,
    canSearchAllUsers: false,
    canSearchAllCelebrities: true, // Fans can search public celebrity profiles
    allowedFanIds: userFanId ? [userFanId] : [],
  };
}

export function matchesCategoryFilter(itemType: string, category?: SearchCategoryFilter): boolean {
  if (!category || category === 'all') return true;
  if (category === 'messages' && itemType === 'message') return true;
  if (category === 'people' && (itemType === 'person' || itemType === 'celebrity')) return true;
  if (category === 'celebrities' && itemType === 'celebrity') return true;
  if (category === 'conversations' && itemType === 'conversation') return true;
  return false;
}
