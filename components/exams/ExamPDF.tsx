import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  studentLine: {
    marginTop: 10,
    fontSize: 11,
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionStem: {
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  // New Specs
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  col: {
    flexDirection: 'column',
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
    fontSize: 10,
  },
  optionText: {
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  grid2: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  gridItem: {
    width: '48%',
  },
  // Redaction specific
  redactionBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    marginBottom: 10,
  },
  redactionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 10,
  },
  redactionText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  ruledLine: {
    borderBottomWidth: 1,
    borderColor: '#000',
    height: 25,
    width: '100%',
  },
  watermark: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: 'grey',
  },
});

export interface Question {
  stem: string;
  type: string;
  options?: string[] | null;
  difficulty?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
}

interface ExamPDFProps {
  exam: {
    id: string;
    title: string;
    questions_list: Question[];
  };
  qrCodeUrl: string;
  isPro?: boolean;
}

const RuledLines = ({ count }: { count: number }) => (
  <View style={{ marginTop: 10 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.ruledLine} />
    ))}
  </View>
);

const RenderQuestionBody = ({ question }: { question: Question }) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <View>
          {question.options?.map((opt, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ width: 15, fontSize: 11 }}>{String.fromCharCode(97 + i)})</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </View>
          ))}
        </View>
      );

    case 'true_false':
      return (
        <View>
          {question.options?.map((opt, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ width: 20, fontSize: 11 }}>( )</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </View>
          ))}
        </View>
      );

    case 'summation':
      return (
        <View>
          {question.options?.map((opt, i) => {
            const value = Math.pow(2, i).toString().padStart(2, '0');
            return (
              <View key={i} style={styles.row}>
                <View style={styles.badge}>
                  <Text>{value}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </View>
            );
          })}
        </View>
      );

    case 'association':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const colB = (question.content as any)?.column_b || [];
      return (
        <View style={styles.grid2}>
          <View style={styles.gridItem}>
            {question.options?.map((opt, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ width: 20, fontSize: 11 }}>( )</Text>
                <Text style={styles.optionText}>{opt}</Text>
              </View>
            ))}
          </View>
          <View style={styles.gridItem}>
            {colB.map((opt: string, i: number) => (
              <View key={i} style={styles.row}>
                <Text style={{ width: 15, fontSize: 11 }}>{String.fromCharCode(97 + i)})</Text>
                <Text style={styles.optionText}>{opt}</Text>
              </View>
            ))}
          </View>
        </View>
      );

    case 'redaction':
      return (
        <View>
          <View style={styles.redactionBox}>
            <Text style={styles.redactionTitle}>Textos Motivadores</Text>
            {question.content?.support_texts?.map((text: string, i: number) => (
              <Text key={i} style={styles.redactionText}>
                {text}
              </Text>
            ))}
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 5 }}>
            Tema/Proposta: {question.content?.stem || question.stem}
          </Text>
          <RuledLines count={30} />
        </View>
      );

    case 'essay':
      const lines = question.difficulty === 'Hard' ? 10 : 5;
      return (
        <View>
          <RuledLines count={lines} />
        </View>
      );

    default:
      return (
        <View>
          {question.options?.map((opt, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ width: 15, fontSize: 11 }}>{String.fromCharCode(97 + i)})</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </View>
          ))}
        </View>
      );
  }
};

export const ExamDocument = ({ exam, qrCodeUrl, isPro = false }: ExamPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.schoolName}>Escola Modelo</Text>
          <Text style={styles.examTitle}>{exam.title}</Text>
          <Text style={styles.studentLine}>
            Nome: __________________________________________________ Data: ___/___/___
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={qrCodeUrl} style={styles.qrCode} />
          <Text style={{ fontSize: 8, marginTop: 2 }}>ID: {exam.id.slice(0, 8)}</Text>
        </View>
      </View>

      {/* Questions */}
      {exam.questions_list.map((question, index) => {
        const isRedaction = question.type === 'redaction';
        return (
          <View
            key={index}
            style={styles.questionContainer}
            wrap={!isRedaction}
            break={isRedaction}
          >
            <Text style={styles.questionStem}>
              {index + 1}. {question.stem}
            </Text>
            <RenderQuestionBody question={question} />
          </View>
        );
      })}

      {/* Footer / Watermark */}
      {!isPro ? (
        <Text style={styles.watermark} fixed>
          Prova criada com Pedagog.IA
        </Text>
      ) : (
        <Text style={styles.footer} fixed>
          Gerado por Pedagog.IA - Página{' '}
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`} />
        </Text>
      )}
    </Page>
  </Document>
);

export async function generateExamPDF(
  exam: { id: string; title: string; questions_list: Question[] },
  isPro = false
) {
  const qrCodeUrl = await QRCode.toDataURL(exam.id);
  return <ExamDocument exam={exam} qrCodeUrl={qrCodeUrl} isPro={isPro} />;
}
