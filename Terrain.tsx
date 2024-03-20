import React from 'react';
import {
  useImage,
  Rect,
  ImageShader,
  SharedValueType,
  SkImage,
} from '@shopify/react-native-skia';
import {useDerivedValue} from 'react-native-reanimated';
import {GameState} from './GameState';
import {PixelRatio} from 'react-native';

export const GRASS_SIDE = 44;

export type TerrainProps = {
  game_state: SharedValueType<GameState>;
  width: number;
  pd: number;
};
type TerrainPartProps = {
  width: number;
  pd: number;
  grass: SkImage;
  x: SharedValueType<number>;
  y: SharedValueType<number>;
};

function TerrainPart(props: TerrainPartProps) {
  const {x, y, grass, width, pd} = props;
  const scaled_grass = GRASS_SIDE * pd;
  return (
    <Rect x={x} y={y} width={width * pd} height={scaled_grass}>
      <ImageShader
        image={grass}
        x={x}
        y={y}
        width={width}
        height={scaled_grass}
        fit={'fitHeight'}
        tx="repeat"
        fm="nearest"
      />
    </Rect>
  );
}

export function Terrain(props: TerrainProps) {
  const {width, pd} = props;
  const grassTerrain = useImage(require('./images/grass.png'));

  const leftX = useDerivedValue(
    () => props.game_state.value.terrains[0].x * pd,
  );
  const y = useDerivedValue(() => {
    return props.game_state.value.terrains[0].y * pd;
  });

  const centerX = useDerivedValue(
    () => props.game_state.value.terrains[1].x * pd,
  );
  const rightX = useDerivedValue(
    () => props.game_state.value.terrains[2].x * pd,
  );
  if (!grassTerrain) {
    return null;
  }
  return (
    <>
      <TerrainPart width={width} pd={pd} x={leftX} y={y} grass={grassTerrain} />
      <TerrainPart
        width={width}
        pd={pd}
        x={centerX}
        y={y}
        grass={grassTerrain}
      />
      <TerrainPart
        width={width}
        pd={pd}
        x={rightX}
        y={y}
        grass={grassTerrain}
      />
    </>
  );
}
