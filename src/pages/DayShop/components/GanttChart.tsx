import '@bryntum/gantt/gantt.module.js';
import { useRef, useEffect, useMemo } from 'react';
import { BryntumGantt, BryntumGanttProjectModel, BryntumGanttProps } from '@bryntum/gantt-react';
import { projectProps } from './GanttProjectProps'; // Suas props estáticas
import { ganttProps as staticGanttPropsConfig } from './GanttProps';       // Suas props estáticas
import { GanttTaskDto, ResourceDto, AssignmentDto, CreateGanttTaskDto, UpdateGanttTaskDto, DependencyDto, CalendarDto, CreateRncDto, UpdateRncDto, CreateAvaliacaoDto, UpdateAvaliacaoDto } from '../../../dtos/GanttDtos';
import { createTask, updateTask, deleteTask, createDependency, deleteDependency, updateDependency, createRnc, updateRnc, deleteRnc, createAvaliacao, updateAvaliacao, deleteAvaliacao } from '../../../services/dayShopService';
import CustomTask from '../lib/Task'; // Certifique-se que este caminho está correto
import { UserDto } from '../../../services/userService';
import { DependencyModel, TaskModel, ProjectModel, WriteExcelFileProvider } from '@bryntum/gantt'; // Adicione ProjectModel
import { MyColumnConfig } from '../columnDefinitions';
import zipcelx from 'zipcelx';

// Simulação de um objeto Toast se você não tiver um pronto
const Toast = {
    show: (message: string) => {
        console.warn("TOAST (simulado):", message);
        alert(message); // Fallback simples com alert
    }
};

if (typeof window !== 'undefined') {
    (globalThis as any).WriteExcelFileProvider = WriteExcelFileProvider;
}
if (typeof window !== 'undefined') {
    (globalThis as any).zipcelx = zipcelx;
}

interface CustomGanttProps extends BryntumGanttProps {
    tasksData: GanttTaskDto[];
    resourcesData: ResourceDto[];
    assignmentsData: AssignmentDto[];
    dependenciesData: DependencyDto[];
    calendarsData: CalendarDto[];
    columnsConfig: MyColumnConfig[];
    projectStartDate?: string;
    currentViewType: string;
    readOnly: boolean;
    usersData: UserDto[];
    onDataChange?: () => void; // Renomeado para notifyParentOfChange abaixo para clareza
    currentProjectId: number;
    onToolbarRequestViewLoad: (viewType: string) => void;
    onOpenKpiModalRequest?: () => void;
    isGridMode?: boolean; // Adicionado para controlar o modo de grid/timeline
}

const GanttChart = (props: CustomGanttProps) => {
    const ganttRef = useRef<BryntumGantt>(null);
    const projectRef = useRef<BryntumGanttProjectModel>(null);
    const isCurrentlySyncing = useRef(false); // Para evitar loops
    const isLoadingData = useRef(false); // <--- NOVO: Flag para ignorar eventos durante o load
    const memoizedSubGridConfigs = useMemo(() => {
        return {
            normal: props.isGridMode ? { width: 0, collapsed: true } : { flex: 2 }
        };
    }, [props.isGridMode]);
    const {
        tasksData,
        resourcesData,
        assignmentsData,
        dependenciesData,
        calendarsData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        columnsConfig,
        readOnly,
        usersData,
        currentViewType, // Usaremos esta variável desestruturada
        onDataChange: notifyParentOfChange,
        currentProjectId,
        isGridMode,
        onToolbarRequestViewLoad,
        onOpenKpiModalRequest,
        ...restGanttProps
    } = props;


    


    const finalBryntumConfig = useMemo(() => {
    // Cria cópias profundas para evitar mutações inesperadas nas props originais
    const config = JSON.parse(JSON.stringify(staticGanttPropsConfig));
    const finalColumns = JSON.parse(JSON.stringify(props.columnsConfig)) as MyColumnConfig[]; // Use props.columnsConfig

    // --- 1. CONFIGURAR O RENDERER PARA A COLUNA 'responsibleId' NA GRADE ---
    const responsibleColumn = finalColumns.find(col => col.field === 'responsibleId');
    if (responsibleColumn) {
        console.log("Adicionando renderer para a coluna 'responsibleId'.");
        responsibleColumn.renderer = ({ value }: { value: number | null | undefined }) => {
            if (value === null || value === undefined) {
                return ''; // Ou 'Não atribuído', se preferir
            }
            // 'props.usersData' é a lista de usuários passada via props
            const user = props.usersData.find(u => u.id === value);
            return user ? user.name : value.toString(); // Exibe nome ou ID como fallback
        };

        // O código que você tinha para o editor da COLUNA pode ser mantido se necessário,
        // apenas garanta que ele use props.usersData e displayField: 'text'.
        // Exemplo, se o editor da coluna for um combo:
        if (responsibleColumn.editor && typeof responsibleColumn.editor === 'object') {
             (responsibleColumn.editor as { items: any; displayField?: string; valueField?: string; type?: string }).items = props.usersData.map(user => ({ id: user.id, text: user.name }));
             (responsibleColumn.editor as { items: any; displayField?: string; valueField?: string; type?: string }).displayField = 'text'; // Para corresponder a 'text' em items
             // (responsibleColumn.editor as any).valueField = 'id'; // Geralmente já é o padrão ou herdado
             // (responsibleColumn.editor as any).type = 'combo'; // Se não estiver definido
             console.log("Editor da COLUNA 'responsibleId' atualizado com props.usersData.");
        }

    } else {
        console.warn("Coluna 'responsibleId' não encontrada em props.columnsConfig para adicionar renderer.");
    }
    config.columns = finalColumns; // Atribui as colunas (potencialmente modificadas)

    // --- 2. AJUSTAR O CAMPO 'responsibleId' NO EDITOR DE TAREFAS (taskEditFeature) ---
    if (config.taskEditFeature && config.taskEditFeature.editorConfig && config.taskEditFeature.editorConfig.tabs?.general?.items) {
        const generalItems = config.taskEditFeature.editorConfig.tabs.general.items;
        if (generalItems.responsibleId) {
            // Usa props.usersData para popular os itens do ComboBox
            generalItems.responsibleId.items = props.usersData.map(user => ({ id: user.id, text: user.name }));
            // Garante que valueField e displayField estão corretos
            generalItems.responsibleId.valueField = 'id';
            generalItems.responsibleId.displayField = 'text'; // Importante: 'text' para corresponder ao mapeamento de items
            // Assegure-se que outros campos do combo estão como você espera:
            // generalItems.responsibleId.type = 'combo'; // Já deve estar
            // generalItems.responsibleId.editable = false;
            // generalItems.responsibleId.clearable = true;
            console.log("Editor de TAREFAS (aba geral): Campo 'responsibleId' atualizado com props.usersData.");
        }
    }
    // Preserva o restante da sua configuração de taskEditFeature
    // Se config.taskEditFeature não existir, você pode precisar reconstruí-lo aqui
    // baseado no staticGanttPropsConfig.taskEditFeature e então modificar o item responsibleId.
    // Exemplo (se config.taskEditFeature puder ser undefined):
    else if (staticGanttPropsConfig.taskEditFeature) {
        config.taskEditFeature = JSON.parse(JSON.stringify(staticGanttPropsConfig.taskEditFeature)); // Copia do estático
        if (config.taskEditFeature.editorConfig?.tabs?.general?.items?.responsibleId) {
            const generalItems = config.taskEditFeature.editorConfig.tabs.general.items;
            generalItems.responsibleId.items = props.usersData.map(user => ({ id: user.id, text: user.name }));
            generalItems.responsibleId.valueField = 'id';
            generalItems.responsibleId.displayField = 'text';
            console.log("Editor de TAREFAS (copiado do estático e atualizado): Campo 'responsibleId' com props.usersData.");
        }
    }


    // Demais configurações
    config.readOnly = props.readOnly; // Use props.readOnly
    // config.project = projectRef; // Removido: 'project' é passado diretamente ao <BryntumGantt />
    config.subGridConfigs = memoizedSubGridConfigs;

    // console.log("Bryntum Config FINAL:", JSON.parse(JSON.stringify(config))); // Log para depuração

    return config;
// A dependência 'users' (estado local) foi removida.
// A dependência correta para os dados dos usuários é 'props.usersData'.
// 'columnsConfig' foi trocado por 'props.columnsConfig' para clareza de onde vem.
// 'readOnly' foi trocado por 'props.readOnly'.
}, [props.columnsConfig, props.readOnly, memoizedSubGridConfigs, props.usersData]);



    

    // EFEITO 1: Carregar dados no Bryntum ProjectModel quando as props mudam
    useEffect(() => {
        const project = projectRef.current?.instance;
        const ganttInstance = ganttRef.current?.instance;
        if (project && tasksData && ganttInstance) {
            console.log("GanttChart: EFEITO 1 - Carregando dados via props no Bryntum ProjectModel...");
            isLoadingData.current = true; // <--- NOVO: Ativa a flag ANTES de carregar
            project.taskStore.modelClass = CustomTask;
            project.loadInlineData({
                tasksData: tasksData.map(task => ({
                    ...task,
                    startDate: new Date(task.startDate|| Date.now()),
                    endDate: task.endDate ? new Date(task.endDate) : undefined,
                    dataAvaliacao: task.dataAvaliacao ? new Date(task.dataAvaliacao) : undefined,
                    percentDone: task.progress !== undefined ? task.progress * 100 : 0,
                    // Se RNC não tem duração, defina como 0 (milestone) ou 1
                    duration: task.duration !== undefined ? task.duration : (currentViewType === 'rnc' ? 0 : 1),
                })),
                resourcesData,
                assignmentsData,
                dependenciesData: dependenciesData.map(dep => ({
                    id: dep.id,
                    fromEvent: dep.fromTask,
                    toEvent: dep.toTask,
                    type: dep.type,
                    lag: dep.lag,
                    lagUnit: dep.lagUnit,
                    cls: dep.cls
                })),
                calendarsData: props.calendarsData, // Pode usar props.calendarsData ou calendarsData desestruturado
            }).then(() => {
                 console.log("GanttChart: EFEITO 1 - loadInlineData CONCLUÍDO.");
                 // Atraso pequeno para garantir que eventos de 'dataset' passem antes de reativar
                 setTimeout(() => {
                    isLoadingData.current = false; // <--- NOVO: Desativa a flag DEPOIS (com atraso)
                    console.log("GanttChart: EFEITO 1 - Flag isLoadingData desativada.");
                 }, 200); // Ajuste o tempo se necessário
            });
        }
        
    }, [tasksData, resourcesData, assignmentsData, dependenciesData, calendarsData, props.calendarsData, projectRef, readOnly, currentViewType, finalBryntumConfig.taskEditFeature]); // Adicionei props.calendarsData se você o usar diretamente acima, ou use calendarsData desestruturado

    

    useEffect(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            console.log("GanttChart: EFEITO 2 - Listener para 'requestingViewLoad' da Toolbar adicionado.");
            const detacher = gantt.on('requestingViewLoad', ({ viewType }: { viewType: string; viewName: string }) => {
                console.log(`GanttChart: EFEITO 2 - Evento 'requestingViewLoad' recebido para viewType: ${viewType}`);
                if (onToolbarRequestViewLoad) {
                    onToolbarRequestViewLoad(viewType);
                }
            });
            return () => {
                detacher();
            };
        }
        return undefined;
    }, [ganttRef, onToolbarRequestViewLoad]);

    useEffect(() => {
        const gantt = ganttRef.current?.instance;
        // Verifica se a prop onOpenKpiModalRequest foi passada
        if (gantt && onOpenKpiModalRequest) {
            const detacher = gantt.on('requestKpiModalOpen', onOpenKpiModalRequest);
            console.log("GanttChart: Listener para 'requestKpiModalOpen' adicionado.");
            return () => {
                if (gantt && !gantt.isDestroyed) { // Verifica se gantt ainda existe e não foi destruído
                    detacher();
                }
                console.log("GanttChart: Listener para 'requestKpiModalOpen' removido.");
            };
        }
        return undefined;
    }, [ganttRef, onOpenKpiModalRequest]);

    // EFEITO 2: Listener para 'requestingViewLoad' da Toolbar
    useEffect(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt && isGridMode) {
            // Esconde a subgrid da timeline
            if (gantt.subGrids.normal) { // 'normal' é geralmente a timeline
                gantt.subGrids.normal.hide();
            }
            // Desabilita features de edição de tarefa se for só leitura
            if (gantt.features.taskEdit) gantt.features.taskEdit.disabled = true;
            if (gantt.features.cellEdit) gantt.features.cellEdit.disabled = true;
            if (gantt.features.dependencies) gantt.features.dependencies.disabled = true;
            // etc.
        } else if (gantt && !isGridMode) {
            // Garante que a timeline está visível para outras views
             if (gantt.subGrids.normal) {
                gantt.subGrids.normal.show();
            }
            // Reabilita features
            if (gantt.features.taskEdit) gantt.features.taskEdit.disabled = props.readOnly; // Respeita o readOnly geral
            if (gantt.features.cellEdit) gantt.features.cellEdit.disabled = false; // Ou props.readOnly
            if (gantt.features.dependencies) gantt.features.dependencies.disabled = false;
        }
    }, [isGridMode, ganttRef, props.readOnly]);


    // Função para lidar com o evento global dataChange
    const handleGlobalDataChange = async ({ store, action, records, record }: { store: any, action: string, records?: any[], record?: any }) => {
        console.log(`--- handleGlobalDataChange ACIONADO --- View: ${currentViewType}`); // Usando currentViewType desestruturado
        console.log(`Store ID: ${store.id}, Action: ${action}, Records:`, records || [record]);

        const project = projectRef.current?.instance;
        // *** CONDIÇÕES DE SAÍDA REFORÇADAS ***
        if (!project || readOnly || action === 'dataset' || isCurrentlySyncing.current || isLoadingData.current) {
            console.log("GlobalDataChange: Ignorando (não pronto, readOnly, dataset, syncing ou loading)");
            return;
        }
        if (currentViewType === 'rnc_mes') {
         console.log("RNC-MES: Ignorando dataChange, view é somente leitura.");
         isCurrentlySyncing.current = false; // Importante resetar
         return;
     }

        isCurrentlySyncing.current = true;
        let requiresFullReload = false;
        
        try {
            const recordsToProcess = records || (record ? [record] : []);

            if (currentViewType === 'rnc') {
                // ==========================================
                // == INÍCIO DO CÓDIGO RNC COMPLETO AQUI ==
                // ==========================================
                console.log("Mudança na View RNC detectada no GanttChart!");
                // Assumindo que RNCs são carregados na taskStore para exibição na grid
                // e que 'store.id' será o da taskStore.
                if (store.id === project.taskStore.id) {
                    for (const rncBryntumRecord of recordsToProcess as TaskModel[]) { // O Bryntum envia como TaskModel
                        const rncDbId = rncBryntumRecord.id as number; // Este é o ID do RncRecord no banco

                        if (action === 'add') {
                            if (rncBryntumRecord.isPhantom) {
                                const rncToCreate: CreateRncDto = {
                                    relator: rncBryntumRecord.get('relator') || "N/A",
                                    idRnc: rncBryntumRecord.get('idRnc'),
                                    dataRnc: rncBryntumRecord.get('dataRnc') ? new Date(rncBryntumRecord.get('dataRnc')).toISOString() : null,
                                    Equipamento: rncBryntumRecord.get('equipamento'),
                                    pcs: rncBryntumRecord.get('pcs'),
                                    responsavelRnc: rncBryntumRecord.get('responsavelRnc'),
                                    descricaoRnc: rncBryntumRecord.get('descricaoRnc') || rncBryntumRecord.name,
                                    procRnc: rncBryntumRecord.get('procRnc'),
                                    engERnc: rncBryntumRecord.get('engERnc'),
                                    opRnc: rncBryntumRecord.get('opRnc'),
                                    fabRnc: rncBryntumRecord.get('fabRnc'),
                                    supRnc: rncBryntumRecord.get('supRnc'),
                                    ifRnc: rncBryntumRecord.get('ifRnc'),
                                    dayShopProjectId: currentProjectId,
                                };
                                console.log("Tentando criar RNC via GanttChart:", rncToCreate);
                                const newRncFromApi = await createRnc(rncToCreate);
                                if (newRncFromApi && newRncFromApi.id) {
                                    rncBryntumRecord.id = newRncFromApi.id;
                                    rncBryntumRecord.set('relator', newRncFromApi.relator);
                                    rncBryntumRecord.set('idRnc', newRncFromApi.idRnc);
                                    rncBryntumRecord.set('dataRnc', newRncFromApi.dataRnc ? new Date(newRncFromApi.dataRnc) : null);
                                    rncBryntumRecord.set('Equipamento', newRncFromApi.equipamento);
                                    rncBryntumRecord.set('pcs', newRncFromApi.pcs);
                                    rncBryntumRecord.set('responsavelRnc', newRncFromApi.responsavelRnc);
                                    rncBryntumRecord.set('descricaoRnc', newRncFromApi.descricaoRnc);
                                    rncBryntumRecord.set('procRnc', newRncFromApi.procRnc);
                                    rncBryntumRecord.set('engERnc', newRncFromApi.engERnc);
                                    rncBryntumRecord.set('opRnc', newRncFromApi.opRnc);
                                    rncBryntumRecord.set('fabRnc', newRncFromApi.fabRnc);
                                    rncBryntumRecord.set('supRnc', newRncFromApi.supRnc);
                                    rncBryntumRecord.set('ifRnc', newRncFromApi.ifRnc);
                                    rncBryntumRecord.clearChanges();
                                    console.log(`RNC local atualizado com ID do DB: ${newRncFromApi.id}`);
                                } else {
                                    Toast.show("API não retornou RNC com ID após criação.");
                                    requiresFullReload = true;
                                }
                            }
                        } else if (action === 'update' && !rncBryntumRecord.isPhantom && rncDbId) {
                            console.log("RNC - Ação UPDATE detectada:", rncDbId);
                            console.log("RNC - Dados *antes* do mapeamento:", rncBryntumRecord.toJSON()); // Log profundo
                            //console.log("RNC - Mudanças detectadas pelo Bryntum:", rncBryntumRecord.changes); // Veja o que o Bryntum acha que mudou
                                const rncToUpdate: UpdateRncDto = {
                                    relator: rncBryntumRecord.get('relator'),
                                    idRnc: rncBryntumRecord.get('idRnc'),
                                    dataRnc: rncBryntumRecord.get('dataRnc') ? new Date(rncBryntumRecord.get('dataRnc')).toISOString() : null,
                                    Equipamento: rncBryntumRecord.get('equipamento'),
                                    pcs: rncBryntumRecord.get('pcs'),
                                    responsavelRnc: rncBryntumRecord.get('responsavelRnc'),
                                    //descricaoRnc: rncBryntumRecord.get('descricaoRnc') || rncBryntumRecord.name,
                                    procRnc: rncBryntumRecord.get('procRnc'),
                                    engERnc: rncBryntumRecord.get('engERnc'),
                                    opRnc: rncBryntumRecord.get('opRnc'),
                                    fabRnc: rncBryntumRecord.get('fabRnc'),
                                    supRnc: rncBryntumRecord.get('supRnc'),
                                    ifRnc: rncBryntumRecord.get('ifRnc'),
                                    startDateGantt: rncBryntumRecord.startDate ? (rncBryntumRecord.startDate as Date).toISOString() : null,
                                    endDateGantt: rncBryntumRecord.endDate ? (rncBryntumRecord.endDate as Date).toISOString() : null,
                                    durationGantt: rncBryntumRecord.duration,
                                    durationUnitGantt: rncBryntumRecord.durationUnit,
                                    descricaoRnc: rncBryntumRecord.get('descricaoRnc'),
                                    note: rncBryntumRecord.note,
                                    setorOrigem: rncBryntumRecord.get('setorOrigem'),
                                };
                                console.log("Tentando atualizar RNC via GanttChart:", rncDbId, rncToUpdate);
                                await updateRnc(rncDbId, rncToUpdate);
                                // rncBryntumRecord.clearChanges(); // Opcional
                            }
                         else if (action === 'remove') {
                            if (!rncBryntumRecord.isPhantom && rncDbId) {
                                console.log("Tentando remover RNC via GanttChart:", rncDbId);
                                await deleteRnc(rncDbId);
                            }
                        }
                    }
                }
            }
                // =====================================================
                // == ADICIONE O BLOCO PARA AVALIAÇÕES AQUI ============
                // =====================================================
                else if (currentViewType === 'avaliacoes') {
                    console.log("Processando evento para AVALIACOES...");
                    if (store.id === project.taskStore.id) { // Avaliações também estarão na taskStore
                        for (const avaliacaoRecord of recordsToProcess as TaskModel[]) {
                            const dbId = avaliacaoRecord.id as number; // ID do banco

                            if (action === 'add' && avaliacaoRecord.isPhantom) {
                                console.log("AVALIACOES - Ação ADD para Phantom:", avaliacaoRecord.name);
                                // 1. Mapeie avaliacaoRecord (TaskModel) para CreateAvaliacaoDto
                                const createDto: CreateAvaliacaoDto = {
                                    dayShopProjectId: currentProjectId, // Este é [Required] no DTO
                                    name: avaliacaoRecord.name || `${avaliacaoRecord.get('pcs') || ''} - ${avaliacaoRecord.get('equipamento') || ''}`.trim(), // Garantir que Name não seja nulo se for obrigatório
                                    startDate: avaliacaoRecord.startDate ? (avaliacaoRecord.startDate as Date).toISOString() : new Date().toISOString(),
                                    duration: avaliacaoRecord.duration === undefined || avaliacaoRecord.duration === null ? 1 : avaliacaoRecord.duration, // Default para 1 se não definido
                                    durationUnit: avaliacaoRecord.durationUnit || 'day',
                                    progress: (avaliacaoRecord.percentDone === undefined || avaliacaoRecord.percentDone === null) ? 0 : (avaliacaoRecord.percentDone / 100),

                                    // --- MAPEIE TODOS OS CAMPOS DEFINIDOS EM CreateAvaliacaoDto ---
                                    // Certifique-se de que 'Pcs' (que é [Required] no DTO) está sendo enviado
                                    pcs: avaliacaoRecord.get('pcs') || "PCS Padrão se Vazio", // << Exemplo de fallback para campo obrigatório
                                    pri: avaliacaoRecord.get('pri'),
                                    cliente: avaliacaoRecord.get('cliente'),
                                    equipamento: avaliacaoRecord.get('equipamento'),
                                    dataReceb: avaliacaoRecord.get('dataReceb') ? new Date(avaliacaoRecord.get('dataReceb')).toISOString() : null,

                                    serviceInicio: avaliacaoRecord.get('serviceInicio') ? new Date(avaliacaoRecord.get('serviceInicio')).toISOString() : null,
                                    serviceReprog: avaliacaoRecord.get('serviceReprog') ? new Date(avaliacaoRecord.get('serviceReprog')).toISOString() : null,
                                    // ... mapeie TODOS os outros campos de data ...
                                    engEquipInicio: avaliacaoRecord.get('engEquipInicio') ? new Date(avaliacaoRecord.get('engEquipInicio')).toISOString() : null,
                                    engEquipReprog: avaliacaoRecord.get('engEquipReprog') ? new Date(avaliacaoRecord.get('engEquipReprog')).toISOString() : null,
                                    engManufInicio: avaliacaoRecord.get('engManufInicio') ? new Date(avaliacaoRecord.get('engManufInicio')).toISOString() : null,
                                    engManufReprog: avaliacaoRecord.get('engManufReprog') ? new Date(avaliacaoRecord.get('engManufReprog')).toISOString() : null,
                                    pcpInicio: avaliacaoRecord.get('pcpInicio') ? new Date(avaliacaoRecord.get('pcpInicio')).toISOString() : null,
                                    pcpReprog: avaliacaoRecord.get('pcpReprog') ? new Date(avaliacaoRecord.get('pcpReprog')).toISOString() : null,
                                    montInicio: avaliacaoRecord.get('montInicio') ? new Date(avaliacaoRecord.get('montInicio')).toISOString() : null,
                                    montReprog: avaliacaoRecord.get('montReprog') ? new Date(avaliacaoRecord.get('montReprog')).toISOString() : null,
                                    caldInicio: avaliacaoRecord.get('caldInicio') ? new Date(avaliacaoRecord.get('caldInicio')).toISOString() : null,
                                    caldReprog: avaliacaoRecord.get('caldReprog') ? new Date(avaliacaoRecord.get('caldReprog')).toISOString() : null,
                                    cqInicio: avaliacaoRecord.get('cqInicio') ? new Date(avaliacaoRecord.get('cqInicio')).toISOString() : null,
                                    cqReprog: avaliacaoRecord.get('cqReprog') ? new Date(avaliacaoRecord.get('cqReprog')).toISOString() : null,
                                    usinInicio: avaliacaoRecord.get('usinInicio') ? new Date(avaliacaoRecord.get('usinInicio')).toISOString() : null,
                                    usinReprog: avaliacaoRecord.get('usinReprog') ? new Date(avaliacaoRecord.get('usinReprog')).toISOString() : null,
                                    relCqInicio: avaliacaoRecord.get('relCqInicio') ? new Date(avaliacaoRecord.get('relCqInicio')).toISOString() : null,
                                    relCqReprog: avaliacaoRecord.get('relCqReprog') ? new Date(avaliacaoRecord.get('relCqReprog')).toISOString() : null,
                                    orcamInicio: avaliacaoRecord.get('orcamInicio') ? new Date(avaliacaoRecord.get('orcamInicio')).toISOString() : null,
                                    orcamReprog: avaliacaoRecord.get('orcamReprog') ? new Date(avaliacaoRecord.get('orcamReprog')).toISOString() : null,
                                    dataEntregaFinalInicio: avaliacaoRecord.get('dataEntregaFinalInicio') ? new Date(avaliacaoRecord.get('dataEntregaFinalInicio')).toISOString() : null,
                                    dataEntregaFinalReprog: avaliacaoRecord.get('dataEntregaFinalReprog') ? new Date(avaliacaoRecord.get('dataEntregaFinalReprog')).toISOString() : null,

                                    observacoes: avaliacaoRecord.get('observacoes'),
                                    note: avaliacaoRecord.note, // Nota da aba do Bryntum
                                };
                                console.log("AVALIACOES - Criando DTO:", createDto);
                                try {
                                    const novaAvaliacao = await createAvaliacao(createDto); // Chame seu serviço
                                    if (novaAvaliacao && novaAvaliacao.id) {
                                        avaliacaoRecord.id = novaAvaliacao.id; // Atualiza o ID no Bryntum
                                        // Opcional: atualize outros campos que podem ter sido definidos/alterados pelo backend
                                        // avaliacaoRecord.set(novaAvaliacao); // Cuidado com o formato das datas aqui
                                        avaliacaoRecord.clearChanges();
                                        console.log("AVALIACOES - Criada com ID:", novaAvaliacao.id);
                                    } else {
                                        Toast.show("Erro: API não retornou ID para nova avaliação.");
                                        requiresFullReload = true;
                                    }
                                } catch (apiError) {
                                    console.error("AVALIACOES - Erro ao CRIAR via API:", apiError);
                                    Toast.show("Erro ao criar avaliação no servidor.");
                                    requiresFullReload = true;
                                }

                            } else if (action === 'update' && !avaliacaoRecord.isPhantom && dbId) {
                                console.log("AVALIACOES - Ação UPDATE para ID:", dbId);
                                // 1. Mapeie avaliacaoRecord (TaskModel) para UpdateAvaliacaoDto
                                const updateDto: UpdateAvaliacaoDto = {
                                    // Mapeie TODOS os campos que podem ser atualizados
                                    name: avaliacaoRecord.name,
                                    startDate: avaliacaoRecord.startDate ? (avaliacaoRecord.startDate as Date).toISOString() : undefined,
                                    duration: avaliacaoRecord.duration,
                                    durationUnit: avaliacaoRecord.durationUnit,
                                    endDate: avaliacaoRecord.endDate ? (avaliacaoRecord.endDate as Date).toISOString() : undefined,
                                    progress: (avaliacaoRecord.percentDone || 0) / 100,
                                    pri: avaliacaoRecord.get('pri'),
                                    pcs: avaliacaoRecord.get('pcs'),
                                    cliente: avaliacaoRecord.get('cliente'),
                                    equipamento: avaliacaoRecord.get('equipamento'),
                                    dataReceb: avaliacaoRecord.get('dataReceb') ? new Date(avaliacaoRecord.get('dataReceb')).toISOString() : undefined,
                                    serviceInicio: avaliacaoRecord.get('serviceInicio') ? new Date(avaliacaoRecord.get('serviceInicio')).toISOString() : undefined,
                                    serviceReprog: avaliacaoRecord.get('serviceReprog') ? new Date(avaliacaoRecord.get('serviceReprog')).toISOString() : undefined,
                                    // ... continue para TODOS os campos de data e outros ...
                                    engEquipInicio: avaliacaoRecord.get('engEquipInicio') ? new Date(avaliacaoRecord.get('engEquipInicio')).toISOString() : undefined,
                                    // ... etc ...
                                    dataEntregaFinalInicio: avaliacaoRecord.get('dataEntregaFinalInicio') ? new Date(avaliacaoRecord.get('dataEntregaFinalInicio')).toISOString() : undefined,
                                    dataEntregaFinalReprog: avaliacaoRecord.get('dataEntregaFinalReprog') ? new Date(avaliacaoRecord.get('dataEntregaFinalReprog')).toISOString() : undefined,
                                    observacoes: avaliacaoRecord.get('observacoes'),
                                    note: avaliacaoRecord.note,
                                };
                                console.log("AVALIACOES - Atualizando DTO:", dbId, updateDto);
                                try {
                                    await updateAvaliacao(dbId, updateDto); // Chame seu serviço
                                    avaliacaoRecord.clearChanges();
                                    console.log("AVALIACOES - Atualizada ID:", dbId);
                                } catch (apiError) {
                                    console.error("AVALIACOES - Erro ao ATUALIZAR via API:", apiError);
                                    Toast.show("Erro ao atualizar avaliação no servidor.");
                                    requiresFullReload = true;
                                }

                            } else if (action === 'remove' && !avaliacaoRecord.isPhantom && dbId) {
                                console.log("AVALIACOES - Ação REMOVE para ID:", dbId);
                                try {
                                    await deleteAvaliacao(dbId); // Chame seu serviço
                                    console.log("AVALIACOES - Deletada ID:", dbId);
                                    // O Bryntum já removeu do store local, não precisa de clearChanges
                                } catch (apiError) {
                                    console.error("AVALIACOES - Erro ao DELETAR via API:", apiError);
                                    Toast.show("Erro ao deletar avaliação no servidor.");
                                    requiresFullReload = true; // Para garantir que a UI reflita o estado do DB
                                }
                            }
                        }
                    }
                    // As dependências para Avaliações seriam tratadas no bloco de dependências geral abaixo,
                    // se Avaliações puderem ter dependências.
                }
                // ========================================
                // == FIM DO CÓDIGO RNC COMPLETO ==
                // ========================================
             else {
                // --- LÓGICA PARA TASKSTORE (quando NÃO é view RNC) --- 
                if (store.id === project.taskStore.id) {
                    console.log("Mudança no TaskStore detectada (não é view RNC)!");
                    if (action === 'add') {
                        for (const taskRecord of recordsToProcess as TaskModel[]) {
                            if (taskRecord.isPhantom) {
                                const taskToCreate: CreateGanttTaskDto = {
                                    name: taskRecord.name || "Nova Tarefa",
                                    startDate: taskRecord.startDate ? (taskRecord.startDate as Date).toISOString() : new Date().toISOString(),
                                    duration: taskRecord.duration || 1,
                                    progress: (taskRecord.percentDone || 0) / 100,
                                    parentId: taskRecord.parentId as number | null | undefined,
                                    dayShopProjectId: currentProjectId,
                                    itemAvaliado: (taskRecord as any).itemAvaliado,
                                    opReferencia: (taskRecord as any).opReferencia,
                                    resultado: (taskRecord as any).resultado,
                                    dataAvaliacao: (taskRecord as any).dataAvaliacao ? ((taskRecord as any).dataAvaliacao as Date).toISOString() : undefined,
                                    responsavel: (taskRecord as any).responsavel,
                                    responsibleId: taskRecord.get('responsibleId'), // Se você tiver um campo responsável
                                    observacoes: (taskRecord as any).observacoes,
                                    dependencies: taskRecord.allDependencies && Array.isArray(taskRecord.allDependencies) && taskRecord.allDependencies.every(d => d && typeof d.id !== 'undefined') 
                                        ? JSON.stringify(taskRecord.allDependencies.map(d => d.id)) 
                                        : undefined,
                                    expanded: taskRecord.expanded !== undefined ? taskRecord.expanded : true,
                                    pri: (taskRecord as any).PRI,
                                    bu: (taskRecord as any).BU,
                                    pcs: taskRecord.get('PCS'),
                                    cliente: (taskRecord as any).CLIENTE,
                                    item: (taskRecord as any).ITEM,
                                    dataEntrega: taskRecord.get('dataEntrega') && !isNaN(Date.parse(taskRecord.get('dataEntrega'))) ? (new Date(taskRecord.get('dataEntrega'))).toISOString() : undefined,
                                    dataReprog: (taskRecord as any).dataReprog && !isNaN(Date.parse(taskRecord.get('dataReprog'))) ? (new Date(taskRecord.get('dataReprog'))).toISOString() : undefined,
                                    status: (taskRecord as any).status,
                                };
                                console.log("Tentando criar tarefa:", taskToCreate);
                                const newTaskFromApi = await createTask(currentProjectId, taskToCreate);
                                console.log("API createTask chamada. Resposta:", newTaskFromApi);

                                if (newTaskFromApi && newTaskFromApi.id) {
                                    taskRecord.id = newTaskFromApi.id; 
                                    taskRecord.clearChanges(); 
                                    console.log(`Tarefa local atualizada com ID: ${newTaskFromApi.id}`);
                                } else {
                                    console.warn("API não retornou tarefa com ID. Forçando recarga total.");
                                    requiresFullReload = true; // Decida se isso é realmente necessário
                                }
                            }
                        }
                    } else if (action === 'update') {
                        for (const taskRecord of recordsToProcess as TaskModel[]) {
                            if (taskRecord.isPhantom || taskRecord instanceof ProjectModel) continue;
                            console.log("Tarefa - Ação UPDATE detectada:", taskRecord.id);
                            console.log("Tarefa - Dados *antes* do mapeamento:", taskRecord.toJSON());
                            // console.log("Tarefa - Mudanças detectadas pelo Bryntum:", taskRecord.changes);

                            const taskToUpdate: UpdateGanttTaskDto = {
                                id: typeof taskRecord.id === 'number' ? taskRecord.id : 0,
                                name: taskRecord.name,
                                startDate: taskRecord.startDate ? (taskRecord.startDate as Date).toISOString() : undefined,
                                duration: taskRecord.duration,
                                endDate: taskRecord.endDate ? (taskRecord.endDate as Date).toISOString() : undefined,
                                progress: (taskRecord.percentDone || 0) / 100,
                                parentId: taskRecord.parentId as number | null | undefined,
                                dependencies: taskRecord.allDependencies ? JSON.stringify(taskRecord.allDependencies.map(d => d.id)) : undefined,
                                expanded: taskRecord.expanded,
                                // Campos customizados - pegue os valores atuais usando taskRecord.get()
                                itemAvaliado: taskRecord.get('ItemAvaliado'),
                                opReferencia: taskRecord.get('OpReferencia'),
                                responsavel: taskRecord.get('responsavel'), // Ajuste o case para manter consistência
                                dataAvaliacao: taskRecord.get('DataAvaliacao') ? (taskRecord.get('DataAvaliacao') as Date).toISOString() : undefined,
                                responsibleId: taskRecord.get('responsibleId') as number | null, // Se você tiver um campo responsável
                                pri: taskRecord.get('pri'),               // ANTES: PRI
                                bu: taskRecord.get('bu'),                        // ANTES: BU
                                pcs: taskRecord.get('pcs'),                      // ANTES: PCS
                                cliente: taskRecord.get('cliente'),              // ANTES: CLIENTE
                                item: taskRecord.get('item'),                    // ANTES: ITEM
                                dataEntrega: taskRecord.get('dataEntrega') && !isNaN(Date.parse(taskRecord.get('dataEntrega'))) ? (new Date(taskRecord.get('dataEntrega'))).toISOString() : undefined,
                                dataReprog: taskRecord.get('dataReprog') ? (new Date(taskRecord.get('dataReprog'))).toISOString() : undefined,
                                status: taskRecord.get('status'),

                                observacoes: taskRecord.get('observacoes'), // Pega do campo "Observacoes" (provavelmente da aba Geral do editor)
                                note: taskRecord.get('note'),               // The 'note' field is retrieved from the Bryntum task record and represents the content of the "Notes" tab in the Bryntum UI. It is used to store additional information or comments related to the task.
                            };
                            console.log("FRONTEND: Dados da tarefa para ATUALIZAÇÃO:", JSON.parse(JSON.stringify(taskToUpdate))); // Logue o payload
                            console.log("FRONTEND: taskRecord.get('responsibleId') raw:", taskRecord.get('responsibleId'));
                            console.log("Tentando atualizar tarefa:", taskToUpdate.id);
                            await updateTask(taskRecord.id as number, taskToUpdate);
                            console.log("API updateTask chamada.");
                        }
                    } else if (action === 'remove') {
                        for (const taskRecord of recordsToProcess as TaskModel[]) {
                            const recordId = taskRecord.id as number;
                            if (!taskRecord.isPhantom && recordId && typeof recordId === 'number' && recordId > 0) {
                                console.log("Tentando remover tarefa:", recordId);
                                await deleteTask(recordId);
                                console.log("API deleteTask chamada.");
                            }
                        }
                    }
                } 
                // --- LÓGICA PARA DEPENDENCYSTORE (quando NÃO é view RNC) --- 
                else if (store.id === project.dependencyStore.id) {
                    console.log("Mudança no DependencyStore detectada (não é view RNC)!");
                    if (action === 'add') {
                        for (const depRecord of recordsToProcess as DependencyModel[]) {
                            if (depRecord.isPhantom) {
                                const fromId = (depRecord as any).from;
                                const toId = (depRecord as any).to;
                                if (fromId !== null && fromId !== undefined && toId !== null && toId !== undefined) {
                                    const depToCreate: Partial<DependencyDto> = {
                                        fromTask: fromId as number,
                                        toTask: toId as number,
                                        type: depRecord.type === undefined ? 2 : depRecord.type,
                                        lag: depRecord.lag || 0,
                                        lagUnit: depRecord.lagUnit || 'day'
                                    };
                                    console.log("Tentando criar dependência (IDs válidos):", depToCreate);
                                    try {
                                        const newDepFromApi = await createDependency(currentProjectId, depToCreate);
                                        console.log("API createDependency chamada. Resposta:", newDepFromApi);
                                        if (newDepFromApi && newDepFromApi.id) {
                                            depRecord.id = newDepFromApi.id;
                                            depRecord.clearChanges();
                                            console.log(`Dependência local atualizada com ID: ${newDepFromApi.id}`);
                                        } else {
                                            console.warn("API não retornou dependência com ID. Forçando recarga total.");
                                            requiresFullReload = true; // Decida se isso é realmente necessário
                                        }
                                    } catch (apiError) {
                                        console.error("Erro na API createDependency:", apiError);
                                        throw apiError; 
                                    }
                                } else {
                                    console.log("Dependência ignorada (incompleta): Faltando fromTask ou toTask.");
                                }
                            }
                        }
                    } else if (action === 'update') {
                        for (const depRecord of recordsToProcess as DependencyModel[]) {
                            const fromId = (depRecord as any).from;
                            const toId = (depRecord as any).to;
                            const recordId = depRecord.id;

                            if (depRecord.isPhantom && fromId !== null && fromId !== undefined && toId !== null && toId !== undefined) {
                                console.log("Phantom atualizado para completo. Tentando CRIAR no backend...");
                                const depToCreate: Partial<DependencyDto> = {
                                    fromTask: fromId as number,
                                    toTask: toId as number,
                                    type: depRecord.type === undefined ? 2 : depRecord.type,
                                    lag: depRecord.lag || 0,
                                    lagUnit: depRecord.lagUnit || 'day'
                                };
                                try {
                                    const newDepFromApi = await createDependency(currentProjectId, depToCreate);
                                    if (newDepFromApi && newDepFromApi.id) {
                                        depRecord.id = newDepFromApi.id; 
                                        depRecord.clearChanges();
                                        console.log(`Dependência local (ex-phantom) atualizada com ID: ${newDepFromApi.id}`);
                                    } else {
                                        console.warn("API (via update) não retornou dependência com ID. Forçando recarga total.");
                                        requiresFullReload = true; // Decida se isso é realmente necessário
                                    }
                                } catch (apiError) {
                                    console.error("Erro na API createDependency (via update):", apiError);
                                    throw apiError;
                                }
                            } else if (!depRecord.isPhantom && recordId) {
                                console.log("Dependência existente atualizada. Tentando ATUALIZAR no backend...");
                                const depToUpdate: DependencyDto = {
                                    id: recordId as number | string,
                                    fromTask: fromId as number,
                                    toTask: toId as number,
                                    type: depRecord.type,
                                    lag: depRecord.lag || 0,
                                    lagUnit: depRecord.lagUnit || 'day'
                                };
                                try {
                                    await updateDependency(recordId as number | string, depToUpdate);
                                    console.log("API updateDependency chamada com sucesso.");
                                } catch (apiError) {
                                    console.error("Erro na API updateDependency:", apiError);
                                    throw apiError;
                                }
                            } else {
                                console.log("Update de dependência ignorado (condição não tratada).");
                            }
                        }
                    } else if (action === 'remove') {
                        for (const depRecord of recordsToProcess as DependencyModel[]) {
                            const recordId = depRecord.id as number | string;
                            if (!depRecord.isPhantom && recordId) {
                                console.log("Tentando remover dependência:", recordId);
                                await deleteDependency(recordId);
                                console.log("API deleteDependency chamada.");
                                // requiresFullReload = true; // Decida se isso é realmente necessário
                            }
                        }
                    }
                }
            }
            // --- FIM DAS LÓGICAS DOS STORES ---

            if (requiresFullReload && notifyParentOfChange) {
                console.log("Chamando notifyParentOfChange para recarregar dados...");
                notifyParentOfChange();
            }

        } catch (error: any) {
            console.error("Erro ao sincronizar via handleGlobalDataChange:", error);
            Toast.show(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
            if (notifyParentOfChange) {
                console.log("Erro crítico, chamando notifyParentOfChange para tentar recuperar.");
                notifyParentOfChange(); // Força recarga em caso de erro
            }
        } finally {

            isCurrentlySyncing.current = false;
            console.log("--- handleGlobalDataChange CONCLUÍDO ---");
        }
    };

    return (
        <>
             <BryntumGanttProjectModel ref={projectRef} {...projectProps} />
        <BryntumGantt
            key={usersData.length > 0 ? 'gantt-loaded-users' : 'gantt-loading'} // Use uma key que muda com o usersData
            ref={ganttRef}
            {...finalBryntumConfig}
            {...restGanttProps}
            project={projectRef}
            //columns={columnsConfig}
            readOnly={readOnly}
            onDataChange={handleGlobalDataChange}
            excelExporterFeature={{
                filename: 'ExcelValmetDefault'
            }}
            subGridConfigs={memoizedSubGridConfigs}
        />
    </>
    );
};
export default GanttChart;

