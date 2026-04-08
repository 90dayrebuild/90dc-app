import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env so VITE_* vars are available during build
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root:      '.',
    publicDir: 'public',

    build: {
      outDir:          'dist',
      sourcemap:       false,   // no sourcemaps in production
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          // Named chunks for better caching — supabase rarely changes
          manualChunks(id) {
            if (id.includes('@supabase/supabase-js') || id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
            if (id.includes('src/modules/community/')) return 'community';
            if (id.includes('src/modules/admin/'))     return 'admin';
          }
        }
      }
    },

    // import.meta.env.VITE_* is the correct pattern — no need for define{}
    // Keeping define only for non-VITE_ vars if needed in future
  };
});
