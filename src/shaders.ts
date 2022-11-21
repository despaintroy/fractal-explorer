import { Color } from "./types";

export type Shader = (input: number) => Color;

type Gradient = Array<[number, Color]>;

const colors: Record<string, Color> = {
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
  orange: { r: 252, g: 290, b: 43 },
  darkBlue: { r: 0, g: 13, b: 97 },
  lightBlue: { r: 220, g: 230, b: 240 },
	brick: { r: 130, g: 60, b: 40 },
	yellow: { r: 250, g: 220, b: 100 },
};

export const shaders: Record<string, Shader> = {
  blue: makeShader([
    [0, colors.darkBlue],
    [0.2, colors.lightBlue],
		[0.4, colors.yellow],
    [1, colors.brick],
  ]),
};

function makeShader(gradient: Gradient): Shader {
  return (input) => {
    if (input === 1) {
      return colors.black;
    }

    for (let i = 0; i < gradient.length - 1; i++) {
      const [t1, c1] = gradient[i];
      const [t2, c2] = gradient[i + 1];

      if (input >= t1 && input <= t2) {
        return interpolate(c1, c2, (input - t1) / (t2 - t1));
      }
    }

    return colors.black;
  };
}

function interpolate(a: Color, b: Color, t: number): Color {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}
