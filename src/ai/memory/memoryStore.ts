import { AIMemoryRecord } from '../../types';

export class MemoryStore {
  private memories: Map<string, AIMemoryRecord[]> = new Map();

  /**
   * Key pattern: `${fanId}_${celebrityId}`
   */
  private getStorageKey(fanId: string, celebrityId: string): string {
    return `${fanId}_${celebrityId}`;
  }

  public getMemories(fanId: string, celebrityId: string): AIMemoryRecord[] {
    const key = this.getStorageKey(fanId, celebrityId);
    return this.memories.get(key) || [
      {
        id: `mem_1`,
        fanId,
        celebrityId,
        key: 'preferred_name',
        value: 'VIP Fan',
        category: 'name',
        updatedAt: new Date().toISOString()
      },
      {
        id: `mem_2`,
        fanId,
        celebrityId,
        key: 'favorite_topic',
        value: 'S.W.A.T. and acting career',
        category: 'topic',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  public saveMemory(fanId: string, celebrityId: string, keyName: string, value: string, category: 'preference' | 'topic' | 'name' | 'general' = 'general'): void {
    const storageKey = this.getStorageKey(fanId, celebrityId);
    const existing = this.getMemories(fanId, celebrityId);
    
    const filtered = existing.filter((m) => m.key !== keyName);
    filtered.push({
      id: `mem_${Date.now()}`,
      fanId,
      celebrityId,
      key: keyName,
      value,
      category,
      updatedAt: new Date().toISOString()
    });

    this.memories.set(storageKey, filtered);
  }

  public clearMemory(fanId: string, celebrityId: string): void {
    const storageKey = this.getStorageKey(fanId, celebrityId);
    this.memories.delete(storageKey);
  }
}

export const memoryStore = new MemoryStore();
