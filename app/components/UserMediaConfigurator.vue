<template>
  <InfoLayout class="gum">
    <h1
      class="info-title gum-title"
      v-html="t('room.gumHeading')"
    />
    <div class="info-content">
      <p>
        <NuxtLink to="/info/about">
          {{ t('room.aboutPalava') }}
        </NuxtLink>
      </p>
      <p v-html="t('room.gumIntro')" />

      <div class="gum-options">
        <div class="gum-name">
          <input
            v-model="userName"
            type="text"
            :placeholder="t('room.gumNamePlaceholder')"
            maxlength="30"
          >
        </div>

        <div class="gum-sounds">
          <label>
            <input
              v-model="soundsEnabled"
              type="checkbox"
            >
            {{ t('room.gumSoundsEnabled') }}
          </label>
        </div>
      </div>

      <p v-html="t('room.gumChooseMedia')" />

      <ul class="gum-buttons">
        <li class="gum-choice gum-choice--video-and-audio">
          <button
            type="button"
            autofocus
            :title="t('room.gumChoiceVideoAndAudio')"
            @click="emit('joinRoom', { userMediaConfig: { video: videoConstraints, audio: true }, name: userName, soundsEnabled })"
          >
            <VideoCameraIcon
              :aria-label="t('party.cameraAlt')"
              role="img"
            />
            <MicIcon
              :aria-label="t('party.microphoneAlt')"
              role="img"
            />
          </button>
        </li>

        <li class="gum-choice gum-choice--video">
          <button
            type="button"
            :title="t('room.gumChoiceVideo')"
            @click="emit('joinRoom', { userMediaConfig: { video: videoConstraints, audio: false }, name: userName, soundsEnabled })"
          >
            <VideoCameraIcon
              :aria-label="t('party.cameraAlt')"
              role="img"
            />
          </button>
        </li>

        <li class="gum-choice gum-choice--audio">
          <button
            type="button"
            :title="t('room.gumChoiceAudio')"
            @click="emit('joinRoom', { userMediaConfig: { video: false, audio: true }, name: userName, soundsEnabled })"
          >
            <MicIcon
              :aria-label="t('party.microphoneAlt')"
              role="img"
            />
          </button>
        </li>
      </ul>

      <div
        v-if="error"
        class="gum-error"
      >
        <h2 v-html="t('room.gumErrorHeading')" />
        <p v-html="t('room.gumErrorReasons')" />
      </div>
    </div>
  </InfoLayout>
</template>

<script setup lang="ts">
import VideoCameraIcon from '~/assets/icons/video-camera.svg'
import MicIcon from '~/assets/icons/mic.svg'

const { t } = useI18n()
const config = usePalavaConfig()

defineProps<{
  error?: string | null
}>()

const emit = defineEmits<{
  joinRoom: [config: { userMediaConfig: { video: any, audio: boolean }, name: string, soundsEnabled: boolean }]
}>()

const userName = ref('')
const soundsEnabled = ref(true)
const videoConstraints = computed(() => config.gumVideoConstraints)
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles" as *;

/* Component-specific styles only */
.gum :deep(.info-page) {
  /* Box model */
  padding-top: $medium-spacing;

  /* Typography */
  h1 {
    text-transform: none;
    margin: 0;
    line-height: 130%;
  }

  .gum-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $small-spacing;
    margin: $large-plus-spacing 0 $medium-spacing;

    @media (min-width: $mobile) {
      flex-direction: row;
      justify-content: center;
      gap: $medium-spacing;
    }
  }

  .gum-name {
    flex: 0 1 auto;

    input {
      width: 30ch;
      max-width: 100%;
      padding: $small-spacing $medium-spacing;
      border: 1px solid $gray;
      border-radius: 4px;
      font-size: 16px;
      line-height: 24px;

      &:focus {
        outline: none;
        border-color: $action-1;
      }

      &::placeholder {
        color: $shade;
      }
    }
  }

  .gum-sounds {
    flex-shrink: 0;

    label {
      display: flex;
      align-items: center;
      gap: $small-spacing;
      cursor: pointer;
      font-size: 14px;
      color: $action-1;

      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        cursor: pointer;
        
        border: 2px solid $action-1;
        border-radius: 3px;
        background-color: white;
        
        &:checked {
          background-color: $action-1;
          
          &::after {
            content: '';
            display: block;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            margin: 1px auto;
          }
        }
        
        &:focus {
          outline: 2px solid $action-2;
          outline-offset: 1px;
        }
      }
    }
  }

  .gum-buttons {
    /* Box model */
    margin-top: $medium-spacing;
    margin-bottom: -$medium-spacing;
    padding-left: 0;

    /* Layout */
    display: flex;
    justify-content: space-between;

    /* List styling */
    list-style: none;

    /* Responsive styles */
    @media (min-width: $mobile) {
      margin-top: $medium-plus-spacing;
      justify-content: space-around;
    }

    .gum-choice {
      svg {
        @include size($gum-choice-size);
      }
      @media (min-width: $mobile) {
        svg {
          @include size($gum-choice-mobile-size);
        }
      }

      &--video-and-audio { order: 2; }
      &--video { order: 1; }
      &--audio { order: 3; }
    }

    button {
      // Layout and box model
      width: 100%;
      padding: $small-spacing $medium-spacing;
      margin-bottom: $medium-spacing;

      // Typography
      text-align: center;
      font-size: 12px;
      line-height: 16px;

      // Interactive
      cursor: pointer;

      // Responsive typography
      @media (min-width: $mobile) {
        font-size: 13px;
        line-height: 18px;
      }
      @media (min-width: $mobile-plus) {
        font-size: 14px;
        line-height: 20px;
      }
      @media (min-width: $desktop) {
        font-size: 15px;
        line-height: 21px;
      }
      @media (min-width: $desktop-plus) {
        font-size: 16px;
        line-height: 22px;
      }
      @media (min-width: $desktop-large) {
        font-size: 17px;
        line-height: 23px;
      }
      @media (min-width: $desktop-huge) {
        font-size: 18px;
        line-height: 24px;
      }
      
      &:hover {
        svg {
          fill: $action-2;
        }
      }
    }
  }

  .gum-error {
    margin-top: $medium-spacing;

    h2 {
      color: $action-3;
      margin-bottom: $small-spacing;
    }

    ul {
      margin-top: $tiny-spacing;
    }

    li {
      list-style: circle;
      margin-left: 18px;
    }
  }
}
</style>
