import Airtable from 'airtable';

// Airtable configuration
const AIRTABLE_BASE_ID = 'appQJRoYrnrATQaBt';
const AIRTABLE_API_TOKEN = 'patT3M81Vvl2fcShb.094d8046c74421e0fcb5dedb23b98c49f79373c5f6635da93f0910a5e1263f98';

// Initialize Airtable
const base = new Airtable({
  apiKey: AIRTABLE_API_TOKEN
}).base(AIRTABLE_BASE_ID);

// Types
export interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  shouldPublish: boolean;
  image?: string;
  createdAt: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  type: string;
  image?: string;
  createdAt: string;
}

export interface Ranking {
  id: string;
  title: string;
  ratio: number;
  videoUrl: string;
  thumbnailUrl: string;
  shouldCreateContent: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  voiceForPosts: string;
  style: string;
  voiceForScripts: string;
  avatarRecipient: string;
}

// Airtable service functions
export const airtableService = {
  // Posts
  async getPosts(): Promise<Post[]> {
    try {
      console.log('Fetching posts from Airtable...');
      const records = await base('POSTY').select({
        maxRecords: 100
      }).all();

      console.log('Raw records:', records);

      return records.map(record => {
        const imageAttachments = record.get('Image') as any[];
        const imageUrl = imageAttachments && imageAttachments.length > 0 ? imageAttachments[0].url : '';
        
        console.log('Record image data:', { imageAttachments, imageUrl });
        
        return {
          id: record.id,
          title: record.get('Tytuł Posta') as string || '',
          content: record.get('Post') as string || '',
          platform: record.get('Platforma') as string || '',
          shouldPublish: record.get('Opublikuj') as boolean || false,
          image: imageUrl,
          createdAt: record.get('Created') as string || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async updatePost(id: string, data: Partial<Post>): Promise<boolean> {
    try {
      const updateData: any = {
        'Tytuł Posta': data.title,
        'Post': data.content,
        'Platforma': data.platform,
        'Opublikuj': data.shouldPublish
      };

      // Only include image if it's provided and convert to attachment format
      if (data.image && data.image.trim()) {
        updateData['Image'] = [{
          url: data.image
        }];
      }

      await base('POSTY').update(id, updateData);
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  },

  // Scripts
  async getScripts(): Promise<Script[]> {
    try {
      const records = await base('SKRYPTY').select({
        maxRecords: 100
      }).all();

      return records.map(record => {
        const imageAttachments = record.get('Image') as any[];
        const imageUrl = imageAttachments && imageAttachments.length > 0 ? imageAttachments[0].url : '';
        
        return {
          id: record.id,
          title: record.get('Tytuł') as string || '',
          content: record.get('Text') as string || '',
          type: record.get('Rodzaj skryptu') as string || '',
          image: imageUrl,
          createdAt: record.get('Created') as string || record.get('createdTime') as string || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error fetching scripts:', error);
      return [];
    }
  },

  async updateScript(id: string, data: Partial<Script>): Promise<boolean> {
    try {
      await base('SKRYPTY').update(id, {
        'Tytuł': data.title,
        'Text': data.content,
        'Rodzaj skryptu': data.type
      });
      return true;
    } catch (error) {
      console.error('Error updating script:', error);
      return false;
    }
  },

  // Rankings
  async getRankings(): Promise<Ranking[]> {
    try {
      const records = await base('RANKING').select({
        maxRecords: 100
      }).all();

      const getYouTubeId = (url: string): string => {
        if (!url) return '';
        const match = url.match(/(?:v=|\.be\/)\s*([\w-]{11})/);
        return match ? match[1] : '';
      };

      return records.map(record => {
        const videoUrl = (record.get('Video URL') as string) || '';
        const providedThumb = (record.get('Thumbnail URL') as string) || '';
        const videoId = getYouTubeId(videoUrl);
        const fallbackThumb = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

        return {
          id: record.id,
          title: (record.get('Title') as string) || '',
          ratio: (record.get('Ratio') as number) || 0,
          videoUrl,
          thumbnailUrl: providedThumb || fallbackThumb,
          shouldCreateContent: (record.get('Stwórz Kontent') as boolean) || false,
          createdAt: (record.get('Created') as string) || (record.get('createdTime') as string) || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error fetching rankings:', error);
      return [];
    }
  },

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const records = await base('Users').select({
        maxRecords: 100
      }).all();

      return records.map(record => ({
        id: record.id,
        username: record.get('Username') as string || '',
        voiceForPosts: record.get('Głos do postów') as string || '',
        style: record.get('Styl') as string || '',
        voiceForScripts: record.get('Głos do skryptów') as string || '',
        avatarRecipient: record.get('Avatar Odbiorcy') as string || ''
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUser(id: string, data: Partial<User>): Promise<boolean> {
    try {
      const updateData: any = {
        'Username': data.username,
        'Głos do postów': data.voiceForPosts,
        'Styl': data.style,
        'Głos do skryptów': data.voiceForScripts
      };
      
      console.log('Updating user with data:', updateData);
      
      // Only add Avatar Odbiorcy if it's provided and not empty
      if (data.avatarRecipient && data.avatarRecipient.trim()) {
        updateData['Avatar Odbiorcy'] = data.avatarRecipient;
        console.log('Adding Avatar Odbiorcy:', data.avatarRecipient);
      }
      
      await base('Users').update(id, updateData);
      console.log('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  async createUser(data: Partial<User>): Promise<string | null> {
    try {
      const createData: any = {
        'Username': data.username || 'Darek Szoen',
        'Głos do postów': data.voiceForPosts || '',
        'Styl': data.style || '',
        'Głos do skryptów': data.voiceForScripts || ''
      };
      
      console.log('Creating user with data:', createData);
      
      // Only add Avatar Odbiorcy if it's provided and not empty
      if (data.avatarRecipient && data.avatarRecipient.trim()) {
        createData['Avatar Odbiorcy'] = data.avatarRecipient;
        console.log('Adding Avatar Odbiorcy:', data.avatarRecipient);
      }
      
      const record = await base('Users').create(createData);
      const recordId = (record as any).id;
      console.log('User created successfully:', recordId);
      return recordId;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  deletePost: async (id: string): Promise<boolean> => {
    try {
      await base('POSTY').destroy(id);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  deleteScript: async (id: string): Promise<boolean> => {
    try {
      await base('SKRYPTY').destroy(id);
      return true;
    } catch (error) {
      console.error('Error deleting script:', error);
      return false;
    }
  },

  deleteRanking: async (id: string): Promise<boolean> => {
    try {
      await base('RANKING').destroy(id);
      return true;
    } catch (error) {
      console.error('Error deleting ranking:', error);
      return false;
    }
  }
};
