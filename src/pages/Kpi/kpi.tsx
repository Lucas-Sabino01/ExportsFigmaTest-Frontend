/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, JSX, useMemo } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilo padrão do react-calendar
import QuestionnaireModal from '../DayShop/components/QuestionnaireModal'; // Importando o novo componente de modal
import './Kpistyles.css'; // Importando o CSS para o calendário e modal
import { DialogClose } from "@/components/ui/dialog";
// Mock para Card e CardContent se não estiverem disponíveis no ambiente de execução do snippet
// Remova ou ajuste isso conforme a estrutura do seu projeto real.
const Card: React.FC<any> = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardContent: React.FC<any> = ({ children, ...props }) => <div {...props}>{children}</div>;

interface KpiItemData {
  id: number;
  title: string;
  progressColor: string;
  questions?: { id: string; text: string; type: 'yesno' | 'text' }[];
  progress?: Record<string, number>; // Progresso por dia (dia como string ou number)
  currentProgress?: number; // Progresso atual acumulado
}

interface KpiProps {
    onClose: () => void; // Função para fechar o modal
}

const baseCardWidth = 210;

const initialKpiData: KpiItemData[] = [
  { 
    id: 1,
    title: "ENTREGAS",
    progressColor: "#34D399",
    questions: [
      { id: "q1e", text: "Todas as entregas foram no prazo este mês?", type: "yesno" },
      { id: "q2e", text: "Houve alguma reclamação de cliente sobre entrega?", type: "yesno" },
    ],
    currentProgress: 0,
  },
  {
    id: 2,
    title: "QUALIDADE",
    progressColor: "#F59E0B",
    questions: [
      { id: "q1q", text: "O índice de retrabalho diminuiu?", type: "yesno" },
      { id: "q2q", text: "Novos padrões de qualidade foram implementados?", type: "yesno" },
    ],
    currentProgress: 0,
  },
  {
    id: 3,
    title: "CUSTOS",
    progressColor: "#EF4444",
    questions: [
      { id: "q1c", text: "Houve redução de desperdícios?", type: "yesno" },
    ],
    currentProgress: 0,
  },
  {
    id: 4,
    title: "5S",
    progressColor: "#6366F1",
    questions: [
      { id: "q1s5_seiri", text: "Seiri (Utilização): Itens desnecessários foram descartados?", type: "yesno" },
      { id: "q2s5_seiton", text: "Seiton (Organização): Tudo está em seu devido lugar?", type: "yesno" },
    ],
    currentProgress: 0,
  },
  {
    id: 5,
    title: "SEGURANÇA",
    progressColor: "#0EA5E9",
    questions: [
      { id: "q1seg", text: "Houve incidentes de segurança este mês?", type: "yesno" },
    ],
    currentProgress: 0,
  },
  {
    id: 6,
    title: "MANUTENÇÃO",
    progressColor: "#8B5CF6",
    questions: [
      { id: "q1man", text: "Manutenções preventivas foram concluídas?", type: "yesno" },
    ],
    currentProgress: 0,
  },
];


interface CircularProgressBarProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  baseColor?: string;
  progressColor?: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size = 220,
  strokeWidth = 20,
  baseColor = "#E5E7EB", // Cinza claro
  progressColor = "#4CAF50", // Verde padrão
}) => { 
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Garante que a porcentagem esteja entre 0 e 100 para o cálculo do offset
  const progressPercentage = Math.max(0, Math.min(percentage, 100));
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={baseColor} strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} stroke={progressColor} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ 
          transform: 'rotate(-90deg)', 
          transformOrigin: 'center center',
          transition: 'stroke-dashoffset 1.5s ease-in-out' // Transição mais suave
        }}
      />
    </svg>
  );
};

export const Kpi = ({ onClose }: KpiProps): JSX.Element => {
  const [kpiData, setKpiData] = useState<KpiItemData[]>(initialKpiData);
  const [activeKpi, setActiveKpi] = useState<KpiItemData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Estado para o dia selecionado (número) e para o objeto Date (para o react-calendar)
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedDateForCalendar, setSelectedDateForCalendar] = useState<Date>(new Date());
  const [, setClickPosition] = useState<{ x: number, y: number } | undefined>(undefined);
  
  const today = new Date();
  const currentDayOfMonth = today.getDate();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const modalTitleId = "kpi-dashboard-title";
    const modalDescriptionId = "kpi-dashboard-description"; 
  // Função para calcular o progresso considerando todos os dias do mês
  // 100% só é atingido quando todos os dias do mês estão preenchidos
  const calculateMonthlyProgress = (kpi: KpiItemData): number => {
    if (!kpi.progress) {
      return 0;
    }

    // Soma total de progresso registrado
    let totalProgress = 0;
    
    // Número de dias com progresso registrado
    const daysWithProgress = Object.keys(kpi.progress).map(Number);
    
    // Soma o progresso de todos os dias registrados
    daysWithProgress.forEach(day => {
      totalProgress += kpi.progress![day.toString()];
    });
    
    // Calcula a média considerando TODOS os dias do mês (não apenas os preenchidos)
    // Isso garante que 100% só é atingido quando todos os dias estão preenchidos
    return totalProgress / daysInCurrentMonth;
  };

  // Função para atualizar o progresso de todos os KPIs
  const updateAllKpiProgress = (kpiList: KpiItemData[]): KpiItemData[] => {
    return kpiList.map(kpi => ({
      ...kpi,
      currentProgress: calculateMonthlyProgress(kpi)
    }));
  };

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('kpi_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Mesclar dados salvos com dados iniciais
        const mergedData = initialKpiData.map(initialKpi => {
          const savedKpi = parsedData.find((sKpi: KpiItemData) => sKpi.id === initialKpi.id);
          return savedKpi ? { ...initialKpi, ...savedKpi } : initialKpi;
        });
        
        // Calcular o progresso para cada KPI
        const updatedData = updateAllKpiProgress(mergedData);
        setKpiData(updatedData);
      } catch (e) {
        console.error('Erro ao carregar dados salvos de KPI:', e);
        setKpiData(initialKpiData);
      }
    } else {
      setKpiData(initialKpiData);
    }
  }, []);

  // Salvar dados quando houver alterações
  useEffect(() => {
    localStorage.setItem('kpi_data', JSON.stringify(kpiData));
  }, [kpiData]);

  const handleKpiCardClick = (kpi: KpiItemData, event: React.MouseEvent) => {
    setActiveKpi(kpi);
    setClickPosition({ x: event.clientX, y: event.clientY });
    const todayDate = new Date();
    setSelectedDay(todayDate.getDate()); // Define o dia (número)
    setSelectedDateForCalendar(todayDate); // Define o objeto Date para o calendário
    setIsModalVisible(true); 
  };

  // Chamado quando uma data é selecionada no react-calendar
  const handleCalendarChange = (value: any /* Date | Date[] | null */) => {
    if (value instanceof Date) {
      setSelectedDateForCalendar(value); // Atualiza o estado para o react-calendar
      const dayOfMonth = value.getDate();
      setSelectedDay(dayOfMonth); // Atualiza o dia (número) para o modal

      if (activeKpi) {
        setIsModalVisible(true); // Abre o modal
      }
    } else {
      // Lida com seleção de range ou null, se necessário, ou ignora
      console.warn("Seleção de calendário não resultou em uma data única:", value);
    }
  };
  
  // Calcula os dias que têm dados para o KPI ativo (usado pelo tileClassName do Calendar)
  const daysWithDataForCurrentKpi = useMemo(() => {
    if (activeKpi?.progress) {
      return Object.keys(activeKpi.progress).map(dayStr => parseInt(dayStr, 10));
    }
    return [];
  }, [activeKpi]);

  // Função para personalizar as classes dos tiles do calendário
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && date.getMonth() === today.getMonth()) {
      const day = date.getDate();
      
      // Verifica se este dia tem dados para o KPI ativo
      if (daysWithDataForCurrentKpi.includes(day)) {
        return 'react-calendar__tile--hasData';
      }
    }
    return null;
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setClickPosition(undefined);
  };

  const handleQuestionnaireSubmit = (kpiId: number, day: number, answers: Record<string, any>) => {
    // Salvar respostas para este KPI e dia específico
    localStorage.setItem(`kpi_${kpiId}_day_${day}`, JSON.stringify(answers));

    const kpiToUpdate = kpiData.find(k => k.id === kpiId);
    if (!kpiToUpdate || !kpiToUpdate.questions || kpiToUpdate.questions.length === 0) return;

    // Calcular progresso baseado nas respostas
    const totalQuestions = kpiToUpdate.questions.length;
    let positiveAnswers = 0;

      if (kpiToUpdate.title === "SEGURANÇA") {
        console.log("Aplicando lógica especial para SEGURANÇA.");
        const incidentQuestionId = "q1seg"; // Certifique-se que este é o ID correto da pergunta de segurança
        
        if (Object.prototype.hasOwnProperty.call(answers, incidentQuestionId)) {
            const safetyAnswer = String(answers[incidentQuestionId]).toLowerCase();
            console.log(`Resposta para '${incidentQuestionId}': '${safetyAnswer}'`);
            if (safetyAnswer === 'no') { // "Não" houve incidentes é positivo
                positiveAnswers = 1; // Para 1 pergunta, isso é 100%
            } else if (safetyAnswer === 'yes') { // "Sim" houve incidentes é negativo
                positiveAnswers = 0;
            } else {
                console.warn(`Resposta inesperada para segurança: '${safetyAnswer}'. Considerando como 0 respostas positivas.`);
                positiveAnswers = 0; // Trata respostas inesperadas ou não preenchidas
            }
        } else {
            console.warn(`Pergunta de segurança '${incidentQuestionId}' não encontrada nas respostas. Considerando como 0 respostas positivas.`);
            positiveAnswers = 0; // Se a pergunta não foi respondida
        }
        console.log(`Respostas positivas para SEGURANÇA (de ${totalQuestions} perguntas): ${positiveAnswers}`);

    } else {
        // Lógica padrão para outros KPIs
        console.log(`Aplicando lógica padrão para "${kpiToUpdate.title}".`);
        positiveAnswers = Object.values(answers).filter(value => String(value).toLowerCase() === 'yes').length;
        console.log(`Respostas positivas para "${kpiToUpdate.title}" (de ${totalQuestions} perguntas): ${positiveAnswers}`);
    }
    const progressValue = totalQuestions > 0 ? (positiveAnswers / totalQuestions) * 100 : 0;

    // Atualizar o progresso do KPI para o dia específico e recalcular o progresso mensal
    setKpiData(prevData => {
      const updatedData = prevData.map(k => {
        if (k.id === kpiId) {
          // Atualizar o progresso para o dia específico
          const updatedProgress = { ...(k.progress || {}), [day.toString()]: progressValue };
          
          // Criar KPI atualizado com o novo progresso diário
          const updatedKpi = {
            ...k,
            progress: updatedProgress
          };
          
          // Calcular o novo progresso mensal
          const newMonthlyProgress = calculateMonthlyProgress(updatedKpi);
          
          // Retornar KPI com progresso diário e mensal atualizados
          return {
            ...updatedKpi,
            currentProgress: newMonthlyProgress
          };
        }
        return k;
      });
      
      return updatedData;
    });
    
    console.log(`Progresso atualizado para KPI ${kpiId} (Dia ${day}/${daysInCurrentMonth}):`, progressValue.toFixed(0) + '%');
  };
  const sidebarWidth = "100px";

  return (
    <div className="bg-slate-100 w-[100%] h-[100%] text-slate-200 antialiased relative overflow-hidden flex">
      <Card className={`w-[${sidebarWidth}] h-full bg-white shadow-lg rounded-none border-slate-200 z-20 flex-shrink-0`}>
        <CardContent className="p-0 relative h-full flex flex-col items-center pt-10" style={{ backgroundColor: "#ADCDB9" }}>
          <img
            className="w-[70px] h-auto mb-10"
            alt="Logotipo da Empresa"
            src="/tela-principal-logo.svg"
            onError={(e: any) => { e.target.src = 'https://placehold.co/90x50/cccccc/333333?text=Logo+Erro'; }}
          />
          <div className="w-full px-4 mt-[24px] text-[12px]	">
            <h3 className="text-base font-semibold text-white mb-[5px] px-1">Progresso do Mês</h3>
            <div className="bg-white/80 rounded-lg p-3 shadow-inner">
              <div className="text-center mb-2">
                <span className="text-[14px] mt-[5px] font-semibold text-gray-600">
                  Dia {currentDayOfMonth} de {daysInCurrentMonth}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ 
                    width: `${(currentDayOfMonth / daysInCurrentMonth) * 100}%`,
                    transition: 'width 1.5s ease-in-out' // Transição mais suave
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#f0f0f0] dark:bg-slate-800/50">
            <header className="h-16 bg-white dark:bg-slate-800 shadow-md 
                       flex items-center justify-between px-4 sm:px-6 
                       flex-shrink-0 border-gray-200 dark:border-slate-700 z-10 relative"
        >
            {/* Lado Esquerdo: Data (pode servir como descrição) */}
                <div id={modalDescriptionId} className="text-[20px] font-bold ml-[10px] mb-[40px] sm:text-sm text-gray-600 dark:text-slate-300">
                    {today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {/* Para uma descrição mais completa para leitores de tela, você pode adicionar um span oculto: */}
                    <span className="sr-only">. Painel de indicadores chave de performance do projeto.</span>
                </div>

            {/* Centro: Título */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <h1 id={modalTitleId} className="text-md mb-[40px] sm:text-lg font-semibold text-gray-800 dark:text-slate-100">
                          Dashboard KPI
                      </h1>
              </div>

            {/* Lado Direito: Botão de Fechar "X" */}
            {/* Usando DialogClose do shadcn/ui que já tem o ícone X por padrão */}
            <DialogClose 
                onClick={onClose} // Chama a função onClose passada por props
                className="kpi-custom-close-button p-1 mb-[30px] rounded-md text-gray-500 dark:text-slate-400 
                           hover:bg-gray-200 dark:hover:bg-slate-700 
                           hover:text-gray-700 dark:hover:text-slate-200 
                           focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 
                           dark:focus-visible:ring-offset-slate-800 transition-colors"
                aria-label="Fechar modal"
            >
                {/* O SVG do "X" já é renderizado por DialogClose por padrão */}
                {/* Se quiser um SVG customizado, pode colocar aqui, mas o padrão é bom */}
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span className="sr-only">Fechar</span>
            </DialogClose>
        </header>

        <div className="flex-1 p-3 md:p-4 overflow-y-auto bg-background">
          {/* Calendário para seleção de dias (visível apenas quando um KPI está ativo) */}
          {activeKpi && (
            <div className="mb-4 md:mb-6 flex justify-center">
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                <h2 className="text-sm sm:text-base font-medium text-white mb-[15px] text-center">
                            Registrar progresso para: <span className="font-bold text-sky-400">{activeKpi.title}</span>
                        </h2>
              <Calendar
                onChange={handleCalendarChange}
                value={selectedDateForCalendar}
                locale="pt-BR"
                tileClassName={tileClassName}
                minDate={new Date(today.getFullYear(), today.getMonth(), 1)}
                maxDate={today}
                navigationLabel={({ date }) => 
                  date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()
                }
                formatShortWeekday={(locale, date) => 
                  date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 1).toUpperCase()
                }
              />
              </div>
            </div>
          )}

          {/* Grid de KPIs - Aumentado o espaçamento e removida a borda */}
          <div className="w-full max-w-4xl mx-auto
               grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 
               gap-4 md:gap-6 
               mt-[50px] 
               place-items-center">
            {kpiData.map((kpi) => {
              // Usar o progresso mensal para exibição
              const progressValue = kpi.currentProgress || 0;
              const progressBarSize = baseCardWidth * 0.85;
              const progressBarStrokeWidth = baseCardWidth * 0.06;

              return (
                <Card
                  key={kpi.id}
                  className="border-0 mb-[50px] bg-white w-[200px] shadow-md rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleKpiCardClick(kpi, e)}
                >
                  <CardContent className="p-3 md:p-4 relative w-full h-full flex flex-col items-center">
                    <h3 className="text-[28px] md:text-lg font-semibold text-card-foreground mb-[10px] text-center">{kpi.title}</h3>

                    <div className="relative w-full flex-1 flex items-center shadow-[0_1px_3px_rgba(0,0,0,0.1)] justify-center">
                      <CircularProgressBar
                        percentage={progressValue}
                        size={progressBarSize}
                        strokeWidth={progressBarStrokeWidth}
                        baseColor="rgba(71, 85, 105, 0.5)"
                        progressColor={kpi.progressColor}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[26px] font-bold text-gray-800">
                          {progressValue.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Barra de progresso adicional removida conforme solicitado */}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Modal de questionário com estilo inline garantindo fundo branco */}
      {activeKpi && (
        <QuestionnaireModal
          kpi={activeKpi}
          selectedDay={selectedDay}
          onClose={handleCloseModal}
          onSubmit={handleQuestionnaireSubmit}
          isVisible={isModalVisible}
        />
      )}
    </div>
  );
};
