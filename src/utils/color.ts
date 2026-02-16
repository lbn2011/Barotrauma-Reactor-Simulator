export function colorAsString(color: any): string {
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
