# EduChart AI

An AI-assisted educational chart designer for teachers. This is the **MVP slice**:
no cloud, no database, no authentication. Everything runs on-device.

## What's in this MVP

- **Home screen** — a grid of choosable templates (Alphabet, Animals, Fruits,
  Solar System, a classroom welcome banner).
- **Editor** — tap a template to open it. Image placeholders show a dashed
  outline with their keyword (e.g. "Cat"). Tap one to open the search panel;
  drag any layer to reposition it.
- **Image search side panel** — slides in from the right, pre-searches the
  tapped placeholder's keyword, and infinite-scrolls more results as you
  reach the bottom. Tap a result to drop it straight into that placeholder.
- **Edit / Preview toggle** — Edit mode shows drag handles and placeholder
  outlines; Preview mode hides editing affordances so you can see what the
  chart will actually look like.

Not in this slice yet (intentionally, to keep the MVP small): printing/export,
AI auto-fill, accounts, cloud sync, the template marketplace. See the project
notes for the full long-term vision — this build is step one.

## Architecture notes

- **Templates are JSON, not flat images.** See `src/types/template.ts` and
  `src/data/templates.ts`. A template is a canvas size + a list of layers
  (image placeholder / text / shape). This is what makes auto-fill,
  translation, and theme changes possible later without touching the editor.
- **Image search is provider-agnostic.** `src/services/imageProviders.ts`
  exposes one function, `searchImages(query, page)`. It tries Pixabay first,
  falls back to Unsplash. Swapping in a third provider (or AI-generated art
  later) means editing this one file only — the editor and search panel never
  call Pixabay/Unsplash directly.

## Running it

You'll need Node 18+ and the Expo Go app on your phone (or a simulator).

```bash
cd educhart-ai
npm install
cp .env.example .env
# edit .env and add a free Pixabay key (or Unsplash) — see below
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to run it on
your phone. Press `w` in the terminal to try it in a browser instead.

### Getting an image search API key (free, no billing)

Pick one:

- **Pixabay** (recommended, no attribution required): sign up at
  https://pixabay.com/api/docs/ and copy your key into
  `EXPO_PUBLIC_PIXABAY_KEY` in `.env`.
- **Unsplash**: create an app at https://unsplash.com/developers and copy the
  **Access Key** into `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY` in `.env`.

Without either key, the search panel will tell you it's not configured
instead of crashing.

## Project structure

```
src/
  types/template.ts        Template, Layer, ImagePlaceholderLayer, etc.
  data/templates.ts        Seed templates (5 to start)
  state/useEditorStore.ts  Zustand store: active template, layers, mode
  services/imageProviders.ts  Pixabay/Unsplash abstraction
  components/
    EditorCanvas.tsx       Scales the design canvas to the screen
    LayerView.tsx          Draggable layer (image/text/shape) + tap-to-search
    ImageSearchPanel.tsx   Infinite-scroll side panel
    TemplateCard.tsx       Home grid card
    ModeToggle.tsx          Edit/Preview segmented control
  screens/
    HomeScreen.tsx
    EditorScreen.tsx
  navigation/RootNavigator.tsx
```

## Roadmap (next slices)

1. Print/export (Expo Print + react-native-view-shot, still no backend needed)
2. "Fill entire chart" — search + place every placeholder in one tap
3. Save/load projects locally (AsyncStorage, still no cloud)
4. Template marketplace, accounts, and cloud sync once the editor is solid
