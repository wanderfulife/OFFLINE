import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
	plugins: [vue()],
	build: {
		chunkSizeWarningLimit: 1600,
	},
	publicDir: 'public',
	server: {
		host: true // Allow access from other devices on the network
	},
	define: {
		'process.env': {}
	}
});
