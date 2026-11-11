// The app's bundler (Vite) provides import.meta.env; this package has no Vite types.
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}
