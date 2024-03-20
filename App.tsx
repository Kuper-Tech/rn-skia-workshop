import React, {useMemo} from 'react';
import {
  Dimensions,
  PixelRatio,
  StyleSheet,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {Background} from './Background';
import {Canvas} from '@shopify/react-native-skia';
import {GRASS_SIDE, Terrain} from './Terrain';
import {useGameState, game_update, PressHandler} from './GameState';
import {useFrameCallback} from 'react-native-reanimated';
import {side, y_walk} from './Fox';
import {FoxComponent} from './FoxComponent';
import {
  ENEMY_FRAMES,
  ENEMY_HEIGHT,
  ENEMY_WIDTH,
  EnemyComponent,
} from './EnemyComponent';
import { LivesCount } from './LivesCount';

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
    fox_x: side,
    fox_y: height / pd - terrain_size - side,
    fox_state: y_walk,
    enemy_height: ENEMY_HEIGHT,
    enemy_width: ENEMY_WIDTH,
    enemy_frames: ENEMY_FRAMES,
    initial_lives: 3,
  });

  useFrameCallback(info => {
    // @ts-ignore
    gs.modify(gs => {
      'worklet';
      return game_update(gs, info);
    });
  }, true);
  const pressHandler = useMemo(() => new PressHandler(gs), [gs]);

  return (
    <TouchableNativeFeedback onPress={pressHandler.onPress}>
      <View style={styles.container}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Background width={width} height={height} />
          <EnemyComponent game_state={gs} pd={pd} />
          <FoxComponent game_state={gs} pd={pd} />
          <Terrain width={width} pd={pd} game_state={gs} />
          <LivesCount game_state={gs} pd={pd} />
        </Canvas>
      </View>
    </TouchableNativeFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
