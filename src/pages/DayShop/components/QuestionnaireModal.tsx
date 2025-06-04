/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { getKpiAnswers } from "../../../services/kpiService"; // AJUSTE O CAMINHO
import Draggable from "react-draggable";

interface KpiItemData {
  id: number;
  title: string;
  progressColor: string;
  questions?: { id: string; text: string; type: 'yesno' | 'text' }[];
}

interface QuestionnaireModalProps {
  kpi: KpiItemData;
  selectedDay: number;
  onClose: () => void;
  onSubmit: (kpiId: number, day: number, answers: Record<string, any>) => void;
  isVisible: boolean;
}

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ 
  kpi, 
  selectedDay, 
  onClose, 
  onSubmit, 
  isVisible,
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleSubmit = () => {
    onSubmit(kpi.id, selectedDay, answers);
    onClose();
  };
  
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDayOfMonth.getDate() - today.getDate() + 1;
  const currentMonth = today.toLocaleString('pt-BR', { month: 'long' });

   // NOVO useEffect MODIFICADO (substitua o de cima por este):
  useEffect(() => {
    // Busca dados apenas se o modal estiver visível e tivermos um kpi e dia válidos
    if (isVisible && kpi && kpi.id && selectedDay > 0) {
      const fetchAnswers = async () => {
        setIsLoadingAnswers(true);
        setLoadError(null);
        console.log(`QuestionnaireModal: Buscando respostas para KPI ID: ${kpi.id}, Dia: ${selectedDay}`);
        try {
          // Chame sua função de serviço aqui
          const fetchedAnswers = await getKpiAnswers(kpi.id, selectedDay);
          setAnswers(fetchedAnswers || {}); // Define como objeto vazio se a API retornar null/undefined
          console.log("QuestionnaireModal: Respostas carregadas da API:", fetchedAnswers);
        } catch (error: any) {
          console.error("QuestionnaireModal: Erro ao buscar respostas do KPI:", error);
          setLoadError(error.message || "Falha ao carregar respostas. Tente novamente.");
          setAnswers({}); // Opcional: limpar respostas em caso de erro
        } finally {
          setIsLoadingAnswers(false);
        }
      };
      
      fetchAnswers();
    } else if (!isVisible) {
      // Opcional: Limpar o estado quando o modal é fechado, para não mostrar dados antigos
      // se o usuário abrir o modal para um KPI/dia diferente sem que novos dados sejam carregados.
      // setAnswers({});
      // setLoadError(null);
    }
  }, [isVisible, kpi, selectedDay]); // Dependências: executa se isVisible, kpi ou selectedDay mudar

  // Estilos inline para garantir que o modal tenha fundo branco
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: isVisible ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    border: '1px solid #E5E7EB'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E7EB'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: kpi.progressColor || '#1F2937'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#6B7280',
    marginTop: '4px'
  };

  const infoBoxStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px'
  };

  const dayCircleStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4F46E5'
  };

  const questionsContainerStyle: React.CSSProperties = {
    maxHeight: '45vh',
    overflowY: 'auto',
    marginBottom: '24px',
    backgroundColor: '#FFFFFF',
    padding: '8px'
  };

  const questionBoxStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const questionLabelStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: '16px',
    display: 'block'
  };

  const buttonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '8px'
  };

  const buttonBaseStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    border: '1px solid #E5E7EB'
  };

  const yesButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    ...buttonBaseStyle,
    backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
    color: isSelected ? '#FFFFFF' : '#1F2937',
    borderColor: isSelected ? '#10B981' : '#E5E7EB'
  });

  const noButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    ...buttonBaseStyle,
    backgroundColor: isSelected ? '#EF4444' : '#FFFFFF',
    color: isSelected ? '#FFFFFF' : '#1F2937',
    borderColor: isSelected ? '#EF4444' : '#E5E7EB'
  });

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB'
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#FFFFFF',
    color: '#4B5563',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  const submitButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };



  if (!isVisible) return null;

  return (
    <div style={overlayStyle}>
      <Draggable nodeRef={nodeRef as any} handle=".draggable-modal-handle">
        <div ref={nodeRef} style={modalStyle}>
          <div style={headerStyle} className="draggable-modal-handle cursor-move">
            <div>
              <h2 style={titleStyle}>{kpi.title}</h2>
              <p style={subtitleStyle}>Dia {selectedDay} de {currentMonth}</p>
            </div>
            <button 
              onClick={onClose} 
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                color: '#9CA3AF'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={infoBoxStyle}>
            <div>
              <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '4px' }}>
                Progresso do Mês: <span style={{ fontWeight: 'bold', color: '#4F46E5' }}>
                  {((selectedDay / lastDayOfMonth.getDate()) * 100).toFixed(0)}%
                </span>
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                Dias restantes: <span style={{ fontWeight: '600' }}>{daysRemaining}</span>
              </p>
            </div>
            <div style={dayCircleStyle}>
              {selectedDay}
            </div>
          </div>

              {/* --- INÍCIO DAS ALTERAÇÕES --- */}

        {/* 1. MOSTRAR MENSAGEM DE CARREGAMENTO */}
        {isLoadingAnswers && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', fontSize: '16px' }}>
            Carregando respostas...
          </div>
        )}

        {/* 2. MOSTRAR MENSAGEM DE ERRO */}
        {loadError && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'red', fontSize: '16px' }}>
            Erro ao carregar: {loadError}
          </div>
        )}

        {/* 3. MOSTRAR PERGUNTAS SOMENTE SE NÃO ESTIVER CARREGANDO E NÃO HOUVER ERRO */}
        {!isLoadingAnswers && !loadError && (
          <div style={questionsContainerStyle}>
            {(kpi.questions || []).map(q => (
              <div key={q.id} style={questionBoxStyle}>
                <label style={questionLabelStyle}>{q.text}</label>
                {q.type === 'yesno' && (
                  <div style={buttonsContainerStyle}>
                    <button 
                      onClick={() => handleInputChange(q.id, 'yes')} 
                      style={yesButtonStyle(answers[q.id] === 'yes')}
                    >Sim</button>
                    <button 
                      onClick={() => handleInputChange(q.id, 'no')} 
                      style={noButtonStyle(answers[q.id] === 'no')}
                    >Não</button>
                  </div>
                )}
                {q.type === 'text' && (
                  <input 
                    type="text" 
                    value={answers[q.id] || ''} 
                    onChange={(e) => handleInputChange(q.id, e.target.value)} 
                    placeholder="Sua resposta..." 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                )}
              </div>
            ))}
            {(!kpi.questions || kpi.questions.length === 0) && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: '#6B7280',
                fontSize: '16px'
              }}>
                Nenhuma pergunta definida para este KPI.
              </div>
            )}
          </div>
        )}
        
        {/* --- FIM DAS ALTERAÇÕES --- */}
          
          <div style={footerStyle}>
            <button onClick={onClose} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button onClick={handleSubmit} style={submitButtonStyle}>
              Salvar Progresso
            </button>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default QuestionnaireModal;
