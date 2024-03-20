import {FrameInfo} from 'react-native-reanimated';
import {get_verticies} from './utils';

export const side = 32;
// Position for each point of rect
export const vertices = get_verticies(side);
// y offsets in image determines which fox state we will show
export const y_ready = 0 as const;
export const y_idle = 1 as const;
export const y_walk = 2 as const;
export const y_jump = 3 as const;
export const y_hit = 4 as const;
export const y_sleep = 5 as const;
export const y_die = 6 as const;
export type YState = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// max x frames for y offset
export const x_frames = [4, 13, 7, 10, 4, 5, 6] as const;

export type JumpNone = 0;
export const jump_none: JumpNone = 0;
export type JumpRising = 1;
export const jump_rising: JumpRising = 1;
export type JumpFalling = 2;
export const jump_falling: JumpFalling = 2;
export type JumpPrepare = 3;
export const jump_prepare: JumpPrepare = 3;
export type JumpAfter = 4;
export const jump_after: JumpAfter = 4;
export type JumpFail = 5;
export const jump_fail: JumpFail = 5;

export type JumpState =
  | JumpNone
  | JumpRising
  | JumpFalling
  | JumpPrepare
  | JumpAfter
  | JumpFail;

export type FoxState = {
  ystate: YState;
  xstate: number;
  time_from_prev_frame: number;
  x_offset: number;
  y_offset: number;
  x: number;
  y: number;
  initial_y: number;
  jump_state: JumpState;
};

export function get_next_x(state: FoxState): number {
  'worklet';
  const x = x_frames[state.ystate];
  let next = state.xstate + 1;
  next = next > x ? 0 : next;
  return next;
}

export function set_y_state(state: FoxState, y: YState) {
  'worklet';
  state.ystate = y;
  state.xstate = 0;
  state.x_offset = 0;
  state.y_offset = y * side;
}

export function update_x_offset(
  state: FoxState,
  time_since_first_frame: number,
) {
  'worklet';
  const frames_count = x_frames[state.ystate];
  const delta = time_since_first_frame - state.time_from_prev_frame;
  const seconds_count = 1000;
  if (delta < seconds_count / frames_count) {
    return;
  }
  const x = get_next_x(state);
  state.xstate = x;
  state.x_offset = x * side;
  state.time_from_prev_frame = time_since_first_frame;
}

export function update_fox_state(
  state: FoxState,
  prev_ts: number,
  v: number,
  info: FrameInfo,
) {
  'worklet';

  const jump_height = side * 1.5;
  const delta = info.timeSinceFirstFrame - prev_ts;
  if (state.jump_state > 0) {
    if (state.jump_state === jump_fail) {
      if (state.ystate !== y_hit) {
        set_y_state(state, y_hit);
      }
      state.y += delta * v * 1.5;
      state.y = Math.min(state.y, state.initial_y);
      if (state.y === state.initial_y) {
        state.jump_state = jump_none;
      }
    } else if (state.jump_state === jump_prepare) {
      update_x_offset(state, info.timeSinceFirstFrame);
      if (state.xstate > 2) {
        state.jump_state = jump_rising;
      }
    } else if (state.jump_state === jump_after) {
      update_x_offset(state, info.timeSinceFirstFrame);
      if (state.xstate === x_frames[state.ystate] || state.xstate === 0) {
        state.jump_state = jump_none;
        set_y_state(state, y_walk);
      }
    } else if (state.jump_state === jump_rising) {
      state.y -= delta * v * 1.5;
      state.y = Math.max(state.y, state.initial_y - jump_height);
      if (state.y === state.initial_y - jump_height) {
        if (info.timeSinceFirstFrame - state.time_from_prev_frame > 300) {
          state.jump_state = jump_falling;
        }
      } else if (state.y < state.initial_y - jump_height / 3) {
        state.xstate = 2;
        update_x_offset(state, info.timeSinceFirstFrame);
      } else {
        state.xstate = 3;
        update_x_offset(state, info.timeSinceFirstFrame);
      }
    } else if (state.jump_state === jump_falling) {
      state.y = state.y + delta * v * 1.5;
      state.y = Math.min(state.y, state.initial_y);
      if (state.y >= state.initial_y && state.xstate === 5) {
        state.jump_state = jump_after;
      } else if (state.y >= state.initial_y - jump_height) {
        state.xstate = 4;
        update_x_offset(state, info.timeSinceFirstFrame);
      }
    }
  } else if (state.ystate === y_hit) {
    update_x_offset(state, info.timeSinceFirstFrame);
    if (state.xstate === x_frames[y_hit]) {
      set_y_state(state, y_walk);
    }
  } else if (state.ystate === y_die) {
    if (state.xstate < x_frames[y_die]) {
      update_x_offset(state, info.timeSinceFirstFrame);
    }
  } else {
    update_x_offset(state, info.timeSinceFirstFrame);
  }
}

export function init_fox_state(
  x: number,
  y: number,
  ystate: YState = y_ready,
): FoxState {
  'worklet';
  return {
    ystate,
    xstate: 0,
    time_from_prev_frame: 0,
    x_offset: 0,
    y_offset: ystate * side,
    x,
    y,
    initial_y: y,
    jump_state: jump_none,
  };
}
