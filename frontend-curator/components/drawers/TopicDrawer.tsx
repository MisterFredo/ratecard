"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

import EntityDrawer from "@/components/drawers/EntityDrawer";
import DrawerHeader from "@/components/drawers/DrawerHeader";
import FeedGroupedByMonth from "@/components/feed/FeedGroupedByMonth";

import NumbersBlock from "@/components/drawers/blocks/NumbersBlock";
import RadarBlock from "@/components/drawers/blocks/RadarBlock";

import { useDrawer } from "@/contexts/DrawerContext";

/* ========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
};

type TopicData = {
  id_topic: string;

  label?: string;
  topic_axis?: string;

  nb_analyses?: number;
  delta_30d?: number;

  items?: FeedItem[];
};

/* ========================================================= */

export default function TopicDrawer({ id, onClose }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { leftDrawer, openRightDrawer, closeLeftDrawer } = useDrawer();

  const [data, setData] = useState<TopicData | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [radar, setRadar] = useState<any>(null);

  function close() {
    onClose?.();
    closeLeftDrawer();

    if (
      leftDrawer.mode === "route" &&
      pathname.startsWith("/topics")
    ) {
      router.push("/topics", { scroll: false });
    }
  }

  /* LOAD DATA */
  useEffect(() => {
    async function load() {
      const res = await api.get(`/topic/${id}/view`);
      setData(res);
      setItems(res.items ?? []);
    }

    load();
  }, [id]);

  /* LOAD RADAR */
  useEffect(() => {
    async function loadRadar() {
      const res = await api.get(
        `/radar/latest?entity_type=topic&entity_id=${id}`
      );
      setRadar(res?.insight ?? null);
    }

    loadRadar();
  }, [id]);

  /* LOAD NUMBERS */
  useEffect(() => {
    async function loadNumbers() {
      const res = await api.get(
        `/numbers/entity?entity_type=topic&entity_id=${id}&limit=4`
      );
      setNumbers(res.items ?? []);
    }

    loadNumbers();
  }, [id]);

  if (!data) return null;

  return (
    <EntityDrawer
      onClose={close}
      header={
        <DrawerHeader
          title={data.label || "Topic"}
          subtitle={data.topic_axis}
          variant="topic"
          nbAnalyses={data.nb_analyses}
          delta30d={data.delta_30d}
          onClose={close}
        />
      }
    >
      <NumbersBlock
        numbers={numbers}
        entityId={id}
        entityType="topic"
      />

      <RadarBlock radar={radar} />

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase text-gray-400">
          Contenus liés
        </h2>

        <FeedGroupedByMonth
          items={items}
          onClickItem={(item) =>
            openRightDrawer(
              item.type === "news" ? "news" : "analysis",
              item.id,
              "silent"
            )
          }
        />
      </section>
    </EntityDrawer>
  );
}
