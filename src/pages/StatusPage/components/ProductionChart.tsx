import React from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

// Exemplo de dados para o gráfico
// Estes dados seriam substituídos pelos dados reais da sua aplicação
const generateDailyData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    name: `${i}h`,
    real: Math.floor(Math.random() * 50) + 50,
    meta: Math.floor(Math.random() * 20) + 80,
  }));
};

const generateWeeklyData = () => {
  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return dias.map(dia => ({
    name: dia,
    real: Math.floor(Math.random() * 50) + 50,
    meta: Math.floor(Math.random() * 20) + 80,
  }));
};

const generateMonthlyData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    real: Math.floor(Math.random() * 50) + 50,
    meta: Math.floor(Math.random() * 20) + 80,
  }));
};

interface ProductionChartProps {
  period: 'dia' | 'semana' | 'mes';
}

const ProductionChart: React.FC<ProductionChartProps> = ({ period }) => {
  // Seleciona os dados com base no período
  const getData = () => {
    switch (period) {
      case 'dia':
        return generateDailyData();
      case 'semana':
        return generateWeeklyData();
      case 'mes':
        return generateMonthlyData();
      default:
        return generateWeeklyData();
    }
  };

  const data = getData();

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280' }} 
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280' }} 
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}u`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            formatter={(value) => [`${value} unidades`, '']}
            labelFormatter={(label) => `Período: ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => {
              return value === 'real' ? 'Produção Real' : 'Meta de Produção';
            }}
          />
          <Bar 
            dataKey="real" 
            name="real" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Line 
            type="monotone" 
            dataKey="meta" 
            name="meta" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={{ r: 4, fill: '#ef4444' }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionChart;
