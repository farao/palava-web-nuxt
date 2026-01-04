<template>
  <main class="home">
    <header>
      <LanguageSwitcher />
    </header>

    <form
      class="signpost"
      v-if="browserCanUseWebRTC"
      @submit.prevent="goIntoRoom"
    >
      <div class="logo">
        <NuxtLink
          to="/info/about"
          :title="t('home.palavaLogoTitle')"
        >
          <PalavaIcon
            :aria-label="t('palavaLogoAlt')"
            role="img"
          />
        </NuxtLink>
      </div>

      <div class="room-selection">
        <input
          v-model="roomId"
          :placeholder="t('home.roomIdPlaceholder')"
          ref="roomInput"
          maxlength="50"
          type="text"
        >
        <button
          type="submit"
          :title="t('home.goTitle')"
        >
          <SubmitIcon
            :aria-label="t('home.goAlt')"
            role="img"
          />
        </button>
      </div>

      <div class="hidden-room">
        {{ t('home.hiddenRoomIntro') }}
        <a
          href="/"
          @click.prevent="goIntoHiddenRoom"
          :title="t('home.hiddenRoomTitle')"
        >
          {{ t("home.hiddenRoom") }}
        </a>
      </div>
    </form>

    <div
      class="signpost"
      v-else
    >
      <div class="logo">
        <NuxtLink
          to="/info/about"
          :title="t('home.palavaLogoTitle')"
        >
          <PalavaIcon
            :aria-label="t('palavaLogoAlt')"
            role="img"
          />
        </NuxtLink>
      </div>

      <div
        class="no-support"
        v-html="t('home.noSupportMessage')"
      />
    </div>

    <footer>
      <nav class="footer-social">
        <ul>
          <li>
            <a
              href="https://github.com/palavatv/palava"
              :title="t('home.github')"
            >
              <LogoGithubIcon
                :aria-label="t('home.github')"
                role="img"
              />
            </a>
          </li>
          <li>
            <a
              href="https://social.tchncs.de/@palavatv"
              :title="t('home.mastodon')"
            >
              <LogoMastodonIcon
                :aria-label="t('home.mastodon')"
                role="img"
              />
            </a>
          </li>
        </ul>
      </nav>

      <nav class="footer-navigation">
        <ul>
          <li
            v-for="infoPage in infoPages"
            :key="infoPage.id"
          >
            <NuxtLink :to="`/info/${infoPage.id}`">
              {{ infoPage.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </footer>
  </main>
</template>

<script setup lang="ts">
import PalavaIcon from '~/assets/icons/palava.svg'
import SubmitIcon from '~/assets/icons/people-outline.svg'
import LogoGithubIcon from '~/assets/icons/logo-github.svg'
import LogoMastodonIcon from '~/assets/icons/logo-mastodon.svg'

const { t, tm, rt } = useI18n()
const router = useRouter()
const route = useRoute()
const { checkWebRTCSupport } = useWebRTC()

const roomInput = ref<HTMLInputElement | null>(null)
const roomId = ref('')

// Get info pages for current locale (i18n already handles the locale)
const infoPages = computed(() => {
  const pages = tm('infoPages')
  return pages
    .map(p => ({
      ...p,
      id: rt(p.id),
      title: rt(p.title),
      content: rt(p.content),
    }))
    .filter(p => p.linked !== false)
})

// Check if browser supports WebRTC and query param
const browserCanUseWebRTC = computed(() => {
  return checkWebRTCSupport() && route.query.supported !== '0'
})

onMounted(() => {
  roomInput.value?.focus()
})

const goIntoRoom = () => {
  if (roomId.value) {
    router.push(`/${encodeURIComponent(roomId.value.toLowerCase())}`)
  } else {
    goIntoHiddenRoom()
  }
}

const goIntoHiddenRoom = () => {
  const randomId = crypto.randomUUID().slice(0, 8)
  router.push(`/${randomId}`)
}
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles.scss" as *;

.home {
  /* Layout */
  min-height: 100%;
  display: flex;
  flex-direction: column;

  /* Typography */
  color: $shade;

  .signpost {
    /* Box model */
    width: 90vw;
    margin: auto;
    margin-top: -$medium-plus-spacing; // language-switch

    /* Layout */
    display: flex;
    flex-direction: column;

    /* Responsive */
    @media (min-width: $mobile) {
      width: 450px;
    }
    @media (min-height: $mobile-height) {
      margin-top: 13vh;
    }
    > * {
      margin: 1vh auto;
      width: 100%;
      text-align: center;
    }
  }

  .logo {
    /* Box model */
    margin-bottom: 3vh;

    /* SVG styles */
    svg {
      /* Sizing */
      width: 30vw;
      height: 30vw;

      /* Visual */
      border-radius: 50%;
      box-shadow: 0px 0px 4px $action-1;

      /* Responsive */
      @media (min-width: $mobile-plus) {
        width: 250px;
        height: 250px;
      }
    }

    /* Link styles */
    a {
      display: inline-block;
    }
  }

  .room-selection {
    /* Box model */
    padding: 0;
    padding-right: 1px;

    /* Layout */
    display: flex;

    /* Visual */
    @include lightShadow();

    /* Input and button styles */
    input, button {
      /* Box model */
      padding: 4px 8px;
      margin: 0;
      border: none;

      /* Typography */
      @include homeFont();
      letter-spacing: -1px;
    }

    /* Input styles */
    input {
      /* Layout */
      flex: 1;

      /* Visual */
      background: white;

      /* States */
      &:focus, &:active {
        outline: none;
      }
    }

    /* Placeholder styles */
    &::placeholder {
      letter-spacing: -1px;
      color: #999;
    }

    /* Submit button styles */
    button[type=submit] {
      /* Box model */
      appearance: none;
      margin-right: -1px;

      /* Layout */
      flex-shrink: 0;

      /* Visual */
      background: $white;
      cursor: pointer;

      /* Include home symbol */
      @include homeSymbol();

      /* States */
      &:focus {
        outline: 1px dashed $action-2;
      }

      /* SVG icon */
      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  .hidden-room {
    /* Typography */
    @include homeFont();
    white-space: nowrap;

    /* Link styles */
    a {
      color: $action-2;
    }
  }

  header {
    flex-basis: content;
    padding: $small-plus-spacing $small-spacing;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-start;

    .language-switcher {
      margin-right: $small-spacing;
    }
  }

  footer {
    flex-basis: content;
    padding: $small-plus-spacing $small-spacing;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer-social {
    ul {
      display: flex;
      flex-direction: row;
    }

    li {
      margin: $tiny-spacing $small-plus-spacing $tiny-spacing $tiny-spacing;
      transform: translateY($small-spacing);
    }

    svg {
      width: $home-social-size;
      height: $home-social-size;
      fill: $gray;
      &:hover {
        fill: $action-2;
      }
    }
  }

  .footer-navigation {
    ul {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }

    li {
      margin: auto $small-spacing;
      @include footerFont();
    }
  }
}
</style>
