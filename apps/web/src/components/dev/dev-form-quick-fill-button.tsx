"use client";

import { Button } from "@al-infaaq/ui/button";
import { useState } from "react";

type DevFormQuickFillButtonProps = {
  onFill: () => void | Promise<void>;
};

export function DevFormQuickFillButton({
  onFill,
}: DevFormQuickFillButtonProps) {
  const [busy, setBusy] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onFill();
        } finally {
          setBusy(false);
        }
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      {busy ? "Filling..." : "Quick fill"}
    </Button>
  );
}
