import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WhenToPostSelectorProps {
  postNow: boolean;
  onPostNowChange: (postNow: boolean) => void;
  scheduleDate: Date | undefined;
  onScheduleDateChange: (date: Date | undefined) => void;
  scheduleTime: string;
  onScheduleTimeChange: (time: string) => void;
}

const WhenToPostSelector: React.FC<WhenToPostSelectorProps> = ({
  postNow,
  onPostNowChange,
  scheduleDate,
  onScheduleDateChange,
  scheduleTime,
  onScheduleTimeChange
}) => {
  return null; // Komponent nie jest już potrzebny - logika przeniesiona do głównego formularza
};

export default WhenToPostSelector;