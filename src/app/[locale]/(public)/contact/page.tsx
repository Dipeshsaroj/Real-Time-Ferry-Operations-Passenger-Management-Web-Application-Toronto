'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default function ContactPage() {
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <AnalyticsTrigger eventName="contact_page_view" />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Contact & Support</h1>
        <p className="text-muted-foreground text-sm">Reach out to the Toronto Parks, Forestry & Recreation department.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-primary">Office Address</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4 text-muted-foreground">
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Jack Layton Ferry Terminal, 9 Queens Quay W, Toronto, ON M5J 2H3</span>
              </div>
              <div className="flex gap-2 border-t pt-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 416-392-2489</span>
              </div>
              <div className="flex gap-2 border-t pt-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>ferry.support@toronto.ca</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {success ? (
            <Card className="border-2 border-green-500/50">
              <CardHeader className="text-center pb-4 bg-green-500/5">
                <CheckCircle2 className="h-10 w-10 text-green-600 bg-green-600/15 p-2 rounded-full mx-auto" />
                <CardTitle className="text-xl font-extrabold text-green-700 dark:text-green-400 mt-2">
                  Message Sent Successfully!
                </CardTitle>
                <CardDescription>
                  Thank you for reaching out. We will get back to you shortly.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Send a Message
                  </CardTitle>
                  <CardDescription>We monitor submissions during office hours (9:00 AM - 5:30 PM).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Name</label>
                      <Input placeholder="Enter your name" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Email</label>
                      <Input placeholder="Enter your email" type="email" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Subject</label>
                    <Input placeholder="Enter message subject" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Message</label>
                    <Textarea placeholder="Type your message here..." required />
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t p-4">
                  <Button type="submit">Submit Ticket</Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
