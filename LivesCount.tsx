import React, {useMemo} from 'react';

import {
  ImageShader,
  Rect,
  Shader,
  SharedValueType,
  SkImage,
  Vertices,
  useImage,
} from '@shopify/react-native-skia';
import type {GameState} from './GameState';
import {useDerivedValue} from 'react-native-reanimated';
import {shader} from './Shader';
import {get_verticies, indicies} from './utils';

const lives_side = 32;

// Position for each point of rect
export const enemy_vertices = get_verticies(lives_side);

export type LivesCountProps = {
  game_state: SharedValueType<GameState>;
  pd: number;
};

type HeartComponentProps = {
  game_state: SharedValueType<GameState>;
  count: number;
  img: SkImage;
  pd: number;
};

function HeartComponent({game_state, count, img, pd}: HeartComponentProps) {
  const scale = useMemo(() => {
    return [{scale: 1}];
  }, []);
  const u = useDerivedValue(() => {
    const {lives} = game_state.value;
    return {x_offset: lives > count ? 0 : 64, y_offset: 0};
  });
  const t = useMemo(
    () => [{translateX: 8 + count * lives_side}, {translateY: 8 * pd}],
    [count, pd],
  );

  return (
    <Rect transform={t} x={0} y={0} width={lives_side} height={lives_side}>
      <Shader transform={scale} source={shader!} uniforms={u}>
        <ImageShader image={img} />
      </Shader>
      <Vertices
        textures={enemy_vertices}
        vertices={enemy_vertices}
        indices={indicies}
      />
    </Rect>
  );
}

export function LivesCount({game_state, pd}: LivesCountProps) {
  const hearts = useImage(require('./images/hearts.png'));

  const items = useMemo(() => {
    return new Array(game_state.value.game_decl.initial_lives).fill(0);
  }, []);
  if (!hearts) {
    return null;
  }

  return (
    <>
      {items.map((_, i) => (
        <HeartComponent
          key={i.toString()}
          img={hearts}
          count={i}
          game_state={game_state}
          pd={pd}
        />
      ))}
    </>
  );
}
