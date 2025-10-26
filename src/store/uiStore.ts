import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UIPreferences {
  // Editor preferences
  showPreview: boolean;
  previewPosition: 'side' | 'below';

  // Dashboard preferences
  dashboardView: 'grid' | 'list';
  postsPerPage: number;

  // Blog preferences
  blogLayout: 'grid' | 'list';

  // Actions
  setShowPreview: (show: boolean) => void;
  setPreviewPosition: (position: 'side' | 'below') => void;
  setDashboardView: (view: 'grid' | 'list') => void;
  setPostsPerPage: (perPage: number) => void;
  setBlogLayout: (layout: 'grid' | 'list') => void;
  resetPreferences: () => void;
}

const defaultPreferences = {
  showPreview: true,
  previewPosition: 'side' as const,
  dashboardView: 'grid' as const,
  postsPerPage: 10,
  blogLayout: 'grid' as const,
};

// createJSONStorage expects a function that returns a storage object.
// During SSR there is no localStorage; to keep the typings happy we return
// a fallback (globalThis.localStorage) which will only be used in the browser at runtime.
const storageGetter = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win: any = typeof window !== 'undefined' ? window : globalThis as any;
  return win?.localStorage;
};

export const useUIStore = create<UIPreferences>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setShowPreview: (show: boolean) => set({ showPreview: show }),
      setPreviewPosition: (position: 'side' | 'below') => set({ previewPosition: position }),
      setDashboardView: (view: 'grid' | 'list') => set({ dashboardView: view }),
      setPostsPerPage: (perPage: number) => set({ postsPerPage: perPage }),
      setBlogLayout: (layout: 'grid' | 'list') => set({ blogLayout: layout }),
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'blog-ui-preferences',
      storage: createJSONStorage(storageGetter),
      version: 1,
    }
  )
);

export default useUIStore;
