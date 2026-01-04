<template>
  <InfoLayout class="room-error">
    <div v-if="error === 'room_full'">
      <h1>{{ t('room.errorFullHeading') }}</h1>
      <p>{{ t('room.errorFullDescription') }}</p>
      <p><a href="#" @click.prevent="reloadPage">{{ t('room.errorFullTryAgain') }}</a></p>
    </div>
    <div v-else-if="error === 'maintenance'">
      <h1>{{ t('room.errorMaintenanceHeading') }}</h1>
      <p>{{ t('room.errorMaintenanceDescription') }}</p>
      <p><a href="#" @click.prevent="reloadPage">{{ t('room.errorMaintenanceTryAgain') }}</a></p>
    </div>
    <div v-else>
      <h1>{{ t('room.errorConnectionHeading') }}</h1>
      <p>{{ t('room.errorConnectionDescription') }}</p>
      <p><a href="#" @click.prevent="reloadPage">{{ t('room.errorConnectionTryAgain') }}</a></p>
    </div>
  </InfoLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  error?: string | null
}>()

const reloadPage = () => {
  if (process.client) {
    window.location.reload()
  }
}
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles.scss" as *;

/* Component-specific styles only */
.room-error :deep(.info-page) {
  padding-top: $medium-spacing;
  
  h1 {
    text-transform: none;
    margin: 0;
    line-height: 130%;
    color: $action-3;
  }
}
</style>
