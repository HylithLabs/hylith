"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { STATIC_ADMIN_STALE_TIME_MS } from "@/lib/query/config";
import { queryKeys } from "@/lib/query/keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Recipient = {
  id: string;
  email: string;
  created_at: string;
};

async function fetchRecipients(): Promise<Recipient[]> {
  const res = await fetch("/api/admin/notification-recipients");
  if (!res.ok) throw new Error("Failed to load recipients");
  const data = await res.json();
  return data.recipients ?? [];
}

export function AdminWhomToSend() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: recipients = [], isLoading, error } = useQuery({
    queryKey: queryKeys.notificationRecipients,
    queryFn: fetchRecipients,
    staleTime: STATIC_ADMIN_STALE_TIME_MS,
  });

  const addMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/admin/notification-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to add email");
    },
    onSuccess: () => {
      setEmail("");
      setFormError(null);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationRecipients,
      });
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/admin/notification-recipients?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notificationRecipients,
      });
    },
  });

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      addMutation.mutate(email.trim());
    },
    [addMutation, email],
  );

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Whom to Send
        </CardTitle>
        <CardDescription>
          Notification emails are sent to every address listed here when a client
          submits a meeting request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="Add email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="sm:flex-1"
          />
          <Button type="submit" disabled={addMutation.isPending}>
            {addMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add
          </Button>
        </form>

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            Failed to load recipients
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No notification emails yet. Add at least one address.
                    </TableCell>
                  </TableRow>
                ) : (
                  recipients.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-sm">{row.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${row.email}`}
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
