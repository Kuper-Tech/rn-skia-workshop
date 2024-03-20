import {SharedValueType} from '@shopify/react-native-skia';
import React, {useState} from 'react';
import {
  useAnimatedReaction,
  useAnimatedRef,
  runOnJS,
} from 'react-native-reanimated';
import {GameState} from './GameState';
import {StyleSheet, Text} from 'react-native';

export type CountLabelProps = {
  gs: SharedValueType<GameState>;
};

export function CountLabel(props: CountLabelProps) {
  const ref = useAnimatedRef<Text>();
  const [count, set_count] = useState(0);
  useAnimatedReaction(
    () => props.gs.value.count,
    count => {
      runOnJS(set_count)(count);
    },
  );

  return (
    <Text ref={ref as any} style={styles.container}>
      Score: {count}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 24,
    right: 8,
    fontSize: 18,
    color: 'black',
    alignItems: 'center',
    textAlign: 'right',
  },
});
