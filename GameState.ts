import {FrameInfo, SharedValue, useSharedValue} from 'react-native-reanimated';
import {
  FoxState,
  YState,
  init_fox_state,
  jump_after,
  jump_prepare,
  set_y_state,
  side,
  update_fox_state,
  y_die,
  y_hit,
  y_jump,
  y_sleep,
  y_walk,
} from './Fox';

export type TerrainBlock = {
  x: number;
  y: number;
};

export type GameDecl = {
  width: number;
  height: number;
  terrain_size: number;
  velocity: number;
  pd: number;
  fox_state: YState;
  fox_y: number;
  fox_x: number;
  enemy_width: number;
  enemy_height: number;
  enemy_frames: number;
  initial_lives: number;
  start_side: number;
  start_frames: number;
};

export type EnemyState = {
  x: number;
  y: number;
  frame: number;
  width: number;
  height: number;
  x_offset: number;
  time_from_prev_update: number;
  is_hitted: boolean;
};

export function init_enemy_state(
  x: number,
  y: number,
  width: number,
  height: number,
): EnemyState {
  'worklet';
  return {
    x,
    y,
    frame: 0,
    width,
    height,
    x_offset: 0,
    time_from_prev_update: 0,
    is_hitted: false,
  };
}

export function update_enemy(gs: GameState, info: FrameInfo, v: number) {
  'worklet';

  const delta = info.timeSinceFirstFrame - gs.enemy.time_from_prev_update;
  gs.enemy.x -= (info.timeSinceFirstFrame - gs.prev_timestamp) * v;
  if (delta < 1000 / gs.game_decl.enemy_frames) {
    return;
  }
  gs.enemy.frame += 1;
  gs.enemy.x_offset = gs.enemy.frame * gs.game_decl.enemy_width;
  if (gs.enemy.frame > gs.game_decl.enemy_frames) {
    gs.enemy.x_offset = 0;
    gs.enemy.frame = 0;
  }
  gs.enemy.time_from_prev_update = info.timeSinceFirstFrame;

  if (gs.enemy.x + gs.enemy.width < -gs.game_decl.width / 2) {
    if (gs.enemy.is_hitted) {
      gs.enemy.x = gs.game_decl.width + gs.enemy.width;
    } else {
      gs.count += 1;
      gs.enemy.x = gs.game_decl.width + gs.enemy.width / 2;
    }
    gs.enemy.is_hitted = false;
  }
}

export type StartState = {
  x: number;
  y: number;
  frame: number;
  time_from_prev_update: number;
  x_offset: number;
};

export type GameState = {
  game_decl: GameDecl;
  terrains: [TerrainBlock, TerrainBlock, TerrainBlock];
  prev_timestamp: number;
  fox_state: FoxState;
  enemy: EnemyState;
  lives: number;
  start: StartState;
  count: number;
};

export function init_start_state(x: number, y: number): StartState {
  'worklet';
  return {
    x,
    y,
    frame: 0,
    time_from_prev_update: 0,
    x_offset: 0,
  };
}

export function init_terrains(
  game_decl: GameDecl,
): [TerrainBlock, TerrainBlock, TerrainBlock] {
  'worklet';
  const y = game_decl.height - game_decl.terrain_size;
  const width = game_decl.width;
  return [
    {x: -width, y},
    {x: 0, y},
    {x: width, y},
  ];
}

export function update_terrains(state: GameState, v: number, info: FrameInfo) {
  'worklet';
  const delta = info.timeSinceFirstFrame - state.prev_timestamp;
  state.prev_timestamp = info.timeSinceFirstFrame;
  const [left, center, right] = state.terrains;
  const offset = delta * v;
  left.x -= offset;
  center.x -= offset;
  right.x -= offset;
  if (left.x < -1.5 * state.game_decl.width) {
    // Swap terrain parts when we pass 0.5 width
    left.x = right.x + state.game_decl.width;
    state.terrains[0] = center;
    state.terrains[1] = right;
    state.terrains[2] = left;
  }
}

export function is_overlaping1D(
  xmin1: number,
  xmax1: number,
  xmin2: number,
  xmax2: number,
): boolean {
  'worklet';
  return xmax1 >= xmin2 && xmax2 >= xmin1;
}

export function is_overlaping2D(
  ex1: number,
  ey1: number,
  ex2: number,
  ey2: number,
  fx1: number,
  fy1: number,
  fx2: number,
  fy2: number,
): boolean {
  'worklet';
  return (
    is_overlaping1D(ex1, ex2, fx1, fx2) && is_overlaping1D(ey1, ey2, fy1, fy2)
  );
}

export function handle_collisions(gs: GameState) {
  'worklet';
  const ex0 = gs.enemy.x + gs.enemy.width / 4;
  const ey0 = gs.enemy.y;
  const fx0 = gs.fox_state.x + 4;
  const fy0 = gs.fox_state.y;
  const ex1 = gs.enemy.x + gs.enemy.width / 2;
  const ey1 = gs.enemy.y + gs.enemy.height / 2;
  const fx1 = gs.fox_state.x + side - 8;
  const fy1 = gs.fox_state.y + side;
  if (
    !gs.enemy.is_hitted &&
    is_overlaping2D(ex0, ey0, ex1, ey1, fx0, fy0, fx1, fy1)
  ) {
    gs.enemy.is_hitted = true;
    if (gs.fox_state.jump_state > 0) {
      gs.fox_state.jump_state = 5;
    } else {
      set_y_state(gs.fox_state, y_hit);
    }
    gs.lives -= 1;
    if (gs.lives === 0) {
      gs.fox_state.jump_state = 0;
      set_y_state(gs.fox_state, y_die);
    }
  }
}

export function init_game_state(game_decl: GameDecl): GameState {
  'worklet';
  return {
    game_decl,
    terrains: init_terrains(game_decl),
    prev_timestamp: 0,
    fox_state: init_fox_state(
      game_decl.fox_x,
      game_decl.fox_y,
      game_decl.fox_state,
    ),
    enemy: init_enemy_state(
      game_decl.width * 2,
      game_decl.fox_y + (side - game_decl.enemy_height),
      game_decl.enemy_width,
      game_decl.enemy_height,
    ),
    lives: game_decl.initial_lives,
    start: init_start_state(1.5 * side, game_decl.fox_y - side),
    count: 0,
  };
}

export function useGameState(game_decl: GameDecl): SharedValue<GameState> {
  return useSharedValue(init_game_state(game_decl));
}

export function update_flag(gs: GameState, info: FrameInfo, v: number) {
  'worklet';

  const delta = info.timeSinceFirstFrame - gs.start.time_from_prev_update;
  gs.start.x -= (info.timeSinceFirstFrame - gs.prev_timestamp) * v;
  if (delta < 750 / gs.game_decl.start_frames) {
    return;
  }
  gs.start.frame += 1;
  gs.start.x_offset = gs.start.frame * gs.game_decl.start_side;
  if (gs.start.frame > gs.game_decl.start_frames) {
    gs.start.x_offset = 0;
    gs.start.frame = 0;
  }
  gs.start.time_from_prev_update = info.timeSinceFirstFrame;
}

export function game_update(gs: GameState, info: FrameInfo): GameState {
  'worklet';
  let v =
    gs.fox_state.ystate === y_jump
      ? gs.game_decl.velocity * 1.25
      : gs.game_decl.velocity;

  if (gs.fox_state.ystate === y_sleep || gs.fox_state.ystate === y_die) {
    v = 0;
  }

  update_flag(gs, info, v);
  update_enemy(gs, info, v);
  update_fox_state(gs.fox_state, gs.prev_timestamp, v, info);
  update_terrains(gs, v, info);
  handle_collisions(gs);
  return gs;
}

export function reset_state(game_state: GameState) {
  'worklet';
  const next = init_game_state(game_state.game_decl);
  game_state.fox_state = next.fox_state;
  game_state.terrains = next.terrains;
  game_state.prev_timestamp = next.prev_timestamp;
  game_state.enemy = next.enemy;
  game_state.lives = next.lives;
  game_state.start = next.start;
  game_state.count = 0;
}

function handlePress(gs: GameState): GameState {
  'worklet';
  if (gs.fox_state.ystate === y_die) {
    reset_state(gs);
  } else if (gs.fox_state.ystate === y_sleep) {
    set_y_state(gs.fox_state, y_walk);
  } else if (
    !gs.fox_state.jump_state ||
    gs.fox_state.jump_state === jump_after
  ) {
    gs.fox_state.jump_state = jump_prepare;
    set_y_state(gs.fox_state, y_jump);
  }
  return gs;
}

export class PressHandler {
  gs: SharedValue<GameState>;
  constructor(gs: SharedValue<GameState>) {
    this.gs = gs;
  }

  onPress = () => {
    // @ts-ignore
    this.gs.modify(handlePress);
  };
}
