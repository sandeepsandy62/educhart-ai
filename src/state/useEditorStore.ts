import { create } from 'zustand';
import { Layer, Template } from '../types/template';

export type EditorMode = 'edit' | 'preview';

interface EditorState {
  template: Template | null;
  layers: Layer[];
  mode: EditorMode;
  /** layer id currently driving the open search panel, or null when closed */
  activeSearchLayerId: string | null;

  loadTemplate: (template: Template) => void;
  setMode: (mode: EditorMode) => void;
  updateLayerPosition: (id: string, x: number, y: number) => void;
  openSearchFor: (layerId: string) => void;
  closeSearch: () => void;
  setLayerImage: (layerId: string, imageUri: string, attribution: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  template: null,
  layers: [],
  mode: 'edit',
  activeSearchLayerId: null,

  loadTemplate: (template) =>
    set({ template, layers: template.layers, mode: 'edit', activeSearchLayerId: null }),

  setMode: (mode) => set({ mode, activeSearchLayerId: null }),

  updateLayerPosition: (id, x, y) =>
    set({
      layers: get().layers.map((l) => (l.id === id ? { ...l, x, y } : l)),
    }),

  openSearchFor: (layerId) => set({ activeSearchLayerId: layerId }),
  closeSearch: () => set({ activeSearchLayerId: null }),

  setLayerImage: (layerId, imageUri, attribution) =>
    set({
      layers: get().layers.map((l) =>
        l.id === layerId && l.type === 'image-placeholder'
          ? { ...l, imageUri, imageAttribution: attribution }
          : l
      ),
      activeSearchLayerId: null,
    }),
}));
