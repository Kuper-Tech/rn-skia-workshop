import React from 'react';
import {useImage, Rect, ImageShader} from '@shopify/react-native-skia';

export type BackgroundProps = {
  width: number;
  height: number;
};

export function Background({width, height}: BackgroundProps) {
  const background = useImage(require('./images/Brown.png'));
  if (!background) {
    return null;
  }
  return (
    <Rect x={0} y={0} width={width} height={height}>
      <ImageShader
        image={background}
        x={0}
        y={0}
        width={width}
        height={height}
        tx={'repeat'}
        ty={'repeat'}
      />
    </Rect>
  );
}
