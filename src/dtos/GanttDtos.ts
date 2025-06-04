/* eslint-disable @typescript-eslint/no-explicit-any */
// src/dtos/GanttDtos.ts

// DTO para os detalhes do Projeto (parece OK)
export interface ProjectDetailsDto {
    id?: number | string;
    name: string;
    calendar: string;
    startDate: string; // Data como string "yyyy-MM-ddTHH:mm:ss" ou "yyyy-MM-dd"
    hoursPerDay: number;
    daysPerWeek: number;
    daysPerMonth: number;
    durationUnit?: string;
}

// DTO para uma Tarefa/Linha do Gantt (EXPANDIDO)
// Esta interface deve refletir TUDO que sua API pode retornar para uma tarefa
// e que seu CustomTask.ts espera receber.
export interface GanttTaskDto {
    id: number; // Geralmente número vindo do DB
    name: string;

    // --- Campos Customizados (do seu CustomTask.ts e API) ---
    pri?: string | null;
    bu?: string | null;
    pcs?: string | null;
    cliente?: string | null;
    item?: string | null;
    dataEntrega: Date | null; // ✨ Date object here
    dataReprog: Date | null;  // ✨ Date object here
    custos?: number | string | null;   // Pode ser número ou texto formatado
    status?: string | null;           // Este campo vem da API? Ou é só calculado no frontend? Se vier, inclua.
    itemAvaliado?: string | null;     // Renomeado no seu Task.ts (itemAvaliado) - use o nome da API!
    opReferencia?: string | null;     // Renomeado no seu Task.ts (opReferencia) - use o nome da API!
    resultado?: string | null;
    dataAvaliacao?: string | null; // API envia string
    responsavel?: string;
    responsibleId?: number | null;

    observacoes?: string;
    note?: string | null;

    // --- Campos Bryntum Padrão/Comuns ---
    startDate: string;           // API envia string
    duration?: number;
    endDate?: string;             // API envia string
    expanded?: boolean;
    children?: GanttTaskDto[];   // Para hierarquia
    percentDone?: number;         // Bryntum usa 0-100
    progress?: number;            // Se sua API usa 0-1, mantenha, mas saiba da diferença
    cls?: string;                 // Para estilização
    iconCls?: string;             // Para ícones
    constraintType?: string;      // Tipos de restrição
    constraintDate?: string | null; // API envia string
    manuallyScheduled?: boolean;
    effort?: number;
    parentId?: number | null;     // ID da tarefa pai
    deadline?: string | null;     // API envia string
    dependencies?: {            // Bryntum espera um formato específico ou pode ser string
        id: number;
        from: number;
        to: number;
        type?: number;
        lag?: number;
        lagUnit?: string;
    }[]; // Ou apenas 'string' se sua API enviar assim e Bryntum converter
}
export interface CreateGanttTaskDto {
    name: string;
    startDate: string;
    duration: number;
    dayShopProjectId: number;
    parentId?: number | null;
    progress?: number;
    dependencies?: any;
    expanded?: boolean;

    // Adicione AQUI todos os campos customizados que podem ser definidos na criação
    pri?: string | number;
    bu?: string;
    pcs?: string;
    cliente?: string;
    item?: string;
    dataEntrega?: string | null;
    dataReprog?: string | null;
    custos?: number | string;
    status?: string;
    itemAvaliado?: string;
    opReferencia?: string;
    resultado?: string;
    dataAvaliacao?: string | null;
    responsavel?: string;
    responsibleId?: number | null;
    observacoes?: string;
    note?: string | null;
    percentDone?: number;
    color?: string;
    icon?: string;
    // ... outros campos necessários ...
}

// DTO para ATUALIZAR uma tarefa (Deve incluir todos os campos que podem ser atualizados)
export interface UpdateGanttTaskDto {
    id: number; // Obrigatório para saber qual atualizar
    name?: string; // Campos são opcionais na atualização
    startDate?: string;
    duration?: number;
    endDate?: string; // Pode ser enviado ou calculado no backend
    parentId?: number | null;
    progress?: number;
    dependencies?: any;
    expanded?: boolean;

    // Adicione AQUI todos os campos customizados que podem ser atualizados
    pri?: string | number;
    bu?: string;
    pcs?: string;
    cliente?: string;
    item?: string;
    dataEntrega?: string | null;
    dataReprog?: string | null;
    custos?: number | string;
    status?: string;
    itemAvaliado?: string;
    opReferencia?: string;
    resultado?: string;
    dataAvaliacao?: string | null;
    responsavel?: string;
    responsibleId?: number | null;
    observacoes?: string;
    note?: string | null;
    percentDone?: number;
    color?: string;
    icon?: string;
}
// Em GanttDtos.ts
export interface RncDto {
    name: any;
    descricaoRnc: any;
    startDateGantt: string | null | undefined;
    durationUnitGantt: string;
    endDateGantt: any;
    durationGantt: undefined;
    id: number;
    relator?: string;
    idRnc?: string;
    dataRnc?: string | null; // Datas como string (ISO) vindas da API
    equipamento?: string;
    pcs?: string;
    responsavelRnc?: string;
    procRnc?: string;
    engERnc?: string;
    opRnc?: string;
    fabRnc?: string;
    supRnc?: string;
    ifRnc?: string;
    note?: string | null;
    setorOrigem?: string | null;
    dayShopProjectId: number;
}

export interface CreateRncDto {
    relator: string; // Obrigatório
    idRnc?: string;
    dataRnc?: string | null;
    Equipamento?: string;
    pcs?: string;
    responsavelRnc?: string;
    procRnc?: string;
    engERnc?: string;
    opRnc?: string;
    fabRnc?: string;
    supRnc?: string;
    ifRnc?: string;
    note?: string | null;
    descricaoRnc?: string | null;
    setorOrigem?: string | null; // NOVO
    dayShopProjectId: number;
    startDateGantt?: string | null;
    endDateGantt?: string | null;
    durationGantt?: number | null;
    durationUnitGantt?: string | null;
}
export interface UpdateRncDto {
    // No PUT, o ID vai na URL. Os campos no corpo são o que você quer mudar.
    // Todos os campos são opcionais, pois é uma atualização parcial.
    relator?: string;
    idRnc?: string;
    dataRnc?: string | null;
    Equipamento?: string;
    pcs?: string;
    responsavelRnc?: string;
    procRnc?: string;
    engERnc?: string;
    opRnc?: string;
    fabRnc?: string;
    supRnc?: string;
    ifRnc?: string;
    descricaoRnc?: string | null;
    note?: string | null;
    setorOrigem?: string | null; // NOVO
    startDateGantt?: string | null;
    endDateGantt?: string | null;
    durationGantt?: number | null;
    durationUnitGantt?: string | null;
    // dayShopProjectId?: number; // Geralmente não se muda o projeto de um RNC existente
}
export interface RncMonthlyAreaSummaryDto {
    id: string; // ID único para a linha (ex: "USI-2025")
    areaOuSetor: string;
    jan: number;
    fev: number;
    mar: number;
    abr: number;
    mai: number;
    jun: number;
    jul: number;
    ago: number;
    septCount: number;
    out: number;
    nov: number;
    dez: number;
    totalAnual: number;
    // Opcional para Bryntum, se tratar como "tarefa" na grid
    name?: string; // Pode ser igual a areaOuSetor
    leaf?: boolean;
    iconCls?: string;
}

// DTO para Recursos (parece OK)
export interface ResourceDto {
    id: string | number;
    name: string;
}

// DTO para Alocações (parece OK)
export interface AssignmentDto {
    id: number;
    event: number;      // ID da Tarefa
    resource: string | number; // ID do Recurso
}

// Wrapper para as linhas (parece OK)
export interface RowsWrapper<T> {
    rows: T[];
}
export interface DependencyDto {
    id: number | string; // Bryntum pode gerar IDs de string ('d1', 'd2') ou numéricos
    fromTask: number;    // ID da tarefa de origem (Bryntum usa este nome no data)
    toTask: number;      // ID da tarefa de destino (Bryntum usa este nome no data)
    type?: number;        // 0=SS, 1=SE, 2=ES, 3=EE
    lag?: number;
    lagUnit?: string;     // Ex: 'day', 'hour'
    cls?: string;         // Para estilização
}

// O DTO completo da resposta da API (parece OK)
export interface GanttResponseDto {
    success: boolean;
    project: ProjectDetailsDto;
    tasks: RowsWrapper<GanttTaskDto>;
    resources: RowsWrapper<ResourceDto>;
    assignments: RowsWrapper<AssignmentDto>;
    dependencies: RowsWrapper<DependencyDto>;
    calendars: RowsWrapper<CalendarDto>;
    // calendars: any; // Adicionar se for usar
}

export interface CalendarIntervalDto {
    recurrentStartDate: string;
    recurrentEndDate: string;
    isWorking: boolean;
    name?: string;
    cls?: string;
    // Adicione 'id' se o Bryntum precisar para identificar/manipular intervalos específicos
    // id?: number | string;
}

export interface CalendarDto {
    id: string; // Bryntum usa IDs como 'business', 'general'
    name: string;
    unspecifiedTimeIsWorking?: boolean; // O '?' indica opcional se o Bryntum tiver um default
    hoursPerDay?: number;
    daysPerWeek?: number;
    daysPerMonth?: number;
    parentId?: string | null;
    children?: CalendarDto[]; // Para hierarquia, se Bryntum suportar dessa forma
    intervals: CalendarIntervalDto[];
    expanded?: boolean; // Para a árvore de calendários
}

// --- DTOs para C.R.U.D ---

// DTO para CRIAR uma tarefa (Deve incluir todos os campos que podem ser criados)


export interface AvaliacaoDto {
    id: number; // Ou string se o backend retornar string para o ID do Bryntum
    pri?: string | null;
    pcs?: string | null;
    cliente?: string | null;
    equipamento?: string | null;
    dataReceb?: string | null; // Datas como string ISO
    serviceInicio?: string | null;
    serviceReprog?: string | null;
    engEquipInicio?: string | null;
    engEquipReprog?: string | null;
    engManufInicio?: string | null;
    engManufReprog?: string | null;
    pcpInicio?: string | null;
    pcpReprog?: string | null;
    montInicio?: string | null;
    montReprog?: string | null;
    caldInicio?: string | null;
    caldReprog?: string | null;
    cqInicio?: string | null;
    cqReprog?: string | null;
    usinInicio?: string | null;
    usinReprog?: string | null;
    relCqInicio?: string | null;
    relCqReprog?: string | null;
    orcamInicio?: string | null;
    orcamReprog?: string | null;
    dataEntregaFinalInicio?: string | null;
    dataEntregaFinalReprog?: string | null;
    observacoes?: string | null;
    note?: string | null;
    dayShopProjectId: number;

    // Campos Bryntum
    name?: string;
    startDate?: string | null; // Data de início principal para a barra do Gantt
    duration?: number | null;
    durationUnit?: string | null;
    endDate?: string | null;
    progress?: number;
    leaf?: boolean; // Geralmente true para itens como Avaliação
    iconCls?: string;
}
export interface CreateAvaliacaoDto {
    dayShopProjectId: number;
    name?: string | null; // Nome principal que o Bryntum usa
    startDate?: string | null; // Data de início principal da "tarefa" Avaliação
    endDate?: string | null;
    duration?: number | null;
    durationUnit?: string | null;
    progress?: number | null;

    pri?: string | null;
    pcs: string; // Assumindo que pcs é obrigatório na criação
    cliente?: string | null;
    equipamento?: string | null;
    dataReceb?: string | null; // Data de Recebimento

    serviceInicio?: string | null;
    serviceReprog?: string | null;
    engEquipInicio?: string | null;
    engEquipReprog?: string | null;
    engManufInicio?: string | null;
    engManufReprog?: string | null;
    pcpInicio?: string | null;
    pcpReprog?: string | null;
    montInicio?: string | null;
    montReprog?: string | null;
    caldInicio?: string | null;
    caldReprog?: string | null;
    cqInicio?: string | null;
    cqReprog?: string | null;
    usinInicio?: string | null;
    usinReprog?: string | null;
    relCqInicio?: string | null;
    relCqReprog?: string | null;
    orcamInicio?: string | null;
    orcamReprog?: string | null;
    dataEntregaFinalInicio?: string | null;
    dataEntregaFinalReprog?: string | null;

    observacoes?: string | null;
    note?: string | null;
}

export interface UpdateAvaliacaoDto {
    id?: number; // O ID da avaliação a ser atualizada
    name?: string | null; // Nome principal que o Bryntum usa
    startDate?: string | null; // Data de início principal da "tarefa" Avaliação
    endDate?: string | null;
    duration?: number | null;
    durationUnit?: string | null;
    progress?: number | null;

    pri?: string | null;
    pcs: string; // Assumindo que pcs é obrigatório na criação
    cliente?: string | null;
    equipamento?: string | null;
    dataReceb?: string | null; // Data de Recebimento

    serviceInicio?: string | null;
    serviceReprog?: string | null;
    engEquipInicio?: string | null;
    engEquipReprog?: string | null;
    engManufInicio?: string | null;
    engManufReprog?: string | null;
    pcpInicio?: string | null;
    pcpReprog?: string | null;
    montInicio?: string | null;
    montReprog?: string | null;
    caldInicio?: string | null;
    caldReprog?: string | null;
    cqInicio?: string | null;
    cqReprog?: string | null;
    usinInicio?: string | null;
    usinReprog?: string | null;
    relCqInicio?: string | null;
    relCqReprog?: string | null;
    orcamInicio?: string | null;
    orcamReprog?: string | null;
    dataEntregaFinalInicio?: string | null;
    dataEntregaFinalReprog?: string | null;

    observacoes?: string | null;
    note?: string | null;
}