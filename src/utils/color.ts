import log from '../lib/utils/logger';

export function colorAsString (color: any): string {
  log.trace('Starting color conversion to string');
  log.debug('Input color:', color);

  if (typeof color === 'string') {
    log.trace('Color is already string format, returning directly');
    return color;
  }
  if (color && typeof color === 'object') {
    if (color.r && color.g && color.b) {
      const rgbString = `rgb(${color.r}, ${color.g}, ${color.b})`;
      log.trace('RGB color converted to string:', rgbString);
      return rgbString;
    }
    if (color.hex) {
      log.trace('Using color hex property:', color.hex);
      return color.hex;
    }
  }
  log.warn('Unrecognized color format, returning default black');
  return '#000000';
}

export function getLuminanceForRGB (color: any): number {
  log.trace('Starting RGB color luminance calculation');
  log.debug('Input color:', color);

  if (!color || !color.r || !color.g || !color.b) {
    log.warn('Invalid RGB color, returning luminance 0');
    return 0;
  }

  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  log.trace('Normalized RGB values:', { r, g, b });

  // Calculate relative luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  log.debug('Calculated luminance:', luminance);

  return luminance;
}

export function getBackgroundGradientCSSVarsFromArtworks (
  artworks: any[],
  options: {
    sortFn?: (a: any, b: any) => number;
    shouldRemoveGreys?: boolean;
  } = {}
): string {
  log.info(
    'Starting background gradient CSS variables generation from artworks'
  );
  log.debug('Input artwork count:', artworks.length);
  log.debug('Options:', options);

  const { sortFn, shouldRemoveGreys = false } = options;

  let processedArtworks = [...artworks];
  log.trace('Copying artwork array');

  // Filter out artworks without background colors
  processedArtworks = processedArtworks.filter(
    (artwork) => artwork && artwork.backgroundColor
  );
  log.trace(
    `Filtered artwork count: ${processedArtworks.length} (removed ${artworks.length - processedArtworks.length} artworks without background color)`
  );

  // Remove greys if requested
  if (shouldRemoveGreys) {
    const originalCount = processedArtworks.length;
    processedArtworks = processedArtworks.filter((artwork) => {
      const { r, g, b } = artwork.backgroundColor;
      return !(r === g && g === b);
    });
    log.trace(
      `Artwork count after removing greys: ${processedArtworks.length} (removed ${originalCount - processedArtworks.length} grey artworks)`
    );
  }

  // Sort artworks if sort function is provided
  if (sortFn) {
    log.trace('Sorting artworks using provided sort function');
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
      log.trace(`Adding color for position ${position}: ${color}`);
    }
  });

  log.debug('Generated CSS variables:', cssVars);
  return cssVars;
}

export function isNamedColor (color: any): boolean {
  log.trace('Checking if color is named');
  log.debug('Input color:', color);

  const result = color && typeof color === 'object' && color.name !== undefined;
  log.debug('Check result:', result);

  return result;
}
