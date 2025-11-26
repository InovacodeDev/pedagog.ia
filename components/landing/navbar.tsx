'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter text-indigo-600">Pedagogi.ai</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Funcionalidades
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Depoimentos
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Preço
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-slate-600 hover:text-indigo-600">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Link href="/login">Começar Grátis</Link>
          </Button>
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
