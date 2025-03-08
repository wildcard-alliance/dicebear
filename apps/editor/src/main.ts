import { createApp, defineAsyncComponent } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
import Loader from './Loader.vue';

import './assets/reset.scss';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';

// Add global styles to remove any dots/separators in tab headers
const style = document.createElement('style');
style.textContent = `
  .p-tabview .p-tabview-nav li::before,
  .p-tabview .p-tabview-nav li::after,
  .p-tabview .p-tabview-nav li .p-tabview-nav-link::before,
  .p-tabview .p-tabview-nav li .p-tabview-nav-link::after {
    display: none !important;
    content: none !important;
  }
`;
document.head.appendChild(style);

import PrimeVue from 'primevue/config';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ColorPicker from 'primevue/colorpicker';

const AsyncApp = defineAsyncComponent({
  loader: () => import('./App.vue'),
  loadingComponent: Loader,
});

const app = createApp(AsyncApp);

app.use(createPinia());
app.use(
  createI18n({
    legacy: false,
    locale: navigator.language.split('-')[0],
    fallbackLocale: 'en',
    messages,
  })
);
app.use(PrimeVue);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('ColorPicker', ColorPicker);

app.mount('#app');
