import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Background} from './Background';
import {Canvas} from '@shopify/react-native-skia';

const {width, height} = Dimensions.get('window');

export function App() {
  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Background width={width} height={height} />
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
