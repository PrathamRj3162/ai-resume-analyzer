import { create } from "zustand";

declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (
          path: string,
          data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<{ message: { content: string } }>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean
        ) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<KVItem[] | string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string,
      testMode?: boolean
    ) => Promise<string>;
  };
  kv: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    list: (pattern: string, returnValues?: boolean) => Promise<KVItem[] | string[]>;
    flush: () => Promise<boolean>;
  };
  init: () => void;
}

export const usePuterStore = create<PuterStore>((set, get) => ({
  isLoading: true,
  error: null,
  puterReady: false,

  auth: {
    user: null,
    isAuthenticated: false,

    signIn: async () => {
      try {
        await window.puter.auth.signIn();
        await get().auth.refreshUser();
      } catch (e) {
        console.error("Sign in error:", e);
      }
    },

    signOut: async () => {
      try {
        await window.puter.auth.signOut();
        set((state) => ({
          auth: { ...state.auth, user: null, isAuthenticated: false },
        }));
      } catch (e) {
        console.error("Sign out error:", e);
      }
    },

    refreshUser: async () => {
      try {
        const isSignedIn = await window.puter.auth.isSignedIn();
        if (isSignedIn) {
          const user = await window.puter.auth.getUser();
          set((state) => ({
            auth: { ...state.auth, user, isAuthenticated: true },
          }));
        } else {
          set((state) => ({
            auth: { ...state.auth, user: null, isAuthenticated: false },
          }));
        }
      } catch (e) {
        console.error("Refresh user error:", e);
      }
    },

    checkAuthStatus: async () => {
      try {
        const isSignedIn = await window.puter.auth.isSignedIn();
        if (isSignedIn) {
          const user = await window.puter.auth.getUser();
          set((state) => ({
            auth: { ...state.auth, user, isAuthenticated: true },
          }));
        }
        return isSignedIn;
      } catch (e) {
        return false;
      }
    },

    getUser: () => get().auth.user,
  },

  fs: {
    write: async (path, data) => {
      try {
        return await window.puter.fs.write(path, data);
      } catch (e) {
        console.error("FS write error:", e);
        return undefined;
      }
    },

    read: async (path) => {
      try {
        return await window.puter.fs.read(path);
      } catch (e) {
        console.error("FS read error:", e);
        return undefined;
      }
    },

    upload: async (files) => {
      try {
        return await window.puter.fs.upload(files);
      } catch (e) {
        console.error("FS upload error:", e);
        return undefined;
      }
    },

    delete: async (path) => {
      try {
        await window.puter.fs.delete(path);
      } catch (e) {
        console.error("FS delete error:", e);
      }
    },

    readDir: async (path) => {
      try {
        return await window.puter.fs.readdir(path);
      } catch (e) {
        console.error("FS readdir error:", e);
        return undefined;
      }
    },
  },

  ai: {
    chat: async (prompt, imageURL?, testMode?) => {
      try {
        const response = await window.puter.ai.chat(
          prompt,
          imageURL,
          testMode,
          { model: "gpt-4o" }
        );
        return response?.message?.content ?? "";
      } catch (e) {
        console.error("AI chat error:", e);
        return "";
      }
    },
  },

  kv: {
    get: async (key) => {
      try {
        return await window.puter.kv.get(key);
      } catch (e) {
        console.error("KV get error:", e);
        return null;
      }
    },

    set: async (key, value) => {
      try {
        return await window.puter.kv.set(key, value);
      } catch (e) {
        console.error("KV set error:", e);
        return false;
      }
    },

    delete: async (key) => {
      try {
        return await window.puter.kv.delete(key);
      } catch (e) {
        console.error("KV delete error:", e);
        return false;
      }
    },

    list: async (pattern, returnValues?) => {
      try {
        return await window.puter.kv.list(pattern, returnValues);
      } catch (e) {
        console.error("KV list error:", e);
        return [];
      }
    },

    flush: async () => {
      try {
        return await window.puter.kv.flush();
      } catch (e) {
        console.error("KV flush error:", e);
        return false;
      }
    },
  },

  init: () => {
    const waitForPuter = () => {
      if (typeof window !== "undefined" && window.puter) {
        set({ puterReady: true, isLoading: false });
        get().auth.checkAuthStatus();
      } else {
        setTimeout(waitForPuter, 100);
      }
    };
    waitForPuter();
  },
}));
