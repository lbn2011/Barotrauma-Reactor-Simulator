<script lang="ts">
  import { Page, Navigation, AmbientBackgroundArtwork, GradientOverlay, Hero, TodayCard } from '@/components/shared';
  import Overview from './Overview.svelte';
  import { defaultComponentConfig } from '@/config/components';
  import i18nStore from '@/stores/i18n';
</script>

<Page config={defaultComponentConfig}>
  <Navigation slot="navigation" />
  <AmbientBackgroundArtwork slot="background" />
  <GradientOverlay slot="overlay" />
  
  <div class="container">
    <Hero
      color="#0066ff"
      profile="large-hero"
      config={defaultComponentConfig}
    >
      <div class="hero-content">
        <h1>{$i18nStore.t('Overview')}</h1>
        <p>{$i18nStore.t('ASE.Web.AppStore.Navigation.AX.AppStoreLogo')}</p>
      </div>
    </Hero>
    
    <div class="content">
      <Overview />
    </div>
  </div>
</Page>

<style>
  .container {
    width: 100%;
  }

  .hero-content {
    padding: 24px;
    color: white;
  }

  .hero-content h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .hero-content p {
    font-size: 16px;
    margin-bottom: 0;
  }

  .content {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    .hero-content {
      padding: 48px;
    }

    .hero-content h1 {
      font-size: 48px;
    }

    .content {
      padding: 48px;
    }
  }
</style>
