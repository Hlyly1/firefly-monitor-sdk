import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Firefly Monitor SDK',
  description: '轻量级、高性能的前端监控解决方案',
  base: '/firefly-monitor-sdk/',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/concepts' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'Browser SDK', link: '/api/browser' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Hlyly1/firefly-monitor-sdk' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Firefly Monitor SDK'
    }
  }
})
