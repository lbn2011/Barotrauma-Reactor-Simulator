import type { TodayCardMedia } from '../../../types';
import { logger } from '../../../lib/utils/logger';

export function bestBackgroundColor (_media?: TodayCardMedia): string {
  // Implement background color calculation logic here
  logger.debug('Calculating best background color', {
    hasMedia: !!_media,
    mediaKind: _media?.kind,
  });
  const backgroundColor = '#000000';
  logger.debug('Best background color calculated', {
    color: backgroundColor,
  });
  return backgroundColor;
}
