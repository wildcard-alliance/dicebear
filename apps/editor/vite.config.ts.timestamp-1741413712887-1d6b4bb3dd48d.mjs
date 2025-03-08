// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";
import { defineConfig } from "file:///Users/paulbettner/Projects/smarty-pants/packages/dicebear/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/paulbettner/Projects/smarty-pants/packages/dicebear/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueI18nPlugin from "file:///Users/paulbettner/Projects/smarty-pants/packages/dicebear/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///Users/paulbettner/Projects/smarty-pants/packages/dicebear/apps/editor/vite.config.ts";
var commitHash = (process.env.GIT_REV ?? execSync("git rev-parse --short HEAD").toString()).slice(0, 7);
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: "./src/messages/*.json",
      strictMessage: false
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  define: {
    __dicebearEditorVersion: JSON.stringify(
      `${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}-${commitHash}`
    )
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vue": ["vue", "vue-i18n", "pinia"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcGF1bGJldHRuZXIvUHJvamVjdHMvc21hcnR5LXBhbnRzL3BhY2thZ2VzL2RpY2ViZWFyL2FwcHMvZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcGF1bGJldHRuZXIvUHJvamVjdHMvc21hcnR5LXBhbnRzL3BhY2thZ2VzL2RpY2ViZWFyL2FwcHMvZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wYXVsYmV0dG5lci9Qcm9qZWN0cy9zbWFydHktcGFudHMvcGFja2FnZXMvZGljZWJlYXIvYXBwcy9lZGl0b3Ivdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IFZ1ZUkxOG5QbHVnaW4gZnJvbSAnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZSc7XG5cbmNvbnN0IGNvbW1pdEhhc2ggPSAoXG4gIHByb2Nlc3MuZW52LkdJVF9SRVYgPz8gZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEJykudG9TdHJpbmcoKVxuKS5zbGljZSgwLCA3KTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBWdWVJMThuUGx1Z2luKHtcbiAgICAgIGluY2x1ZGU6ICcuL3NyYy9tZXNzYWdlcy8qLmpzb24nLFxuICAgICAgc3RyaWN0TWVzc2FnZTogZmFsc2UsXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgX19kaWNlYmVhckVkaXRvclZlcnNpb246IEpTT04uc3RyaW5naWZ5KFxuICAgICAgYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19LSR7Y29tbWl0SGFzaH1gLFxuICAgICksXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAndnVlJzogWyd2dWUnLCAndnVlLWkxOG4nLCAncGluaWEnXSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9ZLFNBQVMsZUFBZSxXQUFXO0FBQ3ZhLFNBQVMsZ0JBQWdCO0FBRXpCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLG1CQUFtQjtBQUwwTixJQUFNLDJDQUEyQztBQU9yUyxJQUFNLGNBQ0osUUFBUSxJQUFJLFdBQVcsU0FBUyw0QkFBNEIsRUFBRSxTQUFTLEdBQ3ZFLE1BQU0sR0FBRyxDQUFDO0FBR1osSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLE1BQ1QsZUFBZTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04seUJBQXlCLEtBQUs7QUFBQSxNQUM1QixJQUFHLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksVUFBVTtBQUFBLElBQ3pEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osT0FBTyxDQUFDLE9BQU8sWUFBWSxPQUFPO0FBQUEsUUFDcEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
