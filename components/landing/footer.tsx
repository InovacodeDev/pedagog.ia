'use client';

import Link from 'next/link';
import { SiX, SiXHex, SiGithub, SiGithubHex } from '@icons-pack/react-simple-icons';

export function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-600 py-12 border-t border-slate-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold tracking-tighter text-slate-900">Pedagog.IA</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Transformando a educação através da tecnologia. Menos burocracia, mais ensino.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-indigo-600 transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-indigo-600 transition-colors">
                  Preço
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition-colors">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/ai-usage" className="hover:text-indigo-600 transition-colors">
                  Uso Responsável de IA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Pedagog.IA. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <SiX size={20} color={SiXHex} />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <SiGithub size={20} color={SiGithubHex} />
            </Link>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Feito com 💜 para a educação
          </p>
        </div>
      </div>
    </footer>
  );
}
