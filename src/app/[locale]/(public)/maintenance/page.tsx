'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, Clock, AlertTriangle, User, Loader, PlusCircle } from 'lucide-react';
import { AnalyticsTrigger } from '../_components/analytics-trigger';
import { toast } from 'sonner';

export default function MaintenancePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('Maintenance');
  const tc = useTranslations('Common');
  const queryClient = useQueryClient();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch reported requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      const res = await fetch('/api/v1/maintenance');
      return res.json();
    },
  });

  const requests = requestsData?.requests || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !facilityType || !facilityName) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          facilityType,
          facilityName,
          reportedBy,
        }),
      });

      if (res.ok) {
        toast.success(t('successMsg'));
        setTitle('');
        setDescription('');
        setFacilityType('');
        setFacilityName('');
        setReportedBy('');
        queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      } else {
        const err = await res.json();
        toast.error(err.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 gap-1 font-bold">
            <Clock className="h-3 w-3" />
            {t('pending')}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 gap-1 font-bold">
            <Wrench className="h-3 w-3" />
            {t('accepted')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 gap-1 font-bold">
            <CheckCircle className="h-3 w-3" />
            {t('completed')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFacilityBadge = (type: string) => {
    switch (type) {
      case 'ferry':
        return <Badge variant="secondary">{t('ferry')}</Badge>;
      case 'terminal':
        return <Badge variant="secondary">{t('terminal')}</Badge>;
      case 'park':
        return <Badge variant="secondary">{t('park')}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="container py-12 space-y-8">
      <AnalyticsTrigger eventName="maintenance_portal_view" />

      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{t('title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-primary">{t('reportedIssues')}</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading service requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
              {t('noRequests')}
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getFacilityBadge(request.facilityType)}
                          <span className="text-xs font-semibold text-muted-foreground">
                            • {request.facilityName}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-bold mt-1 text-primary">{request.title}</CardTitle>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-3 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{request.description}</p>
                  </CardContent>
                  <CardFooter className="px-5 py-3 bg-muted/20 border-t flex flex-wrap justify-between items-center text-xs text-muted-foreground gap-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>Reported by: <strong className="font-semibold text-foreground/80">{request.reportedBy}</strong></span>
                    </div>
                    <div>
                      {request.status === 'accepted' && request.acceptedBy && (
                        <span>
                          Assigned Mechanic: <strong className="font-semibold text-primary">{request.acceptedBy.name}</strong>
                        </span>
                      )}
                      {request.status === 'completed' && (
                        <span className="text-green-600 font-semibold">
                          Resolved
                        </span>
                      )}
                      {request.status === 'pending' && (
                        <span>{t('dateReported')}: {new Date(request.createdAt).toLocaleDateString(locale)}</span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Report Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-2">
            <form onSubmit={handleSubmit}>
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  {t('reportIssue')}
                </CardTitle>
                <CardDescription>Submit park or ferry maintenance requirements.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t('issueTitle')} *</label>
                  <Input
                    placeholder="Brief summary of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Facility Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t('facilityType')} *</label>
                  <Select value={facilityType} onValueChange={(val) => setFacilityType(val || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectFacilityType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ferry">{t('ferry')}</SelectItem>
                      <SelectItem value="terminal">{t('terminal')}</SelectItem>
                      <SelectItem value="park">{t('park')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Facility Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t('facilityName')} *</label>
                  <Input
                    placeholder="e.g. Centre Island, Sam McBride Ferry"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t('description')} *</label>
                  <Textarea
                    placeholder="Provide details about the issue (location, safety risks, damage details...)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Reporter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t('reportedBy')}</label>
                  <Input
                    placeholder="Enter email or name"
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-5 border-t justify-end bg-muted/10">
                <Button type="submit" disabled={submitting} className="w-full font-bold">
                  {submitting ? 'Submitting...' : t('submit')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
