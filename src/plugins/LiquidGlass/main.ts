import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserWindow } from 'electron';
import type { MainCtx, SlickMainPlugin } from '$slick';
import { id } from './meta.ts';
import type { GlassOptions, GlassShape, GlassState } from './types.ts';

type Native = {
  setShapes: (handle: Buffer, shapes: GlassShape[], options: GlassOptions) => void;
  prepareWindow: (handle: Buffer) => void;
};

const here = path.dirname(fileURLToPath(import.meta.url));

let native: Native | null | undefined;
function loadNative(): Native | null {
  if (native !== undefined) return native;
  native = null;
  if (process.platform !== 'darwin') return native;
  const file = `glass-${process.arch === 'arm64' ? 'arm64' : 'x86_64'}.node`;
  // dev runs from the bundle next to this file, a checkout runs from the source folder
  const dirs = [here, path.join(here, '..', '..', 'src', 'plugins', 'LiquidGlass', 'native')];
  for (const dir of dirs) {
    try {
      const mod = { exports: {} as unknown };
      process.dlopen(mod, path.join(dir, file));
      native = mod.exports as Native;
      return native;
    } catch {
      // try the next place
    }
  }
  console.warn(`[slick] ${id}: ${file} not found, build it with native/build.sh`);
  return native;
}

/** set when a window was created see-through, the only time that can happen */
let transparentWindows = false;
const prepared = new WeakSet<BrowserWindow>();

/** Chromium paints its own backdrop under the page and puts it back on navigation, so the override is reapplied */
function keepPageTransparent(win: BrowserWindow) {
  const { webContents } = win;
  const apply = () => {
    if (webContents.isDestroyed()) return;
    try {
      if (!webContents.debugger.isAttached()) webContents.debugger.attach('1.3');
      webContents.debugger
        .sendCommand('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
        .catch(() => {});
    } catch (error) {
      console.warn(`[slick] ${id}: transparency failed:`, (error as Error).message);
    }
  };
  apply();
  for (const event of ['did-finish-load', 'did-navigate', 'did-navigate-in-page', 'dom-ready'] as const) {
    webContents.on(event as 'did-finish-load', apply);
  }
  win.on('focus', apply);
  win.on('resize', apply);
}

function slackWindow(sender: Electron.WebContents): BrowserWindow | null {
  const win = BrowserWindow.fromWebContents(sender);
  return win && !win.isDestroyed() ? win : null;
}

export default {
  id,
  capabilities: [],
  windowOptions() {
    if (process.platform !== 'darwin' || loadNative() === null) return;
    transparentWindows = true;
    return { transparent: true, backgroundColor: '#00000000' };
  },
  window(_ctx: MainCtx, win: BrowserWindow) {
    if (!transparentWindows) return;
    // Slack paints its own window color, which would hide the glass under the page
    win.setBackgroundColor = () => {};
    win.setBackgroundColor('#00000000');
    keepPageTransparent(win);
  },
  rpc: {
    state(): GlassState {
      return { supported: loadNative() !== null, ready: transparentWindows };
    },
    set(_ctx: MainCtx, args: unknown[], sender: Electron.WebContents) {
      const [shapes, options] = args as [GlassShape[] | null, GlassOptions | undefined];
      const lib = loadNative();
      const win = slackWindow(sender);
      if (!lib || !win || !transparentWindows) return;
      try {
        const handle = win.getNativeWindowHandle();
        if (!prepared.has(win)) {
          prepared.add(win);
          lib.prepareWindow(handle);
          win.once('closed', () => prepared.delete(win));
        }
        lib.setShapes(handle, shapes ?? [], options ?? {});
      } catch (error) {
        console.warn(`[slick] ${id}: glass failed:`, (error as Error).message);
      }
    },
    chrome(_ctx: MainCtx, args: unknown[], sender: Electron.WebContents) {
      const hide = args[0] === true;
      const win = slackWindow(sender);
      if (win && process.platform === 'darwin') win.setWindowButtonVisibility(!hide);
    },
  },
} satisfies SlickMainPlugin;
