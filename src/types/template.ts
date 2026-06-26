/**
 * Core data model for EduChart AI.
 *
 * A Template is never a flat image — it's JSON describing a canvas and its
 * layers. That's what makes every chart re-editable, translatable, and
 * "AI fillable" later without touching the editor itself.
 */

export type LayerType = 'image-placeholder' | 'text' | 'shape';

interface LayerBase {
  id: string;
  type: LayerType;
  /** Position + size live in design-space units (0..canvasWidth / canvasHeight), not pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface ImagePlaceholderLayer extends LayerBase {
  type: 'image-placeholder';
  /** Drives the auto search query, e.g. "Cat" */
  keyword: string;
  /** Filled in once the teacher picks a result from the search panel */
  imageUri?: string;
  imageAttribution?: string;
  borderRadius?: number;
}

export interface TextLayer extends LayerBase {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold' | '600' | '700';
  color: string;
  align?: 'left' | 'center' | 'right';
}

export interface ShapeLayer extends LayerBase {
  type: 'shape';
  shape: 'rect' | 'circle' | 'star';
  fill: string;
  borderRadius?: number;
}

export type Layer = ImagePlaceholderLayer | TextLayer | ShapeLayer;

export interface Template {
  id: string;
  name: string;
  category: string;
  /** Used for the home-screen card swatch until real thumbnails exist */
  accentColor: string;
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  layers: Layer[];
}

export const isImagePlaceholder = (l: Layer): l is ImagePlaceholderLayer =>
  l.type === 'image-placeholder';

export const isTextLayer = (l: Layer): l is TextLayer => l.type === 'text';

export const isShapeLayer = (l: Layer): l is ShapeLayer => l.type === 'shape';
