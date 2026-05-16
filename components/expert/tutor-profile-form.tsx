"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTutorProfile, upsertTutorProfile } from "@/services/tutors";
import type { AuthUser } from "@/types/app";

interface Props { user: AuthUser; }

export function TutorProfileForm({ user }: Props) {
  const qc = useQueryClient();
  const [headline, setHeadline] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [yearsExp, setYearsExp] = useState(0);
  const [qualifications, setQualifications] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [isPublic, setIsPublic] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newLang, setNewLang] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["tutorProfile", user.id],
    queryFn: () => getTutorProfile(user.id),
  });

  useEffect(() => {
    if (profile) {
      setHeadline(profile.profile_headline ?? "");
      setPhotoUrl(profile.profile_photo_url ?? "");
      setHourlyRate(profile.hourly_rate);
      setYearsExp(profile.years_experience);
      setQualifications(profile.qualifications ?? "");
      setSubjects(profile.subjects);
      setLanguages(profile.languages.length ? profile.languages : ["English"]);
      setIsPublic(profile.is_public);
    }
  }, [profile]);

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () =>
      upsertTutorProfile(user.id, {
        profile_headline: headline,
        profile_photo_url: photoUrl || null,
        hourly_rate: hourlyRate,
        years_experience: yearsExp,
        qualifications,
        subjects,
        languages,
        is_public: isPublic,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tutorProfile", user.id] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  const addTag = (list: string[], setList: (v: string[]) => void, val: string) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
  };
  const removeTag = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.filter((x) => x !== val));

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Photo preview */}
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {user.profile?.full_name?.slice(0, 2).toUpperCase() ?? "TU"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 space-y-1">
              <Label>Profile Photo URL</Label>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Headline</Label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Expert Math Tutor | 5 Years Experience" />
          </div>

          <div className="space-y-1">
            <Label>Qualifications / Bio</Label>
            <Textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} rows={3} placeholder="Your background and teaching style…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Hourly Rate (₹)</Label>
              <Input type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Years of Experience</Label>
              <Input type="number" min={0} value={yearsExp} onChange={(e) => setYearsExp(Number(e.target.value))} />
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex flex-wrap gap-2 mb-1">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  style={{ background: "oklch(0.55 0.22 264 / 0.15)", color: "var(--primary)" }}
                >
                  {s}
                  <button type="button" onClick={() => removeTag(subjects, setSubjects, s)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add subject"
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(subjects, setSubjects, newSubject);
                    setNewSubject("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { addTag(subjects, setSubjects, newSubject); setNewSubject(""); }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2 mb-1">
              {languages.map((l) => (
                <span
                  key={l}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}
                >
                  {l}
                  <button type="button" onClick={() => removeTag(languages, setLanguages, l)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                placeholder="Add language"
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(languages, setLanguages, newLang);
                    setNewLang("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { addTag(languages, setLanguages, newLang); setNewLang(""); }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={isPublic} onCheckedChange={setIsPublic} id="public" />
            <Label htmlFor="public">Make profile public (visible to students)</Label>
          </div>

          <Button onClick={() => save()} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
