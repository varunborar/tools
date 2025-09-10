export const dynamic = "force-static";

export default function robots() {
  const baseUrl = "https://thebigstudio.in";
  return {
    rules: [{ userAgent: "*" }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
