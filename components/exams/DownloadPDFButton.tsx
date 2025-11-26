'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ExamDocument } from './ExamPDF';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface Exam {
  id: string;
  title: string;
  questions_list: Array<{
    stem: string;
    options: string[];
  }>;
  status: string;
  created_at: string;
}

interface DownloadPDFButtonProps {
  exam: Exam;
}

export function DownloadPDFButton({ exam }: DownloadPDFButtonProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    QRCode.toDataURL(exam.id).then(setQrCodeUrl);
  }, [exam.id]);

  if (!isClient || !qrCodeUrl) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Preparando PDF...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ExamDocument exam={exam} qrCodeUrl={qrCodeUrl} />}
      fileName={`${exam.title.replace(/\s+/g, '_')}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Baixar PDF
        </Button>
      )}
    </PDFDownloadLink>
  );
}
