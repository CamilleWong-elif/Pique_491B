import { useRef, useEffect, useState } from 'react';

interface IOSDatePickerProps {
  value: { month: number; day: number; year: number };
  onChange: (date: { month: number; day: number; year: number }) => void;
  minAge?: number;
}

export function IOSDatePicker({ value, onChange, minAge = 13 }: IOSDatePickerProps) {
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Generate years (from minAge years ago to 100 years ago)
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - minAge;
  const minYear = currentYear - 100;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const ITEM_HEIGHT = 44;

  useEffect(() => {
    // Center the selected values on mount
    if (monthRef.current) {
      monthRef.current.scrollTop = (value.month - 1) * ITEM_HEIGHT - ITEM_HEIGHT;
    }
    if (dayRef.current) {
      dayRef.current.scrollTop = (value.day - 1) * ITEM_HEIGHT - ITEM_HEIGHT;
    }
    if (yearRef.current) {
      const yearIndex = years.indexOf(value.year);
      yearRef.current.scrollTop = yearIndex * ITEM_HEIGHT - ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: any[],
    type: 'month' | 'day' | 'year'
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const index = Math.round((scrollTop + ITEM_HEIGHT) / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

    // Snap to position
    ref.current.scrollTop = clampedIndex * ITEM_HEIGHT - ITEM_HEIGHT;

    // Update value
    if (type === 'month') {
      onChange({ ...value, month: clampedIndex + 1 });
    } else if (type === 'day') {
      onChange({ ...value, day: clampedIndex + 1 });
    } else if (type === 'year') {
      onChange({ ...value, year: items[clampedIndex] });
    }
  };

  const handleScrollEnd = (
    ref: React.RefObject<HTMLDivElement>,
    items: any[],
    type: 'month' | 'day' | 'year'
  ) => {
    let scrollTimeout: NodeJS.Timeout;
    return () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleScroll(ref, items, type);
      }, 100);
    };
  };

  const getItemOpacity = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (!ref.current) return 0.3;
    
    const scrollTop = ref.current.scrollTop;
    const centerIndex = (scrollTop + ITEM_HEIGHT) / ITEM_HEIGHT;
    const distance = Math.abs(index - centerIndex);
    
    if (distance < 0.5) return 1;
    if (distance < 1.5) return 0.5;
    return 0.3;
  };

  return (
    <div className="relative h-[220px] bg-white rounded-xl overflow-hidden">
      {/* Selection highlight */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full h-[44px] bg-gray-100 rounded-lg" />
      </div>

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <div className="flex h-full">
        {/* Month Column */}
        <div className="flex-1 relative">
          <div
            ref={monthRef}
            onScroll={handleScrollEnd(monthRef, months, 'month')}
            className="h-full overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            style={{ paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
          >
            {months.map((month, index) => (
              <div
                key={month}
                className="h-[44px] flex items-center justify-center text-[17px] transition-opacity duration-200"
                style={{
                  opacity: getItemOpacity(monthRef, index),
                  color: index === value.month - 1 ? '#000' : '#8E8E93'
                }}
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        {/* Day Column */}
        <div className="flex-1 relative">
          <div
            ref={dayRef}
            onScroll={handleScrollEnd(dayRef, days, 'day')}
            className="h-full overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            style={{ paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
          >
            {days.map((day, index) => (
              <div
                key={day}
                className="h-[44px] flex items-center justify-center text-[20px] font-medium transition-opacity duration-200"
                style={{
                  opacity: getItemOpacity(dayRef, index),
                  color: index === value.day - 1 ? '#000' : '#8E8E93'
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Year Column */}
        <div className="flex-1 relative">
          <div
            ref={yearRef}
            onScroll={handleScrollEnd(yearRef, years, 'year')}
            className="h-full overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            style={{ paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
          >
            {years.map((year, index) => (
              <div
                key={year}
                className="h-[44px] flex items-center justify-center text-[20px] font-medium transition-opacity duration-200"
                style={{
                  opacity: getItemOpacity(yearRef, index),
                  color: year === value.year ? '#000' : '#8E8E93'
                }}
              >
                {year}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
