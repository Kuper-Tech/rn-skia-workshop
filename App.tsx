import React from 'react';
import {Dimensions, PixelRatio, StyleSheet, View} from 'react-native';
import {Background} from './Background';
import {Canvas} from '@shopify/react-native-skia';
import {GRASS_SIDE, Terrain} from './Terrain';
import {useGameState, game_update} from './GameState';
import {useFrameCallback} from 'react-native-reanimated';

const {width, height} = Dimensions.get('window');
const pd = PixelRatio.get();

export function App() {
  const terrain_size = GRASS_SIDE;
  const gs = useGameState({
    width: width / pd,
    height: height / pd,
    terrain_size,
    velocity: 0.2 / pd,
    pd,
  });

  useFrameCallback(info => {
    // @ts-ignore
    gs.modify(gs => {
      'worklet';
      return game_update(gs, info);
    });
  }, true);

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Background width={width} height={height} />
        <Terrain width={width} pd={pd} game_state={gs} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
