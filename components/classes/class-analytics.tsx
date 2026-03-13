'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { ClassItem, getClassDisciplineAnalyticsAction } from '@/server/actions/classes';
import { Skeleton } from '@/components/ui/skeleton';
import { DataUnavailable } from '@/components/ui/data-unavailable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

interface ClassAnalyticsProps {
  classData: ClassItem;
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

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#34d399'];

export function ClassAnalytics({ classData }: ClassAnalyticsProps) {
  const supabase = createClient();
  const classId = classData.id;
  const periodType = classData.period_type || 'bimestre';
  const periodStarts = useMemo(() => classData.period_starts || [], [classData.period_starts]);

  // Helper to determine initial period
  const getInitialPeriodIndex = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Find the current period based on today's date
    const index = periodStarts.findIndex((start, i) => {
      const nextStart = periodStarts[i + 1];
      if (!nextStart) return todayStr >= start;
      return todayStr >= start && todayStr < nextStart;
    });

    return index !== -1 ? index : 0;
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceStats[]>([]);
  const [disciplineData, setDisciplineData] = useState<DisciplineStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodIndex, setPeriodIndex] = useState<number>(getInitialPeriodIndex());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const startDate = periodStarts[periodIndex];
        const nextPeriodStart = periodStarts[periodIndex + 1];
        let endDate = nextPeriodStart 
          ? new Date(new Date(nextPeriodStart).getTime() - 86400000).toISOString().split('T')[0]
          : undefined;

        // If it's the last period, we might want to cap it at the end of the year or current date
        if (!endDate) {
          const year = classData.academic_year || new Date().getFullYear();
          endDate = `${year}-12-31`;
        }

        const [attendanceRes, disciplineRes] = await Promise.all([
          getClassAttendanceAnalyticsAction(classId, startDate, endDate),
          getClassDisciplineAnalyticsAction(classId, startDate, endDate, `${periodIndex + 1}_${periodType}`)
        ]);

        if (attendanceRes.success && Array.isArray(attendanceRes.data)) {
          setAttendanceData(attendanceRes.data as AttendanceStats[]);
        } else {
          setAttendanceData([]);
        }
        
        if (disciplineRes.success && Array.isArray(disciplineRes.data)) {
          setDisciplineData(disciplineRes.data as DisciplineStats[]);
        } else {
          setDisciplineData([]);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [classId, periodIndex, periodStarts, periodType, classData.academic_year, refreshKey]);

  // Set up real-time listeners for data that affects analytics
  useEffect(() => {
    const channel = supabase
      .channel(`class-analytics-realtime-${classId}-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exam_results' },
        () => {
          console.log('Exam results change detected, refreshing analytics');
          setRefreshKey((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exam_grades' },
        () => {
          console.log('Exam grades change detected, refreshing analytics');
          setRefreshKey((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_attendance' },
        () => {
          console.log('Attendance change detected, refreshing analytics');
          setRefreshKey((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, classId]);

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

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: unknown;
      color: string;
      fill: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-md text-sm">
          <p className="font-semibold mb-1 border-b pb-1">
            {label && label.includes('-') 
              ? new Date(label).toLocaleDateString('pt-BR')
              : label}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-bold text-foreground">
                  {entry.name === 'Presença' ? `${entry.value}%` : entry.value.toFixed(2)}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-6 pb-12">
      {/* Period Filter */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Filtro de Período</h3>
            <p className="text-sm text-muted-foreground">Analise os dados por bimestre/trimestre</p>
          </div>
        </div>
        
        <Select 
          value={periodIndex.toString()} 
          onValueChange={(val) => setPeriodIndex(parseInt(val))}
        >
          <SelectTrigger className="w-[200px] h-11 bg-muted/50 border-border">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {periodStarts.map((_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {i + 1}º {periodType.charAt(0).toUpperCase() + periodType.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Attendance Trend */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Tendência de Presença</CardTitle>
          <CardDescription>Taxa de presença (%) no período selecionado</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground) / 0.2)', strokeWidth: 1 }} />
                <Line 
                  type="monotone" 
                  dataKey="presenceRate" 
                  name="Presença"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
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
              <BarChart data={disciplineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="discipline" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                />

                <Bar dataKey="average" name="Média" radius={[4, 4, 0, 0]} barSize={40}>
                  {disciplineData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
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
                ? (disciplineData.reduce((acc, curr) => acc + curr.average, 0) / disciplineData.length).toFixed(2)
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
    </div>
  );
}
