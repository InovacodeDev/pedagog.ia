import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Register fonts if needed, for now using standard fonts
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
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
    marginBottom: 15,
  },
  questionStem: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  option: {
    marginLeft: 15,
    marginBottom: 2,
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

interface ExamPDFProps {
  exam: {
    id: string;
    title: string;
    questions_list: Array<{
      stem: string;
      options: string[];
    }>;
  };
  qrCodeUrl: string;
}

export const ExamDocument = ({ exam, qrCodeUrl }: ExamPDFProps) => (
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
          <Image src={qrCodeUrl} style={styles.qrCode} />
          <Text style={{ fontSize: 8, marginTop: 2 }}>ID: {exam.id.slice(0, 8)}</Text>
        </View>
      </View>

      {/* Questions */}
      {exam.questions_list.map((question, index) => (
        <View key={index} style={styles.questionContainer} wrap={false}>
          <Text style={styles.questionStem}>
            {index + 1}. {question.stem}
          </Text>
          {question.options.map((option, optIndex) => (
            <Text key={optIndex} style={styles.option}>
              {String.fromCharCode(65 + optIndex)}) {option}
            </Text>
          ))}
        </View>
      ))}

      {/* Footer */}
      <Text style={styles.footer} fixed>
        Gerado por Pedagogi.ai - Página{' '}
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`} />
      </Text>
    </Page>
  </Document>
);

interface Exam {
  id: string;
  title: string;
  questions_list: Array<{
    stem: string;
    options: string[];
  }>;
}

export async function generateExamPDF(exam: Exam) {
  const qrCodeUrl = await QRCode.toDataURL(exam.id);
  return <ExamDocument exam={exam} qrCodeUrl={qrCodeUrl} />;
}
