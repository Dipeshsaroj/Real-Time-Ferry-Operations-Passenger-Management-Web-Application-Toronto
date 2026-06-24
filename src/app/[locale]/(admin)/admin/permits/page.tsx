'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Ban, Check, Loader, User, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPermitsPage() {
  const queryClient = useQueryClient();
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Fetch all permits
  const { data: permitsData, isLoading } = useQuery({
    queryKey: ['admin-permits'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/permits');
      return res.json();
    },
  });

  const handleReviewPermit = async (id: string, decision: 'approved' | 'denied') => {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/v1/admin/permits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update permit status');
      }

      toast.success(`Permit application successfully ${decision}!`);
      queryClient.invalidateQueries({ queryKey: ['admin-permits'] });
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setReviewingId(null);
    }
  };

  const permits = permitsData?.permits || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Facility Permits Review</h1>
        <p className="text-muted-foreground text-sm">Review, approve, or deny facility bookings and park activity requests from citizens.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading permit applications...</span>
            </div>
          ) : permits.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No permit applications registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Citizen / Applicant</TableHead>
                    <TableHead>Target Facility</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permits.map((permit: any) => {
                    const isPending = permit.status === 'pending';
                    const isReviewing = reviewingId === permit.id;
                    
                    return (
                      <TableRow key={permit.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">{permit.user.name}</div>
                              <div className="text-[10px] text-muted-foreground">{permit.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {permit.facility}
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(permit.dateRangeStart).toLocaleDateString([], { dateStyle: 'short' })} - {new Date(permit.dateRangeEnd).toLocaleDateString([], { dateStyle: 'short' })}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={permit.purpose}>
                          {permit.purpose}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              permit.status === 'approved' ? 'default' :
                              permit.status === 'denied' ? 'destructive' : 'outline'
                            }
                            className="font-bold uppercase text-[10px]"
                          >
                            {permit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-green-500/20 text-green-700 hover:bg-green-500/5 font-semibold text-[10px] gap-1"
                                disabled={isReviewing}
                                onClick={() => handleReviewPermit(permit.id, 'approved')}
                              >
                                <Check className="h-3 w-3" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-red-500/20 text-red-700 hover:bg-red-500/5 font-semibold text-[10px] gap-1"
                                disabled={isReviewing}
                                onClick={() => handleReviewPermit(permit.id, 'denied')}
                              >
                                <Ban className="h-3 w-3" /> Deny
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">Reviewed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
