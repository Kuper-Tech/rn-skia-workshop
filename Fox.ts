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

export type FoxState = {
  ystate: YState;
  xstate: number;
  time_from_prev_frame: number;
  x_offset: number;
  y_offset: number;
  x: number;
  y: number;
  initial_y: number;
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

export function update_fox_state(state: FoxState, info: FrameInfo) {
  'worklet';

  update_x_offset(state, info.timeSinceFirstFrame);
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
  };
}
