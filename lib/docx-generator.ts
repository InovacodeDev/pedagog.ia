import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Footer,
} from 'docx';
import { ExamBlock } from '@/components/builder/exam-block';

export const generateDocx = async (blocks: ExamBlock[]) => {
  const children = [];

  // 1. Process Blocks
  for (const block of blocks) {
    if (block.id === 'watermark') continue; // Handle watermark in footer

    // --- Header ---
    if (block.type === 'header') {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: block.content.schoolName || 'NOME DA ESCOLA',
              bold: true,
              size: 32, // 16pt
            }),
          ],
          spacing: { after: 200 },
        })
      );

      // Info Rows
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Professor(a): ', bold: true }),
            new TextRun({ text: block.content.teacherName || '_________________' }),
            new TextRun({ text: '\tData: ', bold: true }),
            new TextRun({ text: block.content.date || '___/___/___' }),
          ],
          tabStops: [{ type: 'right', position: 9000 }], // Right align date
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Matéria: ', bold: true }),
            new TextRun({ text: block.content.discipline || '_________________' }),
            new TextRun({ text: '\tTurma: ', bold: true }),
            new TextRun({ text: block.content.gradeLevel || '________' }),
          ],
          tabStops: [{ type: 'right', position: 9000 }],
          spacing: { after: 200 },
        })
      );

      if (block.content.studentNameLabel !== false) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Nome: ', bold: true }),
              new TextRun({
                text: '__________________________________________________________________',
              }),
            ],
            spacing: { after: 400 },
          })
        );
      }
      continue;
    }

    // --- Text / Instructions ---
    if (block.type === 'text' && !block.questionData) {
      children.push(
        new Paragraph({
          children: [new TextRun(block.content.text || '')],
          spacing: { after: 200 },
        })
      );
      continue;
    }

    // --- Questions ---
    const question = block.questionData;
    const stem = question?.content?.stem || block.content.text || '';
    const type = question?.type || block.type;
    const options = question?.options || block.content.options || [];

    // Stem
    children.push(
      new Paragraph({
        children: [new TextRun({ text: stem, bold: true })],
        spacing: { before: 200, after: 100 },
      })
    );

    // Question Body by Type
    switch (type) {
      case 'multiple_choice':
        options.forEach((opt: string, idx: number) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${String.fromCharCode(97 + idx)}) `, bold: true }),
                new TextRun(opt),
              ],
              indent: { left: 360 }, // Indent options
            })
          );
        });
        break;

      case 'true_false':
        options.forEach((opt: string) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: '(   ) ', font: 'Courier New' }), // Monospace for brackets
                new TextRun(opt),
              ],
              indent: { left: 360 },
            })
          );
        });
        break;

      case 'summation':
        options.forEach((opt: string, idx: number) => {
          const value = Math.pow(2, idx).toString().padStart(2, '0');
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[ ${value} ]`, bold: true, font: 'Courier New' }),
                new TextRun({ text: '\t' }),
                new TextRun(opt),
              ],
              tabStops: [{ type: 'left', position: 720 }],
              indent: { left: 360 },
            })
          );
        });
        break;

      case 'association':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const colB = (question?.content as any)?.column_b || [];
        const maxRows = Math.max(options.length, colB.length);

        const rows = [];
        for (let i = 0; i < maxRows; i++) {
          const textA = options[i] ? `(   ) ${options[i]}` : '';
          const textB = colB[i] ? `${String.fromCharCode(97 + i)}) ${colB[i]}` : '';

          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph(textA)],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(textB)],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  },
                }),
              ],
            })
          );
        }

        children.push(
          new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            },
          })
        );
        break;

      case 'redaction':
        // Support Texts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supportTexts = (question?.content as any)?.support_texts || [];
        if (supportTexts.length > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'Textos Motivadores:', bold: true, italics: true })],
              spacing: { before: 100 },
            })
          );
          supportTexts.forEach((text: string, i: number) => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `Texto ${i + 1}: ${text}`, italics: true })],
                spacing: { after: 100 },
              })
            );
          });
        }

        // Ruled Lines (30 lines)
        for (let i = 0; i < 30; i++) {
          children.push(
            new Paragraph({
              text: '',
              border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
              spacing: { after: 300 }, // Line height simulation
            })
          );
        }
        break;

      case 'essay':
      case 'open_ended':
        const lines = question?.difficulty === 'Hard' ? 10 : 5;
        for (let i = 0; i < lines; i++) {
          children.push(
            new Paragraph({
              text: '',
              border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
              spacing: { after: 300 },
            })
          );
        }
        break;
    }
  }

  // 2. Footer (Watermark)
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Prova criada com Pedagogi.ai - Otimize seu tempo.',
            color: '808080',
            italics: true,
            size: 18, // 9pt
          }),
        ],
      }),
    ],
  });

  // 3. Create Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
        footers: {
          default: footer,
        },
      },
    ],
  });

  return await Packer.toBlob(doc);
};
