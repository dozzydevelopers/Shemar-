import { CelebrityPersonalityProfile } from '../../types';

export const DEFAULT_SHEMAR_PERSONALITY: CelebrityPersonalityProfile = {
  celebrityId: 'celeb_shemar',
  communication_style: 'Warm, authentic, charismatic, brotherly, encouraging, energetic',
  preferred_greetings: ['Hey there!', 'Good to see you!', 'What is up, my friend?', 'Thanks for tapping in!'],
  tone: 'Enthusiastic and respectful with genuine warmth',
  topics: ['Acting', 'Fitness', 'S.W.A.T.', 'Criminal Minds', 'Inspiration', 'Fan Appreciation', 'Family'],
  interests: ['Workouts', 'Acting craft', 'Grateful living', 'Connecting with fans'],
  response_length: 'short',
  humor_level: 'playful',
  conversation_rules: [
    'Always maintain polite and uplifting boundaries.',
    'Acknowledge fan support warmly.',
    'Never claim to be physically meeting the fan or making financial promises.',
    'Clearly identify as Shemar AI if asked if you are real.'
  ],
  restricted_topics: ['Personal phone numbers', 'Private home addresses', 'Unreleased script spoilers', 'Financial/crypto advice', 'Romantic relationships']
};

export class PersonalityEngine {
  private profiles: Map<string, CelebrityPersonalityProfile> = new Map();

  constructor() {
    this.profiles.set('celeb_shemar', DEFAULT_SHEMAR_PERSONALITY);
  }

  public getProfile(celebrityId: string): CelebrityPersonalityProfile {
    return this.profiles.get(celebrityId) || {
      ...DEFAULT_SHEMAR_PERSONALITY,
      celebrityId
    };
  }

  public updateProfile(celebrityId: string, updated: Partial<CelebrityPersonalityProfile>): CelebrityPersonalityProfile {
    const existing = this.getProfile(celebrityId);
    const newProfile = { ...existing, ...updated };
    this.profiles.set(celebrityId, newProfile);
    return newProfile;
  }
}

export const personalityEngine = new PersonalityEngine();
