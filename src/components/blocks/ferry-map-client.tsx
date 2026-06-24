'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Anchor, Compass, Loader } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

const TORONTO_CENTER: [number, number] = [43.6300, -79.3800];

export default function FerryMapClient({ locale }: { locale: string }) {
  const router = useRouter();

  const { data: routesData, isLoading } = useQuery({
    queryKey: ['routes-map'],
    queryFn: async () => {
      const res = await fetch('/api/v1/routes');
      return res.json();
    },
  });

  const routes = routesData?.routes || [];

  const terminals: any[] = [];
  const seenTerminals = new Set<string>();

  routes.forEach((route: any) => {
    if (route.originTerminal && !seenTerminals.has(route.originTerminal.id)) {
      seenTerminals.add(route.originTerminal.id);
      terminals.push(route.originTerminal);
    }
    if (route.destinationTerminal && !seenTerminals.has(route.destinationTerminal.id)) {
      seenTerminals.add(route.destinationTerminal.id);
      terminals.push(route.destinationTerminal);
    }
  });

  if (isLoading) {
    return (
      <div className="h-[600px] w-full rounded-lg border flex flex-col items-center justify-center bg-muted/20 gap-3">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Initializing interactive map...</span>
      </div>
    );
  }

  const terminalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const ferryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -30],
    shadowSize: [30, 30]
  });

  return (
    <Card className="overflow-hidden shadow-lg border">
      <CardContent className="p-0 relative">
        <div className="h-[600px] w-full z-10">
          <MapContainer
            center={TORONTO_CENTER}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            />

            {terminals.map((terminal) => {
              const features = JSON.parse(terminal.accessibilityFeatures || '[]');
              return (
                <Marker
                  key={terminal.id}
                  position={[terminal.lat, terminal.lng]}
                  icon={terminalIcon}
                >
                  <Popup>
                    <div className="p-1 space-y-2 max-w-[240px]">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-primary">
                        <Anchor className="h-3.5 w-3.5 shrink-0" />
                        <span>{terminal.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{terminal.address}</p>
                      {features.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Facilities</span>
                          <div className="flex flex-wrap gap-1">
                            {features.map((f: string) => (
                              <span key={f} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-foreground/80 font-medium">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full text-xs h-7 mt-2"
                        onClick={() => router.push(`/ferry/schedules?routeId=all`)}
                      >
                        View Schedules
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {routes.map((route: any) => {
              const origin: [number, number] = [route.originTerminal.lat, route.originTerminal.lng];
              const dest: [number, number] = [route.destinationTerminal.lat, route.destinationTerminal.lng];
              const path: [number, number][] = [origin, dest];

              const midLat = (origin[0] + dest[0]) / 2 + 0.001;
              const midLng = (origin[1] + dest[1]) / 2 - 0.001;

              return (
                <React.Fragment key={route.id}>
                  <Polyline
                    positions={path}
                    color="#1b5e20"
                    weight={3}
                    opacity={0.6}
                    dashArray="5, 10"
                  />
                  <Marker
                    position={[midLat, midLng]}
                    icon={ferryIcon}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-primary">
                          <Compass className="h-3.5 w-3.5 shrink-0" />
                          <span>Simulated Boat Status</span>
                        </div>
                        <p className="text-xs text-muted-foreground">In transit on route:</p>
                        <p className="text-xs font-semibold">{route.name}</p>
                        <span className="inline-block bg-green-500/10 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold mt-1">
                          Cruising Speed: 8 knots
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        <div className="absolute bottom-4 left-4 bg-background/90 border p-3 rounded-lg z-20 shadow-md text-xs space-y-2 pointer-events-auto backdrop-blur">
          <span className="font-bold block text-primary font-sans">Legend</span>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-green-600 block border" />
            <span>Ferry Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-blue-600 block border" />
            <span>Ferry Ship (Simulated)</span>
          </div>
          <div className="flex items-center gap-2 border-t pt-1.5 mt-1">
            <span className="border-t-2 border-dashed border-[#1b5e20] w-5 h-0.5 inline-block" />
            <span>Water Route</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
