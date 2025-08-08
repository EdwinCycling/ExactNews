import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ActionCodeSettings } from "firebase/auth";
import { ChatMemory, ChatMessage, Category, RoleTemplate } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyAzi8MA2YsyFKa02a9XbEIA57ofn4WruSM",
  authDomain: "newsai-525b1.firebaseapp.com",
  projectId: "newsai-525b1",
  storageBucket: "newsai-525b1.firebasestorage.app",
  messagingSenderId: "849299991869",
  appId: "1:849299991869:web:0377dfa01d36e498e0a954",
  measurementId: "G-2HRJRH4SGK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Utility function to get action code settings for email actions
export const getActionCodeSettings = (): ActionCodeSettings => {
  // Get the current URL to determine if we're in development or production
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isDevelopment ? 'http://localhost:5173' : window.location.origin;
  
  return {
    url: baseUrl,
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.exact.newsdigest'
    },
    android: {
      packageName: 'com.exact.newsdigest',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: undefined
  };
};

// Memory functions
export const saveChatMemory = async (
  userId: string,
  extensiveSummary: string,
  category: Category,
  role?: RoleTemplate
): Promise<void> => {
  try {
    console.log('Saving chat memory for user:', userId);
    console.log('Category key:', category.key);
    console.log('Summary length:', extensiveSummary.length);
    console.log('Role key:', role?.key);
    
    const memoryId = `memory_${userId}`;
    
    // Create memory data object with only essential data
    const memoryData: any = {
      id: memoryId,
      userId,
      extensiveSummary,
      categoryKey: category.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Only add role key if it's defined
    if (role) {
      memoryData.roleKey = role.key;
    }

    // Use setDoc with merge option to create the collection if it doesn't exist
    await setDoc(doc(db, "chatMemories", memoryId), memoryData, { merge: true });
    console.log('Chat memory saved successfully to collection: chatMemories');
  } catch (error) {
    console.error('Error saving chat memory:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      userId,
      memoryId: `memory_${userId}`
    });
    throw error;
  }
};

export const loadChatMemory = async (userId: string): Promise<ChatMemory | null> => {
  try {
    console.log('=== LoadChatMemory Debug ===');
    console.log('Loading chat memory for user:', userId);
    const memoryId = `memory_${userId}`;
    console.log('Memory ID:', memoryId);
    console.log('Collection path: chatMemories/' + memoryId);
    
    const memoryDoc = await getDoc(doc(db, "chatMemories", memoryId));
    console.log('Document exists:', memoryDoc.exists());
    console.log('Document data:', memoryDoc.data());
    
    if (memoryDoc.exists()) {
      const memoryData = memoryDoc.data();
      
      // Handle both old and new data structures for backward compatibility
      let chatMemory: ChatMemory;
      
      if (memoryData.categoryKey) {
        // New structure with keys only
        chatMemory = {
          id: memoryData.id,
          userId: memoryData.userId,
          extensiveSummary: memoryData.extensiveSummary,
          categoryKey: memoryData.categoryKey,
          roleKey: memoryData.roleKey,
          createdAt: memoryData.createdAt,
          updatedAt: memoryData.updatedAt
        };
      } else if (memoryData.category) {
        // Old structure with full objects - convert to new structure
        chatMemory = {
          id: memoryData.id,
          userId: memoryData.userId,
          extensiveSummary: memoryData.extensiveSummary,
          categoryKey: memoryData.category.key,
          roleKey: memoryData.role?.key,
          createdAt: memoryData.createdAt,
          updatedAt: memoryData.updatedAt
        };
      } else {
        console.error('Invalid memory data structure:', memoryData);
        return null;
      }
      
      console.log('Memory found for user:', userId);
      console.log('Memory data (converted):', chatMemory);
      console.log('=== End LoadChatMemory ===');
      return chatMemory;
    }
    console.log('No memory found for user:', userId);
    console.log('=== End LoadChatMemory ===');
    return null;
  } catch (error) {
    console.error('Error loading chat memory:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      userId,
      memoryId: `memory_${userId}`
    });
    throw error;
  }
};

export const updateChatMemory = async (
  userId: string,
  extensiveSummary: string
): Promise<void> => {
  try {
    const memoryId = `memory_${userId}`;
    await updateDoc(doc(db, "chatMemories", memoryId), {
      extensiveSummary,
      updatedAt: new Date().toISOString()
    });
    console.log('Chat memory updated successfully');
  } catch (error) {
    console.error('Error updating chat memory:', error);
    throw error;
  }
};

export const deleteChatMemory = async (userId: string): Promise<void> => {
  try {
    const memoryId = `memory_${userId}`;
    await deleteDoc(doc(db, "chatMemories", memoryId));
    console.log('Chat memory deleted successfully');
  } catch (error) {
    console.error('Error deleting chat memory:', error);
    throw error;
  }
};

// Utility function to analyze database content
export const analyzeChatMemoryDatabase = async (): Promise<void> => {
  try {
    console.log('=== Database Analysis ===');
    console.log('Analyzing chatMemories collection...');
    
    // This would require a collection query, but for now we'll just log the structure
    console.log('Current ChatMemory structure:');
    console.log('- id: string (document ID)');
    console.log('- userId: string (user identifier)');
    console.log('- extensiveSummary: string (detailed summary for AI)');
    console.log('- categoryKey: string (category identifier only)');
    console.log('- roleKey?: string (optional role identifier only)');
    console.log('- createdAt: string (ISO timestamp)');
    console.log('- updatedAt: string (ISO timestamp)');
    console.log('');
    console.log('Optimizations made:');
    console.log('- Removed full Category object (was storing multilingual titles, descriptions, etc.)');
    console.log('- Removed full RoleTemplate object (was storing multilingual titles and text)');
    console.log('- Now only storing essential keys instead of full objects');
    console.log('- This significantly reduces database storage and improves performance');
    console.log('=== End Database Analysis ===');
  } catch (error) {
    console.error('Error analyzing database:', error);
  }
};
