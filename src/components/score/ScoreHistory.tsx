import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ScoreHistoryProps {
  data: { date: string; score: number }[];
  targetScore?: number;
}

export function ScoreHistory({ data, targetScore = 240 }: ScoreHistoryProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      dateFormatted: format(parseISO(d.date), 'MMM d')
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No score history yet. Complete more assessments to track your progress.</p>
      </div>
    );
  }

  const minScore = Math.min(...data.map(d => d.score), 196) - 10;
  const maxScore = Math.max(...data.map(d => d.score), targetScore) + 10;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            domain={[minScore, maxScore]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`${value}`, 'Predicted Score']}
          />
          
          {/* Pass line (Step 1: 196) */}
          <ReferenceLine 
            y={196} 
            stroke="hsl(var(--destructive))" 
            strokeDasharray="5 5" 
            label={{ 
              value: 'Pass (196)', 
              fill: 'hsl(var(--destructive))', 
              fontSize: 10,
              position: 'right'
            }} 
          />
          
          {/* Target line */}
          <ReferenceLine 
            y={targetScore} 
            stroke="hsl(var(--livemed-success))" 
            strokeDasharray="5 5" 
            label={{ 
              value: `Target (${targetScore})`, 
              fill: 'hsl(var(--livemed-success))', 
              fontSize: 10,
              position: 'right'
            }} 
          />
          
          {/* Score line */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--livemed-cyan))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--livemed-cyan))', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'hsl(var(--livemed-blue))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
