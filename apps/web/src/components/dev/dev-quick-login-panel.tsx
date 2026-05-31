"use client";

import { Button } from "@al-infaaq/ui/button";
import { DEV_AUTH_ACCOUNTS } from "./quick-fill";

type DevQuickLoginPanelProps = {
  onLogin: (values: {
    email: string;
    password: string;
  }) => void | Promise<void>;
};

export function DevQuickLoginPanel({ onLogin }: DevQuickLoginPanelProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
        Quick login
      </p>
      <div className="mt-3 grid gap-2">
        {DEV_AUTH_ACCOUNTS.map((account) => (
          <Button
            className="h-auto justify-start px-3 py-2 text-left"
            key={account.email}
            onClick={() =>
              onLogin({
                email: account.email,
                password: account.password,
              })
            }
            type="button"
            variant="outline"
          >
            <span>
              <span className="block text-sm font-medium">{account.label}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {account.email}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
