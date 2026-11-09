"use client";

import { Toast } from "@base-ui/react/toast";
import X from "lucide-react/icons/x";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider limit={3} timeout={4000}>
      {children}
      <Toaster />
    </Toast.Provider>
  );
}

function Toaster() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed right-0 bottom-0 z-50 flex w-full max-w-[420px] flex-col gap-2 p-4">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className="relative rounded-md border bg-background p-6 pr-10 shadow-lg data-limited:hidden"
          >
            <Toast.Content>
              <Toast.Title className="text-sm font-semibold" />
              <Toast.Description className="mt-1 text-sm text-muted-foreground" />
              <Toast.Close
                aria-label="Dismiss notification"
                className="absolute top-2 right-2 rounded p-1 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </Toast.Close>
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
