export function colorAsString (color: any): string {
  if (typeof color === 'string') {
    return color;
  }
  if (color && typeof color === 'object') {
    if (color.r && color.g && color.b) {
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
    if (color.hex) {
      return color.hex;
    }
  }
  return '#000000';
}

export function getLuminanceForRGB (color: any): number {
  if (!color || !color.r || !color.g || !color.b) return 0;

  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  // Calculate relative luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
}

export function getBackgroundGradientCSSVarsFromArtworks (
  artworks: any[],
  options: {
    sortFn?: (a: any, b: any) => number;
    shouldRemoveGreys?: boolean;
  } = {}
): string {
  const { sortFn, shouldRemoveGreys = false } = options;

  let processedArtworks = [...artworks];

  // Filter out artworks without background colors
  processedArtworks = processedArtworks.filter(
    (artwork) => artwork && artwork.backgroundColor
  );

  // Remove greys if requested
  if (shouldRemoveGreys) {
    processedArtworks = processedArtworks.filter((artwork) => {
      const { r, g, b } = artwork.backgroundColor;
      return !(r === g && g === b);
    });
  }

  // Sort artworks if sort function is provided
  if (sortFn) {
    processedArtworks.sort(sortFn);
  }

  // Build CSS variables string
  let cssVars = '';
  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  positions.forEach((position, index) => {
    if (index < processedArtworks.length) {
      const artwork = processedArtworks[index];
      const color = colorAsString(artwork.backgroundColor);
      cssVars += `--${position}: ${color}; `;
    }
  });

  return cssVars;
}

export function isNamedColor (color: any): boolean {
  return color && typeof color === 'object' && color.name !== undefined;
}
