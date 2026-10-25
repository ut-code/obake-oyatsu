import { defineConfig } from "vite";

// GitHub Pages ではリポジトリ名のサブパスで配信されるため、base を合わせる。そうしないとアセットが 404 になる
export default defineConfig({
  base: "/obake-oyatsu/",
});
