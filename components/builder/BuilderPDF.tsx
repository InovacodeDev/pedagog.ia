import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ExamBlock } from './ExamBlock';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  headerBlock: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    textAlign: 'right',
  },
  studentRow: {
    marginTop: 10,
    fontSize: 10,
  },
  textBlock: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  questionBlock: {
    marginBottom: 15,
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  option: {
    marginLeft: 15,
    marginBottom: 2,
  },
  essaySpace: {
    height: 100,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginTop: 10,
    marginBottom: 10,
  },
  watermark: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: 'grey',
    fontStyle: 'italic',
  },
});

interface BuilderPDFProps {
  blocks: ExamBlock[];
}

export const BuilderPDFDocument = ({ blocks }: BuilderPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {blocks.map((block) => {
        if (block.id === 'watermark') return null; // Handle watermark separately in footer

        if (block.type === 'header') {
          return (
            <View key={block.id} style={styles.headerBlock}>
              <Text style={styles.schoolName}>{block.content.schoolName || 'NOME DA ESCOLA'}</Text>

              <View style={styles.headerRow}>
                <Text style={styles.headerLeft}>Professor(a): {block.content.teacherName}</Text>
                <Text style={styles.headerRight}>Data: {block.content.date || '___/___/___'}</Text>
              </View>

              <View style={styles.headerRow}>
                <Text style={styles.headerLeft}>Matéria: {block.content.discipline}</Text>
                <Text style={styles.headerRight}>Turma: {block.content.gradeLevel}</Text>
              </View>

              {block.content.studentNameLabel !== false && (
                <View style={styles.studentRow}>
                  <Text>
                    Nome: __________________________________________________________________
                  </Text>
                </View>
              )}
            </View>
          );
        }

        if (block.type === 'text') {
          return (
            <View key={block.id} style={styles.textBlock}>
              <Text>{block.content.text}</Text>
            </View>
          );
        }

        const stripHtml = (html: string) => {
          return html.replace(/<[^>]*>?/gm, '');
        };

        if (block.type === 'multiple_choice') {
          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>
                {stripHtml(block.questionData?.content?.stem ?? '')}
              </Text>
              {block.content.options?.map((opt: string, idx: number) => (
                <Text key={idx} style={styles.option}>
                  {String.fromCharCode(65 + idx)}) {opt}
                </Text>
              ))}
            </View>
          );
        }

        if (block.type === 'true_false') {
          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>
                {stripHtml(block.questionData?.content?.stem ?? '')}
              </Text>
              {block.content.options?.map((opt: string, idx: number) => (
                <Text key={idx} style={styles.option}>
                  ( ) {opt}
                </Text>
              ))}
            </View>
          );
        }

        if (block.type === 'sum') {
          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>
                {stripHtml(block.questionData?.content?.stem ?? '')}
              </Text>
              {block.content.options?.map((opt: string, idx: number) => {
                const value = Math.pow(2, idx).toString().padStart(2, '0');
                return (
                  <Text key={idx} style={styles.option}>
                    [{value}] {opt}
                  </Text>
                );
              })}
            </View>
          );
        }

        if (block.type === 'association') {
          const questionData = block.questionData || {};
          const columnB = questionData.content?.column_b || [];

          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>
                {stripHtml(block.questionData?.content?.stem ?? '')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <View style={{ flex: 1 }}>
                  {block.content.options?.map((opt: string, idx: number) => (
                    <Text key={`col-a-${idx}`} style={styles.option}>
                      ( ) {opt.replace(/^\(\s*\)\s*/, '').trim()}
                    </Text>
                  ))}
                </View>
                <View style={{ flex: 1 }}>
                  {columnB.map((text: string, idx: number) => (
                    <Text key={`col-b-${idx}`} style={styles.option}>
                      {String.fromCharCode(97 + idx)}) {text}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          );
        }

        if (block.type === 'open_ended') {
          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>
                {stripHtml(block.questionData?.content?.stem ?? '')}
              </Text>

              {/* 8 Lines for Essay */}
              <View style={{ marginTop: 10 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#000',
                      height: 20, // Line height
                      marginBottom: 5,
                    }}
                  />
                ))}
              </View>
            </View>
          );
        }

        if (block.type === 'redaction' || block.type === 'essay') {
          const questionData = block.questionData || {};
          const genre = questionData.content?.genre;
          const supportTexts = questionData.content?.support_texts || [];

          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              {genre && (
                <Text style={{ ...styles.questionText, fontStyle: 'italic' }}>
                  Gênero Textual: {genre}
                </Text>
              )}

              {supportTexts.map((text: string, idx: number) => (
                <View
                  key={idx}
                  style={{ marginBottom: 10, padding: 5, backgroundColor: '#f9fafb' }}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 9 }}>
                    Texto Motivador {idx + 1}:
                  </Text>
                  <Text style={{ fontSize: 9, fontStyle: 'italic' }}>{text}</Text>
                </View>
              ))}

              <Text style={styles.questionText}>
                {stripHtml(block.content.text || block.questionData?.content?.stem || '')}
              </Text>

              {/* 35 Lines for Redaction */}
              <View style={{ marginTop: 10 }}>
                {Array.from({ length: 35 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#000',
                      height: 20, // Line height
                      marginBottom: 5,
                    }}
                  />
                ))}
              </View>
            </View>
          );
        }

        return null;
      })}

      {/* Watermark / Footer */}
      {blocks.find((b) => b.id === 'watermark') && (
        <Text style={styles.watermark} fixed>
          Prova criada com Pedagog.IA - Otimize seu tempo.
        </Text>
      )}
    </Page>
  </Document>
);
