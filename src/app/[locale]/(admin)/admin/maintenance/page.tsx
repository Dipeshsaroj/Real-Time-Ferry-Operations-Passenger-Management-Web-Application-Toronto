'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, Clock, Loader, AlertCircle, User, Calendar, CheckSquare, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMaintenancePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch current logged in user
  const { data: userData } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) return res.json();
      return null;
    },
  });

  const currentUser = userData?.user;

  // 2. Fetch all maintenance requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['admin-maintenance-requests'],
    queryFn: async () => {
      const res = await fetch('/api/v1/maintenance');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });

  const requests = requestsData?.requests || [];

  // 3. Mutation: Accept Request
  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/maintenance/${id}/accept`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to accept request');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Service request accepted! Task assigned to you.');
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  // 4. Mutation: Complete Request
  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/maintenance/${id}/complete`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to resolve request');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Maintenance ticket marked resolved successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 gap-1 font-bold">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 gap-1 font-bold">
            <Wrench className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 gap-1 font-bold">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFacilityBadge = (type: string) => {
    switch (type) {
      case 'ferry':
        return <Badge variant="secondary">Ferry Ship</Badge>;
      case 'terminal':
        return <Badge variant="secondary">Ferry Terminal</Badge>;
      case 'park':
        return <Badge variant="secondary">Park / Trail</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // Filter & Search logic
  const filteredRequests = requests.filter((req: any) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Maintenance Board</h1>
        <p className="text-muted-foreground text-sm">Review, accept, and resolve reported mechanical issues across ferries, terminals, and parks.</p>
      </div>

      {/* Toolbar / Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, description, or facility..."
              className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden md:inline" />
            <div className="flex rounded-md border overflow-hidden w-full md:w-auto">
              {['all', 'pending', 'accepted', 'completed'].map((status) => (
                <button
                  key={status}
                  className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border-r last:border-0 transition-colors ${
                    statusFilter === status 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-muted-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : status === 'accepted' ? 'In Progress' : status === 'completed' ? 'Resolved' : status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading maintenance tickets...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg text-muted-foreground text-sm flex flex-col items-center justify-center gap-2 bg-background">
          <AlertCircle className="h-8 w-8" />
          No maintenance tickets matched the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request: any) => {
            const isAssignedToMe = request.acceptedById === currentUser?.id;
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
                <CardHeader className="p-5 pb-3">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getFacilityBadge(request.facilityType)}
                        <span className="text-xs font-bold text-muted-foreground">
                          • {request.facilityName}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-primary mt-1">{request.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4 pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{request.description}</p>
                  
                  {/* Reported detail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Reported by: <strong className="text-foreground/80 font-bold">{request.reportedBy}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Date Reported: <strong className="text-foreground/80 font-bold">{new Date(request.createdAt).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Accept / Complete details */}
                  {(request.acceptedBy || request.completedAt) && (
                    <div className="border-t pt-3 space-y-1.5 text-xs text-muted-foreground">
                      {request.acceptedBy && (
                        <div>
                          • Assigned Mechanic: <strong className="text-primary font-bold">{request.acceptedBy.name}</strong> ({request.acceptedBy.email}) 
                          {request.acceptedAt && <span className="opacity-75"> on {new Date(request.acceptedAt).toLocaleString()}</span>}
                        </div>
                      )}
                      {request.completedAt && (
                        <div className="text-green-600 font-bold">
                          ✓ Resolved on: {new Date(request.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="px-5 py-4 border-t bg-muted/10 flex justify-end gap-3">
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => acceptMutation.mutate(request.id)}
                      disabled={acceptMutation.isPending}
                      className="font-bold gap-1.5"
                    >
                      <Wrench className="h-4 w-4" /> Accept Request
                    </Button>
                  )}
                  {request.status === 'accepted' && isAssignedToMe && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => completeMutation.mutate(request.id)}
                      disabled={completeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 font-bold gap-1.5"
                    >
                      <CheckSquare className="h-4 w-4" /> Mark Resolved
                    </Button>
                  )}
                  {request.status === 'accepted' && !isAssignedToMe && (
                    <span className="text-xs text-muted-foreground italic">
                      In progress by another mechanic
                    </span>
                  )}
                  {request.status === 'completed' && (
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Issue Resolved
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
