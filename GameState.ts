import {FrameInfo, SharedValue, useSharedValue} from 'react-native-reanimated';
import {FoxState, YState, init_fox_state, update_fox_state} from './Fox';

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
};

export type GameState = {
  game_decl: GameDecl;
  terrains: [TerrainBlock, TerrainBlock, TerrainBlock];
  prev_timestamp: number;
  fox_state: FoxState;
};

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
  };
}

export function useGameState(game_decl: GameDecl): SharedValue<GameState> {
  return useSharedValue(init_game_state(game_decl));
}

export function game_update(gs: GameState, info: FrameInfo): GameState {
  'worklet';
  update_terrains(gs, gs.game_decl.velocity, info);
  update_fox_state(gs.fox_state, info);
  return gs;
}
