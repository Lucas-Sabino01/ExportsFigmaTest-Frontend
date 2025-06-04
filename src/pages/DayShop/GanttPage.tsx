/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback} from 'react';
import '../../styles/overrides.scss';
import GanttChart from './components/GanttChart';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectGantt, getRncAnnualSummaryByArea, getRncDataForProject, getAvaliacoesForProject } from '../../services/dayShopService';
import { GanttResponseDto, GanttTaskDto } from '../../dtos/GanttDtos';
import { DayShopColumns, avaliacoesColumns, rncSColumns, rncMonthlyMatrixColumns } from './columnDefinitions';
import '../../styles/App.scss';
//import KpiModal from '../components/KpiModal'; // Ajuste o caminho para o seu KpiModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Importe ou defina o tipo MyColumnConfig
import type { MyColumnConfig } from './columnDefinitions';

// IMPORTE O NOVO HEADER:
import MeuHeaderCustomizado from '../../components/MeuHeaderCustomizado'; // Ajuste o caminho
import { Kpi } from '../Kpi';
import { getUsers, UserDto } from '@/services/userService';

const GanttPage = () => {
    const { user } = useAuth();
    const [ganttData, setGanttData] = useState<Partial<GanttResponseDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentProjectId] = useState<number>(1);
    const [currentViewType, setCurrentViewType] = useState<string>('dayshop');
    const isAdmin = user?.role === 'Admin';
    const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
    const [usersDataForGantt, setUsersDataForGantt] = useState<UserDto[]>([]);

    const handleOpenKpiModalRequest = useCallback(() => {
        console.log("GanttPage: Recebido pedido para abrir modal KPI. Abrindo modal...");
        setIsKpiModalOpen(true);
    }, []);
const [activeColumns, setActiveColumns] = useState<MyColumnConfig[]>(DayShopColumns);
    // const [activeRncData, setActiveRncData] = useState<RncDto[]>([]);
    const isGridMode = currentViewType === 'rnc_mes';



    const fetchDataForView = useCallback(async (viewType: string, projectId: number) => {
        console.log(`GanttPage: fetchDataForView INICIADA para view: ${viewType}, projeto: ${projectId}`); // <--- LOG INÍCIO
        // ... (sua função fetchDataForView existente) ...
        setIsLoading(true);
        setErrorMessage(null);
        console.log(`GanttPage: Buscando dados para view: ${viewType}, projeto: ${projectId}`);
        try {
          // --- BUSQUE OS USUÁRIOS AQUI NO INÍCIO ---
            const fetchedUsers = await getUsers();
            setUsersDataForGantt(fetchedUsers); // Atualiza o estado dos usuários para o GanttChart

            const usersAsResources = fetchedUsers.map(user => ({
                id: user.id,
                name: user.name,
            }));

        let newColumns: MyColumnConfig[] = activeColumns;
        let finalGanttResponseData: Partial<GanttResponseDto> | null = null;

            if (viewType === 'dayshop') {
                console.log("fetchDataForView: Entrou no bloco DAYSHOP");
                const rawData = await getProjectGantt(projectId);
                if (rawData && rawData.tasks && rawData.tasks.rows) {
                    const mappedTasks = rawData.tasks.rows.map(task => ({
                        id: task.id,
                        name: task.name,
                        startDate: task.startDate, // Bryntum espera string ISO ou Date
                        duration: task.duration,
                        endDate: task.endDate,
                        progress: task.progress,
                        parentId: task.parentId,
                        expanded: task.expanded === undefined ? true : task.expanded,
                        dependencies: task.dependencies, // Se for string JSON de IDs

                        // Mapeie os campos customizados (camelCase para camelCase)
                        pri: task.pri,
                        bu: task.bu,
                        pcs: task.pcs,
                        cliente: task.cliente,
                        item: task.item,
                        dataEntrega: task.dataEntrega ? new Date(task.dataEntrega) : null, // CORRETO: Deixa como objeto Date
                        dataReprog: task.dataReprog ? new Date(task.dataReprog) : null,   // CORRETO: Deixa como objeto Date
                        status: task.status,
                        responsibleId: task.responsibleId,
                        observacoes: task.observacoes, // Para o campo geral de observações
                        note: task.note,         // Para a aba "Notas" do Bryntum (campo 'note' do TaskModel)

                        // Outros campos que o Bryntum possa usar ou que você queira no TaskModel
                        itemAvaliado: task.itemAvaliado,
                        opReferencia: task.opReferencia,
                        resultado: task.resultado,
                        dataAvaliacao: task.dataAvaliacao,
                        responsavel: task.responsavel,
                    }));
                    finalGanttResponseData = {
                        ...rawData,
                        tasks: { rows: mappedTasks },
                        resources: { rows: usersAsResources }, // Substitui resources com os usuários
                        assignments: { rows: [] }
                    };
                } else {
                    finalGanttResponseData = rawData;
                }
                newColumns = DayShopColumns;
            } else if (viewType === 'avaliacoes') {
                console.log("fetchDataForView: Entrou no bloco AVALIACOES");
                setIsLoading(true);
                try {
                    const avaliacoesData = await getAvaliacoesForProject(projectId);

                    const mappedAvaliacoesAsTasks = avaliacoesData.map(av => ({
                        id: av.id,
                        name: av.name || `${av.pcs || ''} - ${av.equipamento || ''}`,
                        startDate: av.startDate || av.dataReceb, // Ou new Date(av.startDate || av.dataReceb) se necessário
                        duration: av.duration === undefined || av.duration === null ? 1 : av.duration,
                        durationUnit: av.durationUnit || 'day',
                        endDate: av.endDate,
                        progress: av.progress === undefined || av.progress === null ? 0 : av.progress,
                        leaf: true,

                        // MAPEAMENTO EXPLÍCITO DE TODOS OS CAMPOS USADOS NAS COLUNAS
                        pri: av.pri,
                        pcs: av.pcs,
                        cliente: av.cliente,
                        equipamento: av.equipamento,
                        // Converta para Date se Bryntum tiver problemas com as strings, mas geralmente ISO strings funcionam com type: 'date'
                        dataReceb: av.dataReceb ? new Date(av.dataReceb) : null,
                        serviceInicio: av.serviceInicio ? new Date(av.serviceInicio) : null,
                        serviceReprog: av.serviceReprog ? new Date(av.serviceReprog) : null,
                        engEquipInicio: av.engEquipInicio ? new Date(av.engEquipInicio) : null,
                        engEquipReprog: av.engEquipReprog ? new Date(av.engEquipReprog) : null,
                        engManufInicio: av.engManufInicio ? new Date(av.engManufInicio) : null,
                        engManufReprog: av.engManufReprog ? new Date(av.engManufReprog) : null,
                        pcpInicio: av.pcpInicio ? new Date(av.pcpInicio) : null,
                        pcpReprog: av.pcpReprog ? new Date(av.pcpReprog) : null,
                        montInicio: av.montInicio ? new Date(av.montInicio) : null,
                        montReprog: av.montReprog ? new Date(av.montReprog) : null,
                        caldInicio: av.caldInicio ? new Date(av.caldInicio) : null,
                        caldReprog: av.caldReprog ? new Date(av.caldReprog) : null,
                        cqInicio: av.cqInicio ? new Date(av.cqInicio) : null,
                        cqReprog: av.cqReprog ? new Date(av.cqReprog) : null,
                        usinInicio: av.usinInicio ? new Date(av.usinInicio) : null,
                        usinReprog: av.usinReprog ? new Date(av.usinReprog) : null,
                        relCqInicio: av.relCqInicio ? new Date(av.relCqInicio) : null,
                        relCqReprog: av.relCqReprog ? new Date(av.relCqReprog) : null,
                        orcamInicio: av.orcamInicio ? new Date(av.orcamInicio) : null,
                        orcamReprog: av.orcamReprog ? new Date(av.orcamReprog) : null,
                        dataEntregaFinalInicio: av.dataEntregaFinalInicio ? new Date(av.dataEntregaFinalInicio) : null,
                        dataEntregaFinalReprog: av.dataEntregaFinalReprog ? new Date(av.dataEntregaFinalReprog) : null,
                        observacoes: av.observacoes,
                        note: av.note,
                        // Adicione quaisquer outros campos que o Bryntum precise ou que você queira ter no registro
                        }));

                        finalGanttResponseData = {
                            success: true,
                            project: ganttData?.project || { /* projeto dummy mínimo */
                                id: `avaliacoes-proj-${projectId}`, name: `Avaliações Projeto ${projectId}`,
                                startDate: new Date().toISOString(), calendar: 'general',
                                hoursPerDay: 8, daysPerWeek: 5, daysPerMonth: 20, durationUnit: 'day'
                            },
                            tasks: { rows: mappedAvaliacoesAsTasks as any[] }, // Cast se necessário
                            dependencies: { rows: [] }, // Avaliações podem não ter dependências inicialmente
                            resources: ganttData?.resources || { rows: [] },
                            assignments: ganttData?.assignments || { rows: [] },
                            calendars: ganttData?.calendars || { rows: [] },
                        };
                        newColumns = avaliacoesColumns;
                    } catch (err: any) {
                        console.error(`Erro ao buscar dados para ${viewType}:`, err);
                        setErrorMessage(err.message || err.toString());
                        setGanttData(null);
                        // Considerar se quer voltar para colunas padrão em caso de erro
                        // setActiveColumns(DayShopColumns);
                    } finally {
                        setIsLoading(false);
                    }
                } else if (viewType === 'rnc') {
                    console.log("fetchDataForView: Entrou no bloco RNC");
                    const rncDataFromApi = await getRncDataForProject(projectId);
                    console.log("Dados RNC da API (rncDataFromApi):", rncDataFromApi);
                const mappedRncAsTasks = rncDataFromApi.map(rnc => {
                    return {
                        id: rnc.id,
                        name: rnc.equipamento || rnc.idRnc || `RNC ${rnc.id}`, // ESSENCIAL: Este 'name' será usado pela NameColumn oculta
                        // Mapeie todos os outros campos que suas rncSColumns esperam:
                        relator: rnc.relator,
                        idRnc: rnc.idRnc, // O ID visual da RNC
                        dataRnc: rnc.dataRnc ? new Date(rnc.dataRnc) : null,
                        equipamento: rnc.equipamento,
                        pcs: rnc.pcs,
                        responsavelRnc: rnc.responsavelRnc,
                        procRnc: rnc.procRnc,
                        engERnc: rnc.engERnc,
                        opRnc: rnc.opRnc,
                        fabRnc: rnc.fabRnc,
                        supRnc: rnc.supRnc,
                        ifRnc: rnc.ifRnc,
                        descricaoRnc: rnc.descricaoRnc, // <<<--- Supondo que RncDto tenha 'Observacoes'
                        note: rnc.note,
                        setorOrigem: rnc.setorOrigem,
                        // ... outros campos que o RncDto possa ter e sejam relevantes para a visualização ou edição ...
                        // Campos que o Bryntum TaskModel espera, se não forem preenchidos pelos dados do RNC:
                        startDate: rnc.startDateGantt || rnc.dataRnc || new Date(),
                        duration: rnc.durationGantt !== undefined ? rnc.durationGantt : 0, // RNCs podem ser milestones
                        durationUnit: rnc.durationUnitGantt || 'day',
                        endDate: rnc.endDateGantt, // Bryntum pode calcular se duration e startDate estiverem definidos
                        leaf: true, // Se RNCs não têm filhos
                    };
                }) as unknown as GanttTaskDto[]; // Cast para o tipo esperado por tasks.rows

                finalGanttResponseData = { 
                    success: true,
                    project: ganttData?.project || { name: `RNCs Projeto ${projectId}`, startDate: new Date().toISOString(), calendar: "general", hoursPerDay: 8, daysPerMonth: 20, daysPerWeek: 5 },
                    tasks: { rows: mappedRncAsTasks },
                    dependencies: { rows: [] }, 
                    resources: ganttData?.resources || { rows: [] },    
                    assignments: ganttData?.assignments || { rows: [] },
                    calendars: ganttData?.calendars || {rows:[]}
                };
                newColumns = rncSColumns;
            } else if (viewType === 'rnc_mes') {
                console.log("fetchDataForView: Entrou no bloco RNC-MES (Matriz Anual)");
        setIsLoading(true); // Garanta que o loading seja setado

        // TODO: Implementar seleção de ano na UI. Por enquanto, usa o ano atual.
        const yearToFetch = new Date().getFullYear();
        // Você pode querer adicionar um estado para 'selectedYear' e um componente para mudá-lo.

        try {
            const summaryDataFromApi = await getRncAnnualSummaryByArea(projectId, yearToFetch);
            console.log("RNC-MES - Dados da API:", JSON.stringify(summaryDataFromApi, null, 2)); // LOG

            const mappedDataForGrid = summaryDataFromApi.map(item => ({
                id: item.id,
                name: item.areaOuSetor, // Para a coluna principal
                areaOuSetor: item.areaOuSetor,
                jan: item.jan,
                fev: item.fev,
                mar: item.mar,
                abr: item.abr,
                mai: item.mai,
                jun: item.jun,
                jul: item.jul,
                ago: item.ago,
                septCount: item.septCount, // Verifique se item.septCount tem o valor aqui
                out: item.out,
                nov: item.nov,
                dez: item.dez,
                totalAnual: item.totalAnual,
                leaf: true,
                iconCls: 'b-fa b-fa-table'
            }));
            console.log("RNC-MES - Dados Mapeados para Grid:", JSON.stringify(mappedDataForGrid, null, 2)); // LOG

            finalGanttResponseData = {
                success: true,
                project: { // Um "projeto" dummy para a estrutura do Bryntum
                    id: `rnc-matriz-${projectId}-${yearToFetch}`, // ID único para o "projeto" desta view
                    name: `RNC Controle Mensal por Área - ${yearToFetch}`,
                    startDate: new Date(yearToFetch, 0, 1).toISOString(), // Início do ano
                    // Adicione outras propriedades de projeto se o Bryntum as exigir
                    // como um calendário padrão, mesmo que não seja usado.
                    calendar: ganttData?.project?.calendar || 'general',
                    // --- ADICIONE ESTAS PROPRIEDADES COM VALORES PADRÃO ---
                    hoursPerDay: ganttData?.project?.hoursPerDay || 8,
                    daysPerWeek: ganttData?.project?.daysPerWeek || 5,
                    daysPerMonth: ganttData?.project?.daysPerMonth || 20,
                    // É uma boa prática incluir a unidade de duração também, se fizer parte do DTO
                    durationUnit: ganttData?.project?.durationUnit || 'day',
                },
                tasks: { rows: mappedDataForGrid as any[] }, // Os dados da sua matriz
                // O resto pode ser vazio para esta view tipo grid
                dependencies: { rows: [] },
                resources: { rows: [] },
                assignments: { rows: [] },
                calendars: ganttData?.calendars || { rows: [] } // Reutilize calendários se necessário, ou envie vazio
            };
            // Sinalize para o GanttChart que esta é uma view especial (opcional)
                // setGanttChartMode('grid'); // Exemplo de como você poderia fazer isso
            } catch (err: any) {
                console.error(`Erro ao buscar dados para ${viewType}:`, err);
                setErrorMessage(err.message || err.toString());
                setGanttData(null); // Limpa dados em caso de erro
                // setActiveColumns(DayShopColumns); // Ou colunas padrão para erro
            } finally {
                setIsLoading(false);
            }
            newColumns = rncMonthlyMatrixColumns; // As novas colunas para a matriz
        } else {
            console.error(`View type desconhecido: ${viewType}`);
            setErrorMessage(`Visualização '${viewType}' não implementada.`);
            setGanttData(null);
            setActiveColumns(DayShopColumns); // Volta para colunas padrão
            setIsLoading(false);
            return;
        }
        console.log(`Dados processados para view '${viewType}':`, finalGanttResponseData);
        setGanttData(finalGanttResponseData);
            setCurrentViewType(viewType);
            setGanttData(finalGanttResponseData);
            setActiveColumns(newColumns);

        } catch (err: any) {
            console.error(`Erro ao buscar dados para ${viewType}:`, err);
            setErrorMessage(err.message || err.toString());
            setGanttData(null);
            setActiveColumns(DayShopColumns); 
        } finally {
            setIsLoading(false);
        }
        // Adicionadas dependências que podem afetar a busca ou o estado de fallback
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentProjectId, activeColumns]);

    useEffect(() => {
        fetchDataForView(currentViewType, currentProjectId);
    }, [fetchDataForView, currentViewType, currentProjectId]);

    // Função para passar como callback de sucesso do upload
    const handleUploadSuccess = useCallback(() => {
    console.log(`handleUploadSuccess: Recarregando dados para view ATUAL: ${currentViewType}, projeto: ${currentProjectId}`);
    fetchDataForView(currentViewType, currentProjectId);
    }, [currentViewType, currentProjectId, fetchDataForView]); // fetchDataForView já é memorizado
    const handleToolbarRequestViewLoad = useCallback((viewTypeFromToolbar: string) => {
    fetchDataForView(viewTypeFromToolbar, currentProjectId);
}, [fetchDataForView, currentProjectId]); // fetchDataForView já é memorizado

    

    return (
        <>
            {/* USE O NOVO HEADER AQUI */}
            <MeuHeaderCustomizado
                title="Valmet" // Ou pegue dinamicamente se necessário
                projectId={currentProjectId}
                onUploadSuccess={handleUploadSuccess}
                isAdmin={isAdmin}
                currentViewType={currentViewType} />
                

                {isLoading && <p className="text-center p-10">Carregando dados...</p>}
            {errorMessage && <p className="text-center p-10 text-red-600">Erro: {errorMessage}</p>}

            {/* --- CORREÇÃO 3: RENDERIZAÇÃO CONDICIONAL COM usersDataForGantt --- */}
            {/* O GanttChart só é montado quando todos os dados (ganttData e usersDataForGantt) estiverem prontos */}
            {!isLoading && !errorMessage && ganttData && usersDataForGantt.length > 0 && (
                <div className="h-full w-full">
                    <GanttChart
                        tasksData={ganttData.tasks?.rows || []}
                        resourcesData={ganttData.resources?.rows || []}
                        assignmentsData={ganttData.assignments?.rows || []}
                        dependenciesData={ganttData.dependencies?.rows || []}
                        calendarsData={ganttData.calendars?.rows || []}
                        currentViewType={currentViewType}
                        columnsConfig={activeColumns}
                        projectStartDate={ganttData.project?.startDate}
                        readOnly={!isAdmin}
                        currentProjectId={currentProjectId}
                        onToolbarRequestViewLoad={handleToolbarRequestViewLoad}
                        onOpenKpiModalRequest={handleOpenKpiModalRequest}
                        isGridMode={isGridMode}
                        usersData={usersDataForGantt} // --- CORREÇÃO 4: PASSE O ESTADO usersDataForGantt ---
                    />
                    
                </div>
        

                )}{/* Modal KPI usando Shadcn UI Dialog */}
                <Dialog open={isKpiModalOpen} onOpenChange={setIsKpiModalOpen}>
            <DialogContent 
                className="p-0 shadow-2xl antialiased 
                           w-[95vw] sm:w-[90vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 
                           h-[85vh] max-h-[850px] 
                           flex flex-col overflow-hidden 
                           text-slate-100 
                           bg-slate-800 
                           bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-800 to-slate-900
                           border-4 border-[#009B3A] rounded-[15px]"
                           aria-labelledby={isKpiModalOpen ? "kpi-dashboard-title" : undefined}
                           aria-describedby={isKpiModalOpen ? "kpi-dashboard-description" : undefined}  
            >
                <DialogTitle className="sr-only">Dashboard KPI</DialogTitle>
                <DialogDescription className="sr-only">
                    Painel para visualização e gerenciamento dos indicadores chave de performance do projeto.
                </DialogDescription>

                {/* Corpo do Modal onde Kpi.tsx é renderizado */}
                {/* 'flex-grow' permite que esta div ocupe o espaço vertical restante. 
                    'overflow-hidden' para que Kpi.tsx gerencie seu próprio scroll interno. */}
                <div className="flex-grow overflow-hidden">
                    {/* Kpi.tsx deve ter h-full w-full e seu próprio overflow-y-auto na sua área de conteúdo principal */}
                    {isKpiModalOpen && (
                        <Kpi 
                            onClose={() => setIsKpiModalOpen(false)} // <<<< CORREÇÃO APLICADA AQUI
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default GanttPage;

