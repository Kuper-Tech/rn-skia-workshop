import {SharedValueType} from '@shopify/react-native-skia';
import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {GameState} from './GameState';
import {y_sleep} from './Fox';
import {Dimensions} from 'react-native';

export type StartTapLabelProps = {
  gs: SharedValueType<GameState>;
};

const {height} = Dimensions.get('window');

export function StartTapLabel(props: StartTapLabelProps) {
  const styles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: 0,
      top: 0,
      paddingTop: height / 3,
      right: 0,
      bottom: 0,
      fontSize: 24,
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      textAlign: 'center',
      opacity: props.gs.value.fox_state.ystate === y_sleep ? 1 : 0,
    };
  });

  return <Animated.Text style={styles}>Tap to play</Animated.Text>;
}
