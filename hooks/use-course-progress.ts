import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEnrollmentWithProgress,
  enrollStudent,
  markLessonComplete,
  getStudentEnrollments,
} from "@/services/enrollments";

export function useEnrollments(studentId: string) {
  return useQuery({
    queryKey: ["enrollments", studentId],
    queryFn: () => getStudentEnrollments(studentId),
    enabled: !!studentId,
  });
}

export function useCourseProgress(studentId: string, courseId: string) {
  return useQuery({
    queryKey: ["enrollment", studentId, courseId],
    queryFn: () => getEnrollmentWithProgress(studentId, courseId),
    enabled: !!studentId && !!courseId,
  });
}

export function useEnrollMutation(studentId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => enrollStudent(studentId, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments", studentId] });
      qc.invalidateQueries({ queryKey: ["enrollment", studentId, courseId] });
    },
  });
}

export function useMarkLessonComplete(studentId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => markLessonComplete(studentId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollment", studentId, courseId] });
      qc.invalidateQueries({ queryKey: ["certificates", studentId] });
    },
  });
}
