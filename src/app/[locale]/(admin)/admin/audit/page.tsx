'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, Activity, User, ShieldAlert } from 'lucide-react';

export default function AdminAuditPage() {
  const { data: auditData, isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/audit');
      return res.json();
    },
  });

  const logs = auditData?.auditLogs || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">Trace operator and staff actions, updates, and cancellations in the system.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Activity Trail
          </CardTitle>
          <CardDescription>Auditing trace is immutable and recorded under government guidelines.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading audit records...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No audit logs recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User / Action</TableHead>
                    <TableHead>Target Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead className="text-right">Change Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-semibold">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <User className="h-3 w-3" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground">{log.user.name}</span>
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase block w-max mt-0.5">
                              {log.action}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold uppercase text-primary">
                        {log.entityType}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.entityId}
                      </TableCell>
                      <TableCell className="text-right text-xs max-w-[200px] truncate font-mono text-muted-foreground" title={log.diffJson}>
                        {log.diffJson}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
