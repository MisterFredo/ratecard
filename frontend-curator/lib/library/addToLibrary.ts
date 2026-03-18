import { apiUrl } from "@/lib/config";
import type { FeedItem } from "@/types/home";

export async function addToLibrary(item: FeedItem) {
  try {
    await fetch(apiUrl("/workspace/baskets/add"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
      }),
    });
  } catch (e) {
    console.error("❌ addToLibrary error", e);
  }
}
