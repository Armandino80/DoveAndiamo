import { useEffect, useState } from "react";
import { createEmptyProgress, loadProgress, type Progress } from "@/lib/progress";

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => createEmptyProgress());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  return { progress, setProgress, hydrated };
}
