'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getClassAttendanceAnalyticsAction } from '@/server/actions/attendance';
import { getClassDisciplineAnalyticsAction } from '@/server/actions/classes';
import { Skeleton } from '@/components/ui/skeleton';
import { DataUnavailable } from '@/components/ui/data-unavailable';

interface ClassAnalyticsProps {
  classId: string;
}

interface AttendanceStats {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  presenceRate: number;
}


interface DisciplineStats {
  discipline: string;
  average: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ClassAnalytics({ classId }: ClassAnalyticsProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceStats[]>([]);
  const [disciplineData, setDisciplineData] = useState<DisciplineStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [attendanceRes, disciplineRes] = await Promise.all([
          getClassAttendanceAnalyticsAction(classId),
          getClassDisciplineAnalyticsAction(classId)
        ]);

        if (attendanceRes.success && Array.isArray(attendanceRes.data)) {
          setAttendanceData(attendanceRes.data as AttendanceStats[]);
        }
        if (disciplineRes.success && Array.isArray(disciplineRes.data)) {
          setDisciplineData(disciplineRes.data as DisciplineStats[]);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-6">
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  const hasData = attendanceData.length > 0 || disciplineData.length > 0;

  if (!hasData) {
    return (
      <div className="mt-6">
        <DataUnavailable 
          title="Sem dados suficientes" 
          message="Registre presenças e realize provas com esta turma para começar a ver os analytics." 
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-6 pb-12">
      {/* Attendance Trend */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Tendência de Presença</CardTitle>
          <CardDescription>Taxa de presença (%) nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(str) => new Date(str).toLocaleDateString('pt-BR')}
                  formatter={(value: unknown) => [`${Number(value || 0)}%`, 'Presença']}

                />
                <Line 
                  type="monotone" 
                  dataKey="presenceRate" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem dados de presença disponíveis.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average by Discipline */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Média por Matéria</CardTitle>
          <CardDescription>Desempenho médio da turma em provas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {disciplineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disciplineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="discipline" type="category" width={100} />
                <Tooltip formatter={(value: unknown) => [Number(value || 0).toFixed(1), 'Média']} />

                <Bar dataKey="average" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {disciplineData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem dados de provas disponíveis.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Distribution or Other Metric */}
      <Card className="col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Resumo de Desempenho</CardTitle>
          <CardDescription>Visão geral de notas e engajamento</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-around gap-8 py-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase">Média Geral</p>
            <p className="text-4xl font-bold mt-2">
              {disciplineData.length > 0 
                ? (disciplineData.reduce((acc, curr) => acc + curr.average, 0) / disciplineData.length).toFixed(1)
                : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase">Presença Média</p>
            <p className="text-4xl font-bold mt-2">
              {attendanceData.length > 0
                ? (attendanceData.reduce((acc, curr) => acc + curr.presenceRate, 0) / attendanceData.length).toFixed(0) + '%'
                : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase">Provas Realizadas</p>
            <p className="text-4xl font-bold mt-2">
              {disciplineData.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
