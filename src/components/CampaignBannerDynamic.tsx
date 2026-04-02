"use client";

import dynamic from "next/dynamic";

const CampaignBanner = dynamic(() => import("@/components/CampaignBanner"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "3.75rem", width: "100%" }} aria-hidden />
  ),
});

export default function CampaignBannerDynamic() {
  return <CampaignBanner />;
}
