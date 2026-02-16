<script lang="ts">
  export let color: string = '#000000';
</script>

<style lang="scss">
  .hero {
    position: relative;
    overflow: hidden;
  }

  .gradient {
    --rotation: 55deg;

    &:dir(rtl) {
      --rotation: -55deg;
      mask-image:
        radial-gradient(
          ellipse 127% 130% at 95% 100%,
          rgb(0, 0, 0) 18%,
          rgb(0, 0, 0.33) 24%,
          rgba(0, 0, 0, 0.66) 32%,
          transparent 40%
        ),
        linear-gradient(-129deg, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0) 55%);
    }
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      var(--rotation),
      rgb(from var(--color) r g b / 0.25) 0%,
      transparent 50%
    );
    filter: saturate(1.5) brightness(0.9);
    backdrop-filter: blur(40px);
    mask-image:
      radial-gradient(
        ellipse 127% 130% at 5% 100%,
        rgb(0, 0, 0) 18%,
        rgb(0, 0, 0.33) 24%,
        rgba(0, 0, 0, 0.66) 32%,
        transparent 40%
      ),
      linear-gradient(51deg, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0) 55%);

    @media (max-width: 768px) {
      --rotation: 0deg;
      mask-image: linear-gradient(
        var(--rotation),
        rgb(0, 0, 0) 28%,
        rgba(0, 0, 0, 0) 56%
      );
    }
  }
</style>

<div class="hero">
  <div class="gradient" style="--color: {color};" />
  <slot />
</div>
