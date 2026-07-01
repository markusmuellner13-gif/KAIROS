'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Radio, CalendarDays, Mail, LineChart, Settings } from 'lucide-react';

const ITEMS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/assistant', label: 'KAIROS', icon: Radio },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/inbox', label: 'Inbox', icon: Mail },
  { href: '/markets', label: 'Markets', icon: LineChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="nav-bar">
      <div className="nav-bar-inner">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
