import type { Metadata } from "next";
import { ZeroOneLanding } from "./components/Landingpage/zero-one/ZeroOneLanding";

export const metadata: Metadata = {
  title: "Zero One Hack · 36-hour AI hackathon · Vienna, May 2026",
  description:
    "36 hours of real model training, not prompt engineering. May 29–31, 2026 at AI:AT Factory, Vienna.",
  openGraph: {
    title: "Zero One Hack",
    description:
      "Vienna's supercompute AI hackathon. Fine-tune on A100s, pre-train on Leonardo, deploy a real model.",
  },
};

export default function Home() {
  return <ZeroOneLanding />;
}
