<script setup lang="ts">
import { onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useAuthStore } from './stores/auth'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#8b6dff',
    primaryColorHover: '#a08aff',
    primaryColorPressed: '#7357e6',
    primaryColorSuppl: '#8b6dff',
    infoColor: '#22d3ee',
    successColor: '#34d399',
    warningColor: '#fbbf24',
    errorColor: '#f87171',
    bodyColor: '#0a0a12',
    cardColor: '#14141f',
    modalColor: '#171725',
    popoverColor: '#1a1a2a',
    borderRadius: '10px',
    borderColor: 'rgba(255,255,255,0.09)',
    dividerColor: 'rgba(255,255,255,0.07)',
    inputColor: 'rgba(255,255,255,0.04)',
    tableColor: 'transparent',
    fontFamily:
      '-apple-system, "SF Pro SC", "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", system-ui, sans-serif',
  },
  Card: { color: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
  DataTable: {
    thColor: 'rgba(255,255,255,0.03)',
    tdColor: 'transparent',
    tdColorHover: 'rgba(139,109,255,0.06)',
  },
}

const auth = useAuthStore()
onMounted(() => auth.refresh())
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-dialog-provider>
      <n-message-provider placement="top">
        <router-view />
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
