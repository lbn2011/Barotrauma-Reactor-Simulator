<script lang="ts">
import { TodayCard, Carousel, ResponsiveContainer } from '@/components/shared';
import { defaultComponentConfig } from '@/config/components';
import i18nStore from '@/stores/i18n';
import type { TodayCard as TodayCardType, Item } from '@/types';
import log from '@/lib/utils/logger';

// Component initialization logs
log.info('Overview component initialized');
log.debug('Starting to load component dependencies and data');

interface CarouselItem extends Item {
  id: number;
  title: string;
  description: string;
}

// Mock data for TodayCard
log.debug('Starting to load TodayCard mock data');
const mockCard: TodayCardType = {
  heading: 'Reactor Simulator',
  title: 'Overview',
  inlineDescription:
    'This is overview page for reactor simulator, providing real-time monitoring and control capabilities.',
  media: {
    kind: 'image' as const,
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nuclear%20reactor%20control%20room%20with%20multiple%20screens%20and%20gauges%2C%20modern%20design%2C%20blue%20lighting%2C%20high%20detail&image_size=landscape_16_9',
  },
  style: 'dark',
  clickAction: {
    title: 'View Overview',
    destination: {
      url: '/',
    },
  },
};
log.success('TodayCard mock data loaded successfully');

// Mock data for Carousel
log.debug('Starting to load Carousel mock data');
const mockCarouselItems: CarouselItem[] = [
  {
    id: 1,
    title: 'Reactor Control',
    description: 'Monitor and control reactor parameters in real-time',
    artwork: {
      template:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=reactor%20control%20panel%20with%20control%20rods%20and%20power%20gauges&image_size=landscape_16_9',
    },
  },
  {
    id: 2,
    title: 'Turbine Monitoring',
    description: 'Track turbine performance and adjust load settings',
    artwork: {
      template:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=turbine%20control%20room%20with%20speed%20and%20load%20indicators&image_size=landscape_16_9',
    },
  },
  {
    id: 3,
    title: 'Cooling System',
    description: 'Manage cooling systems to maintain optimal temperatures',
    artwork: {
      template:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cooling%20system%20diagram%20with%20pumps%20and%20heat%20exchangers&image_size=landscape_16_9',
    },
  },
];
log.success('Carousel mock data loaded successfully', { itemCount: mockCarouselItems.length });
log.info('Overview component initialization completed');
</script>

<style>
.overview-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary, #1a1a1a);
}

.page-description {
  font-size: 16px;
  margin-bottom: 32px;
  color: var(--text-secondary, #666666);
}

.card-section {
  margin-bottom: 48px;
}

.carousel-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary, #1a1a1a);
}

@media (min-width: 768px) {
  .page-title {
    font-size: 32px;
  }

  .page-description {
    font-size: 18px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>

<ResponsiveContainer>
  <div class="overview-container">
    <h1 class="page-title">{$i18nStore.t('Overview')}</h1>
    <p class="page-description">
      {$i18nStore.t('This is the overview page for the reactor simulator.')}
    </p>

    <div class="card-section">
      <TodayCard card={mockCard} config={defaultComponentConfig} />
    </div>

    <div class="carousel-section">
      <h2 class="section-title">System Monitoring</h2>
      <Carousel items={mockCarouselItems} config={defaultComponentConfig} />
    </div>
  </div>
</ResponsiveContainer>
