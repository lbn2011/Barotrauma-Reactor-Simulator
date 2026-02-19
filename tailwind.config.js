/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调 - 避免单一蓝色，使用更丰富的色彩
        primary: {
          // 主色：靛蓝色系（专业、科技感）
          50: 'oklch(0.9791 0.0156 259.2009)',
          100: 'oklch(0.9605 0.0211 259.4441)',
          200: 'oklch(0.9263 0.0324 259.7008)',
          300: 'oklch(0.8714 0.0491 259.9140)',
          400: 'oklch(0.7927 0.0739 259.9861)',
          500: 'oklch(0.7054 0.0996 259.9657)',
          600: 'oklch(0.6156 0.1198 259.8476)',
          700: 'oklch(0.5286 0.1283 259.6613)',
          800: 'oklch(0.4492 0.1259 259.5142)',
          900: 'oklch(0.3837 0.1154 259.4192)',
          950: 'oklch(0.2393 0.0676 259.3178)',
        },
        // 辅助色 - 用于强调和交互
        secondary: {
          // 辅助色：琥珀色系（温暖、活力）
          50: 'oklch(0.9844 0.0204 85.7878)',
          100: 'oklch(0.9697 0.0339 85.8194)',
          200: 'oklch(0.9364 0.0566 85.7847)',
          300: 'oklch(0.8845 0.0868 85.7617)',
          400: 'oklch(0.8088 0.1245 85.7487)',
          500: 'oklch(0.7251 0.1546 85.7487)',
          600: 'oklch(0.6428 0.1674 85.7487)',
          700: 'oklch(0.5598 0.1633 85.7487)',
          800: 'oklch(0.4832 0.1445 85.7487)',
          900: 'oklch(0.4241 0.1232 85.7487)',
          950: 'oklch(0.2683 0.0645 85.7487)',
        },
        // 点缀色 - 用于特殊强调
        accent: {
          // 点缀色：玫红色系（现代、突出）
          50: 'oklch(0.9767 0.0277 356.7200)',
          100: 'oklch(0.9548 0.0451 356.4716)',
          200: 'oklch(0.9093 0.0769 356.1474)',
          300: 'oklch(0.8414 0.1189 355.7568)',
          400: 'oklch(0.7478 0.1681 355.2409)',
          500: 'oklch(0.6471 0.2087 354.6036)',
          600: 'oklch(0.5545 0.2276 353.8448)',
          700: 'oklch(0.4742 0.2264 353.0644)',
          800: 'oklch(0.4102 0.2071 352.3624)',
          900: 'oklch(0.3628 0.1809 351.8286)',
          950: 'oklch(0.2290 0.0985 351.2145)',
        },
        // 功能色 - 状态指示
        success: {
          // 成功：绿色系
          50: 'oklch(0.9756 0.0211 142.4653)',
          100: 'oklch(0.9548 0.0352 142.5368)',
          200: 'oklch(0.9118 0.0606 142.5987)',
          300: 'oklch(0.8447 0.0929 142.6303)',
          400: 'oklch(0.7518 0.1306 142.6303)',
          500: 'oklch(0.6471 0.1605 142.6303)',
          600: 'oklch(0.5545 0.1681 142.6303)',
          700: 'oklch(0.4742 0.1586 142.6303)',
          800: 'oklch(0.4102 0.1353 142.6303)',
          900: 'oklch(0.3628 0.1121 142.6303)',
          950: 'oklch(0.2290 0.0573 142.6303)',
        },
        warning: {
          // 警告：橙色系
          50: 'oklch(0.9782 0.0309 64.2337)',
          100: 'oklch(0.9605 0.0485 64.2653)',
          200: 'oklch(0.9207 0.0809 64.2969)',
          300: 'oklch(0.8536 0.1207 64.3285)',
          400: 'oklch(0.7585 0.1663 64.3285)',
          500: 'oklch(0.6598 0.1986 64.3285)',
          600: 'oklch(0.5745 0.2099 64.3285)',
          700: 'oklch(0.4986 0.1986 64.3285)',
          800: 'oklch(0.4368 0.1731 64.3285)',
          900: 'oklch(0.3894 0.1477 64.3285)',
          950: 'oklch(0.2483 0.0757 64.3285)',
        },
        error: {
          // 错误：红色系
          50: 'oklch(0.9733 0.0324 25.5645)',
          100: 'oklch(0.9505 0.0525 25.5645)',
          200: 'oklch(0.9023 0.0871 25.5645)',
          300: 'oklch(0.8270 0.1327 25.5645)',
          400: 'oklch(0.7368 0.1798 25.5645)',
          500: 'oklch(0.6368 0.2078 25.5645)',
          600: 'oklch(0.5515 0.2062 25.5645)',
          700: 'oklch(0.4742 0.1864 25.5645)',
          800: 'oklch(0.4102 0.1609 25.5645)',
          900: 'oklch(0.3628 0.1355 25.5645)',
          950: 'oklch(0.2222 0.0689 25.5645)',
        },
        info: {
          // 信息：青色系
          50: 'oklch(0.9767 0.0172 194.7689)',
          100: 'oklch(0.9548 0.0284 194.7689)',
          200: 'oklch(0.9093 0.0478 194.7689)',
          300: 'oklch(0.8414 0.0739 194.7689)',
          400: 'oklch(0.7478 0.1072 194.7689)',
          500: 'oklch(0.6471 0.1355 194.7689)',
          600: 'oklch(0.5545 0.1498 194.7689)',
          700: 'oklch(0.4742 0.1498 194.7689)',
          800: 'oklch(0.4102 0.1355 194.7689)',
          900: 'oklch(0.3628 0.1172 194.7689)',
          950: 'oklch(0.2290 0.0606 194.7689)',
        },
        // 浅色模式
        light: {
          // 背景色
          background: 'oklch(0.9800 0 0)', // #FFFFFF
          'background-secondary': 'oklch(0.9605 0 0)', // #F8F9FA
          'background-tertiary': 'oklch(0.9410 0 0)', // #F1F3F4

          // 前景色
          foreground: 'oklch(0.1448 0 0)', // #1A1A1A
          'foreground-secondary': 'oklch(0.3000 0 0)', // #4D4D4D
          'foreground-tertiary': 'oklch(0.5000 0 0)', // #808080

          // 卡片色
          card: 'oklch(0.9500 0 0)', // #F5F5F5
          'card-foreground': 'oklch(0.1448 0 0)', // #1A1A1A

          // 弹出层色
          popover: 'oklch(0.9500 0 0)', // #F5F5F5
          'popover-foreground': 'oklch(0.1448 0 0)', // #1A1A1A

          // 边框色
          border: 'oklch(0.8000 0 0)', // #CCCCCC
          'border-secondary': 'oklch(0.8500 0 0)', // #D9D9D9

          // 输入框色
          input: 'oklch(0.9500 0 0)', // #F5F5F5
          'input-foreground': 'oklch(0.1448 0 0)', // #1A1A1A

          // -muted色
          muted: 'oklch(0.8500 0 0)', // #D9D9D9
          'muted-foreground': 'oklch(0.5000 0 0)', // #808080

          // 强调色
          accent: 'oklch(0.8000 0 0)', // #CCCCCC
          'accent-foreground': 'oklch(0.1448 0 0)', // #1A1A1A

          // 阴影色
          shadow: 'oklch(0.0000 0 0 / 0.10)', // rgba(0, 0, 0, 0.10)
        },
        // 暗色模式
        dark: {
          // 背景色
          background: 'oklch(0.1448 0 0)', // #1A1A1A
          'background-secondary': 'oklch(0.1913 0 0)', // #262626
          'background-tertiary': 'oklch(0.2393 0 0)', // #333333

          // 前景色
          foreground: 'oklch(0.9288 0 0)', // #F0F0F0
          'foreground-secondary': 'oklch(0.7155 0 0)', // #B5B5B5
          'foreground-tertiary': 'oklch(0.5000 0 0)', // #808080

          // 卡片色
          card: 'oklch(0.1913 0 0)', // #262626
          'card-foreground': 'oklch(0.9288 0 0)', // #F0F0F0

          // 弹出层色
          popover: 'oklch(0.1913 0 0)', // #262626
          'popover-foreground': 'oklch(0.9288 0 0)', // #F0F0F0

          // 边框色
          border: 'oklch(0.2393 0 0)', // #333333
          'border-secondary': 'oklch(0.2873 0 0)', // #404040

          // 输入框色
          input: 'oklch(0.1913 0 0)', // #262626
          'input-foreground': 'oklch(0.9288 0 0)', // #F0F0F0

          // muted色
          muted: 'oklch(0.2393 0 0)', // #333333
          'muted-foreground': 'oklch(0.7155 0 0)', // #B5B5B5

          // 强调色
          accent: 'oklch(0.2393 0 0)', // #333333
          'accent-foreground': 'oklch(0.9288 0 0)', // #F0F0F0

          // 阴影色
          shadow: 'oklch(0.0000 0 0 / 0.30)', // rgba(0, 0, 0, 0.30)
        },
        // 图表色
        chart: {
          1: 'oklch(0.7054 0.0996 259.9657)', // 主色
          2: 'oklch(0.7251 0.1546 85.7487)', // 辅助色
          3: 'oklch(0.6471 0.2087 354.6036)', // 点缀色
          4: 'oklch(0.6471 0.1605 142.6303)', // 成功色
          5: 'oklch(0.6598 0.1986 64.3285)', // 警告色
          6: 'oklch(0.6368 0.2078 25.5645)', // 错误色
          7: 'oklch(0.6471 0.1355 194.7689)', // 信息色
        },
        // 侧边栏色
        sidebar: {
          DEFAULT: 'oklch(0.1913 0 0)', // #262626
          foreground: 'oklch(0.9288 0 0)', // #F0F0F0
          primary: 'oklch(0.7054 0.0996 259.9657)', // 主色
          'primary-foreground': 'oklch(0.1448 0 0)', // #1A1A1A
          accent: 'oklch(0.2393 0 0)', // #333333
          'accent-foreground': 'oklch(0.9288 0 0)', // #F0F0F0
          border: 'oklch(0.2393 0 0)', // #333333
          ring: 'oklch(0.7054 0.0996 259.9657)', // 主色
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      boxShadow: {
        '2xs': '0px 1px 2px 0px hsl(0 0% 0% / 0.05)',
        xs: '0px 1px 2px 0px hsl(0 0% 0% / 0.05)',
        sm: '0px 1px 2px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)',
        md: '0px 1px 2px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10)',
        lg: '0px 1px 2px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10)',
        xl: '0px 1px 2px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10)',
        '2xl': '0px 1px 2px 0px hsl(0 0% 0% / 0.25)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
      },
      transitionProperty: {
        color: 'color',
        bg: 'background-color',
        border: 'border-color',
        text: 'color, background-color, border-color',
        all: 'all',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        default: '300ms',
        fast: '150ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
};
