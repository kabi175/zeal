"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getStudentAssessments,
  getStudentSessions,
  getDashboardStats,
} from "@/services/student";

export function useStudentAssessments(userId: string) {
  return useQuery({
    queryKey: ["assessments", userId],
    queryFn: () => getStudentAssessments(userId),
    enabled: !!userId,
  });
}

export function useStudentSessions(userId: string) {
  return useQuery({
    queryKey: ["sessions", userId],
    queryFn: () => getStudentSessions(userId),
    enabled: !!userId,
    refetchInterval: 30_000,
  });
}

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: ["dashboardStats", userId],
    queryFn: () => getDashboardStats(userId),
    enabled: !!userId,
  });
}
