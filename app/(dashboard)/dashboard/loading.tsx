import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" />
      Loading dashboard...
    </div>
  );
}
