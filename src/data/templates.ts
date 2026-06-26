import { Layer, Template } from '../types/template';

const CANVAS_W = 1000;
const CANVAS_H = 1400;

/**
 * Lays out N items as an image-placeholder + label pair in a grid.
 * Keeps every template's math identical so spacing stays consistent
 * across the whole catalog instead of hand-tuned per template.
 */
function gridOf(
  prefix: string,
  items: string[],
  opts: { cols: number; top: number; gap?: number; cellHeight?: number }
): Layer[] {
  const { cols, top, gap = 28, cellHeight = 280 } = opts;
  const sidePadding = 60;
  const usableWidth = CANVAS_W - sidePadding * 2;
  const cellWidth = (usableWidth - gap * (cols - 1)) / cols;
  const imageHeight = cellHeight - 70;

  const layers: Layer[] = [];
  items.forEach((keyword, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = sidePadding + col * (cellWidth + gap);
    const y = top + row * (cellHeight + gap);

    layers.push({
      id: `${prefix}-img-${i}`,
      type: 'image-placeholder',
      keyword,
      x,
      y,
      width: cellWidth,
      height: imageHeight,
      borderRadius: 20,
    });
    layers.push({
      id: `${prefix}-label-${i}`,
      type: 'text',
      text: keyword,
      x,
      y: y + imageHeight + 8,
      width: cellWidth,
      height: 36,
      fontSize: 26,
      fontWeight: '700',
      color: '#1C1C1E',
      align: 'center',
    });
  });
  return layers;
}

function titleLayer(id: string, text: string, color = '#1C1C1E'): Layer {
  return {
    id,
    type: 'text',
    text,
    x: 60,
    y: 50,
    width: CANVAS_W - 120,
    height: 80,
    fontSize: 64,
    fontWeight: '700',
    color,
    align: 'center',
  };
}

const alphabet: Template = {
  id: 'alphabet-af',
  name: 'Alphabet Flashcards',
  category: 'Alphabet',
  accentColor: '#FF9F0A',
  canvasWidth: CANVAS_W,
  canvasHeight: CANVAS_H,
  background: '#FFF8EE',
  layers: [
    titleLayer('alphabet-title', 'A is for...'),
    ...gridOf(
      'alphabet',
      ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish'],
      { cols: 2, top: 170 }
    ),
  ],
};

const animals: Template = {
  id: 'animal-kingdom',
  name: 'Animal Kingdom',
  category: 'Animals',
  accentColor: '#34C759',
  canvasWidth: CANVAS_W,
  canvasHeight: CANVAS_H,
  background: '#F1FAF1',
  layers: [
    titleLayer('animals-title', 'Animal Kingdom'),
    ...gridOf(
      'animals',
      ['Lion', 'Elephant', 'Tiger', 'Rabbit', 'Giraffe', 'Panda'],
      { cols: 2, top: 170 }
    ),
  ],
};

const fruits: Template = {
  id: 'fruity-fun',
  name: 'Fruity Fun',
  category: 'Fruits & Vegetables',
  accentColor: '#FF3B30',
  canvasWidth: CANVAS_W,
  canvasHeight: CANVAS_H,
  background: '#FFF1F0',
  layers: [
    titleLayer('fruits-title', 'Fruity Fun'),
    ...gridOf(
      'fruits',
      ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Watermelon'],
      { cols: 2, top: 170 }
    ),
  ],
};

const solarSystem: Template = {
  id: 'solar-system',
  name: 'Solar System Explorer',
  category: 'Science',
  accentColor: '#5E5CE6',
  canvasWidth: CANVAS_W,
  canvasHeight: CANVAS_H,
  background: '#0B1026',
  layers: [
    titleLayer('solar-title', 'Our Solar System', '#FFFFFF'),
    ...gridOf(
      'solar',
      ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter'],
      { cols: 2, top: 170 }
    ).map((l) =>
      l.type === 'text' ? { ...l, color: '#FFFFFF' } : l
    ),
  ],
};

const welcomeBanner: Template = {
  id: 'classroom-welcome',
  name: 'Classroom Welcome Banner',
  category: 'Classroom Decor',
  accentColor: '#FFD60A',
  canvasWidth: CANVAS_W,
  canvasHeight: 600,
  background: '#FFFDF5',
  layers: [
    {
      id: 'welcome-bg-bar',
      type: 'shape',
      shape: 'rect',
      fill: '#FFD60A',
      x: 0,
      y: 0,
      width: CANVAS_W,
      height: 140,
      borderRadius: 0,
    },
    {
      id: 'welcome-star-1',
      type: 'shape',
      shape: 'star',
      fill: '#FF9F0A',
      x: 60,
      y: 30,
      width: 80,
      height: 80,
    },
    {
      id: 'welcome-star-2',
      type: 'shape',
      shape: 'star',
      fill: '#FF9F0A',
      x: CANVAS_W - 140,
      y: 30,
      width: 80,
      height: 80,
    },
    {
      id: 'welcome-title',
      type: 'text',
      text: 'Welcome to Class!',
      x: 60,
      y: 40,
      width: CANVAS_W - 120,
      height: 70,
      fontSize: 56,
      fontWeight: '700',
      color: '#1C1C1E',
      align: 'center',
    },
    {
      id: 'welcome-img',
      type: 'image-placeholder',
      keyword: 'Classroom',
      x: 250,
      y: 200,
      width: 500,
      height: 340,
      borderRadius: 24,
    },
  ],
};

export const templates: Template[] = [
  alphabet,
  animals,
  fruits,
  solarSystem,
  welcomeBanner,
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
