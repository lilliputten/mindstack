'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

export function ClientsSection() {
  const logos = [
    { src: '/static/landing/logo-1.png', alt: 'Client logo 1' },
    { src: '/static/landing/logo-2.png', alt: 'Client logo 2' },
    { src: '/static/landing/logo-3.png', alt: 'Client logo 3' },
    { src: '/static/landing/logo-1.png', alt: 'Client logo 1' },
    { src: '/static/landing/logo-2.png', alt: 'Client logo 2' },
    { src: '/static/landing/logo-3.png', alt: 'Client logo 3' },
    { src: '/static/landing/logo-1.png', alt: 'Client logo 1' },
    { src: '/static/landing/logo-2.png', alt: 'Client logo 2' },
  ];

  return (
    <section
      className={cn(
        isDev && '__ClientsSection', // DEBUG
        'py-12',
      )}
    >
      <p className="mb-6 text-center text-lg font-semibold">
        Trusted by learners and educators worldwide
      </p>
      <div className="flex flex-wrap items-center justify-center gap-9 px-6 py-6">
        {logos.map((logo, index) => (
          <div
            key={index}
            className="relative h-12 w-24 opacity-60 grayscale transition-opacity hover:opacity-100 hover:grayscale-0"
          >
            <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
