"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, BookOpen, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "./course-form";
import { ModuleEditor } from "./module-editor";
import {
  listExpertCourses,
  upsertCourse,
  deleteCourse,
  getCourseWithModules,
} from "@/services/courses";
import type { Course } from "@/types/app";

interface Props { expertId: string; }

export function CourseList({ expertId }: Props) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Course> | undefined>();
  const [builderCourse, setBuilderCourse] = useState<string | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", expertId],
    queryFn: () => listExpertCourses(expertId),
  });

  const { data: courseDetail } = useQuery({
    queryKey: ["course", builderCourse],
    queryFn: () => getCourseWithModules(builderCourse!),
    enabled: !!builderCourse,
  });

  const { mutateAsync: saveCourse, isPending: saving } = useMutation({
    mutationFn: (vals: Partial<Course>) =>
      upsertCourse({ ...editing, ...vals, expert_id: expertId } as Course),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", expertId] });
      setFormOpen(false);
      setEditing(undefined);
    },
  });

  const { mutate: togglePublish } = useMutation({
    mutationFn: (c: Course) =>
      upsertCourse({ ...c, is_published: !c.is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", expertId] }),
  });

  const { mutate: removeCourse } = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", expertId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>My Courses</h2>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{courses.length} courses</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Course
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No courses yet. Create your first course.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover overflow-hidden">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-36 object-cover"
                  />
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                        {course.title}
                      </p>
                      {course.subject && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{course.subject}</p>
                      )}
                    </div>
                    <Badge
                      style={{
                        background: course.is_published ? "oklch(0.6 0.17 145)" : "var(--muted)",
                        color: course.is_published ? "white" : "var(--muted-foreground)",
                        border: "none",
                        fontSize: "0.65rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    {course.price === 0 ? "Free" : `₹${course.price}`}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setBuilderCourse(course.id)}>
                      <BookOpen className="h-3 w-3 mr-1" /> Build
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title={course.is_published ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish(course)}
                    >
                      {course.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(course); setFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      onClick={() => { if (confirm("Delete this course?")) removeCourse(course.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CourseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        onSave={(vals) => saveCourse(vals).then(() => {})}
        initial={editing}
        isPending={saving}
      />

      {/* Course Builder Dialog */}
      <Dialog open={!!builderCourse} onOpenChange={(v) => !v && setBuilderCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Builder — {courseDetail?.title}</DialogTitle>
          </DialogHeader>
          {courseDetail ? (
            <ModuleEditor courseId={courseDetail.id} modules={courseDetail.modules} />
          ) : (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
