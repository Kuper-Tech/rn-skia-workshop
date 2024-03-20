import {SkPoint, vec} from '@shopify/react-native-skia';

export function get_verticies(width: number, height?: number): SkPoint[] {
  const h = height ? height : width;
  return [vec(0, 0), vec(width, 0), vec(width, h), vec(0, h)];
}

// reusing verticies
// we going clockwise 0, 1, 2 triangle first
// then 0, 2, 3 triangle
//(0, 0)______________(w, 0)
//     |\             |
//     | \            |
//     |  \           |
//     |   \          |
//     |    \         |
//     |     \        |
//     |      \       |
//     |       \      |
//     |        \     |
//     |         \    |
//     |          \   |
//     |           \  |
//     |            \ |
//     |             \|
//(0, h)--------------(w, h)
export const indicies = [0, 1, 2, 0, 2, 3];
