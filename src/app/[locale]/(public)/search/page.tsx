'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from '@/i18n/routing';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default function SearchPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState<string>(queryParam);

  const { data: resultsData, isLoading, refetch } = useQuery({
    queryKey: ['global-search', queryParam],
    queryFn: async () => {
      if (!queryParam) return { results: [] };
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(queryParam)}`);
      return res.json();
    },
    enabled: !!queryParam,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const results = resultsData?.results || [];

  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <AnalyticsTrigger eventName="search" meta={{ query: queryParam }} />

      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Search Portal</h1>
        <p className="text-muted-foreground text-sm">Fuzzy search across routes, parks, events, and announcements.</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            placeholder="Type to search (e.g. Jack Layton, Centre Island, birdwatching, yoga...)"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Searching registry...</span>
          </div>
        ) : !queryParam ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Type in the search box above to find information.
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 space-y-2 border-2 border-dashed rounded-lg">
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-muted-foreground">No matches found for "{queryParam}"</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">Try refining your search terms (e.g., "Hanlan's", "Ward's", "Sakura", "permit").</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {results.length} Matches Found
            </h2>
            <div className="space-y-3">
              {results.map((item: any) => (
                <Card key={item.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase">
                        {item.type}
                      </span>
                      <CardTitle className="text-base font-bold">
                        <Link href={item.url} className="hover:underline text-primary">
                          {item.title}
                        </Link>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex justify-between items-end gap-6">
                    <CardDescription className="text-sm line-clamp-2 flex-1">
                      {item.description}
                    </CardDescription>
                    <Link href={item.url} className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1 shrink-0' })}>
                      Go <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
