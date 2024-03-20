import React, {useMemo} from 'react';
import {
  useImage,
  ImageShader,
  Shader,
  Vertices,
  Rect,
  SharedValueType,
} from '@shopify/react-native-skia';
import {useDerivedValue} from 'react-native-reanimated';
import {GameState} from './GameState';
import {shader} from './Shader';
import {indicies, get_verticies} from './utils';

export const START_SIDE = 64;
export const START_FRAMES = 16;
const start_vertices = get_verticies(START_SIDE);

export type StartFlagProps = {
  game_state: SharedValueType<GameState>;
  pd: number;
};

export function StartFlagComponent(props: StartFlagProps) {
  const pd = props.pd;
  const shader_scale = useMemo(() => [{scale: pd}], [pd]);
  const start = useImage(require('./images/start_64x64.png'));
  const transform = useDerivedValue(() => {
    let {x, y} = props.game_state.value.start;
    return [{translateY: y * pd}, {translateX: x * pd}] as [
      {translateY: number},
      {translateX: number},
    ];
  });
  const uniforms = useDerivedValue(() => {
    const {x_offset} = props.game_state.value.start;
    return {x_offset, y_offset: 0};
  });

  if (!start) {
    return null;
  }

  return (
    <>
      <Rect
        transform={transform}
        x={0}
        y={0}
        width={START_SIDE * pd}
        height={START_SIDE * pd}>
        <Shader transform={shader_scale} source={shader!} uniforms={uniforms}>
          <ImageShader image={start} />
        </Shader>
        <Vertices
          textures={start_vertices}
          vertices={start_vertices}
          indices={indicies}
        />
      </Rect>
    </>
  );
}
