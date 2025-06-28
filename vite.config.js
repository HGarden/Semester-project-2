import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Only add variables to component files, not the main styles file
        additionalData: (content, filename) => {
          // Don't add variables to the main styles.scss file since it already imports them
          if (filename.includes('styles.scss')) {
            return content;
          }
          return `@use "src/scss/variables" as *;\n${content}`;
        }
      }
    }
  },
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'auctions.html',
        'profile.html',
        'login.html',
        'register.html',
        'create-listing.html',
        'listing.html'
           ]
    }
  }
});