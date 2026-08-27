import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "МОНГОЛ МАХ",
    short_name: "МАХ",
    description: "Шинэ, чанартай махыг гэрт тань хүргэнэ.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#c8102e",
  };
}
