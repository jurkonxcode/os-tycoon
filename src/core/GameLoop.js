/**
 * Fixed-timestep simulation loop driven by requestAnimationFrame.
 * The real elapsed time is accumulated; whenever it crosses the
 * current speed's msPerDay threshold, exactly one simulation day is
 * dispatched through TimeSystem. Prevents the "double income" bug
 * that plagues naive tycoon loops.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";

export class GameLoop {
  /**
   * @param {EventBus} eventBus
   * @param {TimeSystem} timeSystem
   */
  constructor(eventBus, timeSystem) {
    if (!eventBus || !timeSystem) {
      throw new Error("GameLoop requires (eventBus, timeSystem).");
    }
    this._bus = eventBus;
    this._time = timeSystem;
    this._rafId = null;
    this._lastTs = 0;
    this._accumulator = 0;
    this._running = false;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTs = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _tick(now) {
    if (!this._running) return;
    const delta = now - this._lastTs;
    this._lastTs = now;

    const speedKey = this._time.getSpeed();
    const speed = GAME_CONFIG.SPEEDS[speedKey];

    if (speed && Number.isFinite(speed.msPerDay) && delta > 0) {
      // Cap to prevent runaway loops after tab regains focus.
      this._accumulator = Math.min(
        this._accumulator + delta,
        speed.msPerDay * GAME_CONFIG.MAX_DAYS_PER_FRAME
      );

      let daysThisFrame = 0;
      while (
        this._accumulator >= speed.msPerDay &&
        daysThisFrame < GAME_CONFIG.MAX_DAYS_PER_FRAME
      ) {
        this._accumulator -= speed.msPerDay;
        this._time.advanceOneDay(); // emits time:dayPassed
        daysThisFrame += 1;
      }
    } else {
      // Paused — drain accumulator so we don't burst on resume.
      this._accumulator = 0;
    }

    this._rafId = requestAnimationFrame(this._tick);
  }

  resetAccumulator() {
    this._accumulator = 0;
    this._lastTs = performance.now();
  }
}
