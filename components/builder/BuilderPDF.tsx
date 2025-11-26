import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ExamBlock } from './ExamEditor';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  headerBlock: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
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

        if (block.type === 'multiple_choice') {
          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>{block.content.text}</Text>
              {block.content.options?.map((opt, idx) => (
                <Text key={idx} style={styles.option}>
                  {String.fromCharCode(65 + idx)}) {opt}
                </Text>
              ))}
            </View>
          );
        }

        if (block.type === 'essay') {
          return (
            <View key={block.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionText}>{block.content.text}</Text>
              <View style={styles.essaySpace} />
            </View>
          );
        }

        return null;
      })}

      {/* Watermark / Footer */}
      {blocks.find((b) => b.id === 'watermark') && (
        <Text style={styles.watermark} fixed>
          Prova criada com Pedagogi.ai - Otimize seu tempo.
        </Text>
      )}
    </Page>
  </Document>
);
