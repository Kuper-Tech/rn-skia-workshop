import React, {useMemo} from 'react';
import {
  useImage,
  ImageShader,
  Shader,
  Vertices,
  Rect,
  SharedValueType,
} from '@shopify/react-native-skia';
import {get_verticies, indicies} from './utils';
import {useDerivedValue} from 'react-native-reanimated';
import {shader} from './Shader';
import {GameState} from './GameState';

export const ENEMY_WIDTH = 22;
export const ENEMY_HEIGHT = 18;
const vertices = get_verticies(ENEMY_WIDTH, ENEMY_HEIGHT);
export const ENEMY_FRAMES = 10;

export type EnemyProps = {
  game_state: SharedValueType<GameState>;
  pd: number;
};

export function EnemyComponent(props: EnemyProps) {
  const pd = props.pd;
  const shader_scale = useMemo(() => [{scale: pd}], [pd]);
  const spikes = useImage(require('./images/spikes.png'));
  const transform = useDerivedValue(() => {
    let {x, y} = props.game_state.value.enemy;
    return [{translateY: y * pd}, {translateX: x * pd}] as [
      {translateY: number},
      {translateX: number},
    ];
  });
  const uniforms = useDerivedValue(() => {
    const {x_offset} = props.game_state.value.enemy;
    return {x_offset, y_offset: 0};
  });

  if (!spikes) {
    return null;
  }

  return (
    <Rect
      transform={transform}
      x={0}
      y={0}
      width={ENEMY_WIDTH * pd}
      height={ENEMY_HEIGHT * pd}>
      <Shader transform={shader_scale} source={shader!} uniforms={uniforms}>
        <ImageShader image={spikes} />
      </Shader>
      <Vertices textures={vertices} vertices={vertices} indices={indicies} />
    </Rect>
  );
}
