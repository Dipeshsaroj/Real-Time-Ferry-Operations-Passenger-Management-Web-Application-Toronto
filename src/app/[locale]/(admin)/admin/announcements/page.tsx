'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Megaphone, Loader, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch announcements
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/announcements');
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return res.json();
    },
  });

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: async (newAnn: { title: string; body: string; language: string }) => {
      const res = await fetch('/api/v1/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnn),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create announcement');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Announcement published successfully!');
      setTitle('');
      setBody('');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'An error occurred.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete announcement');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Announcement deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'An error occurred.');
    },
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({ title, body, language });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const announcements = announcementsData?.announcements || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Create Form */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Announcements</h1>
          <p className="text-muted-foreground text-sm">Post updates and news visible to citizens on the public portal.</p>
        </div>

        <form onSubmit={handlePublish}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Publish Announcement
              </CardTitle>
              <CardDescription>Bilingual announcements are displayed on the public landing page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Language</label>
                <Select value={language} onValueChange={(val) => setLanguage(val || 'en')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (en)</SelectItem>
                    <SelectItem value="fr">Français (fr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Title</label>
                <Input
                  placeholder="e.g. Winter Ferry Schedules Announced"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Content</label>
                <Textarea
                  placeholder="Type the announcement details here..."
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t p-4">
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" /> Publish Announcement
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      {/* Right Column: List of past announcements */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Past Announcements</CardTitle>
            <CardDescription>Manage active notifications displayed on the home page.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading announcements...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-20 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                No announcements published yet.
              </div>
            ) : (
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="p-4 flex justify-between gap-4 items-start hover:bg-muted/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase">
                          {ann.language}
                        </span>
                        <span className="font-bold text-sm text-foreground">{ann.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                      <span className="text-[10px] text-muted-foreground block pt-1">
                        Published: {new Date(ann.publishedAt).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(ann.id, ann.title)}
                      title="Delete Announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
