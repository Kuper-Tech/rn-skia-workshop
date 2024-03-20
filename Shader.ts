import {Skia} from '@shopify/react-native-skia';

export const shader = Skia.RuntimeEffect.Make(
  `
uniform shader image;
uniform float x_offset;
uniform float y_offset;

vec4 main(vec2 TexCoord) {
  return image.eval(
    vec2(TexCoord.x, TexCoord.y) + 
      vec2(x_offset, y_offset)
  ).rgba;
}
`,
);

if (!shader) {
  throw new Error("Couldn't compile the shader");
}
