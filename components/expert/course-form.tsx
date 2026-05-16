"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Course } from "@/types/app";

const schema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().optional(),
  subject: z.string().optional(),
  thumbnail_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  price: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
  initial?: Partial<Course>;
  isPending: boolean;
}

export function CourseForm({ open, onClose, onSave, initial, isPending }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", subject: "", thumbnail_url: "", price: 0 },
  });

  useEffect(() => {
    form.reset({
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      subject: initial?.subject ?? "",
      thumbnail_url: initial?.thumbnail_url ?? "",
      price: initial?.price ?? 0,
    });
  }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Course" : "New Course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Course Title</Label>
            <Input {...form.register("title")} placeholder="e.g. Introduction to Calculus" />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea {...form.register("description")} rows={3} placeholder="What will students learn?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input {...form.register("subject")} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-1">
              <Label>Price (₹)</Label>
              <Input {...form.register("price")} type="number" min={0} placeholder="0 for free" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Thumbnail URL</Label>
            <Input {...form.register("thumbnail_url")} placeholder="https://…" />
            {form.formState.errors.thumbnail_url && (
              <p className="text-xs text-red-500">{form.formState.errors.thumbnail_url.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {initial?.id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
