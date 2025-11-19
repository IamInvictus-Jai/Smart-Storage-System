// UI store using Zustand
import { create } from 'zustand';

export const useUIStore = create((set) => ({
    sidebarCollapsed: typeof window !== 'undefined' && window.innerWidth < 1024,
    uploadModalOpen: false,

    toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
    })),

    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    openUploadModal: () => set({ uploadModalOpen: true }),

    closeUploadModal: () => set({ uploadModalOpen: false }),
}));
