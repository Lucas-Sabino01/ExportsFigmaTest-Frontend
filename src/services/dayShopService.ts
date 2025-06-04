/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './apiService'; // Nossa instância axios configurada
 import { GanttResponseDto, GanttTaskDto, CreateGanttTaskDto, // <--- ADICIONADO
    UpdateGanttTaskDto, 
    DependencyDto, RncDto, CreateRncDto, UpdateRncDto, RncMonthlyAreaSummaryDto, AvaliacaoDto, CreateAvaliacaoDto, UpdateAvaliacaoDto} from '../dtos/GanttDtos'; // <-- Crie este DTO no front-end

// **** IMPORTANTE: Crie um arquivo 'src/dtos/GanttDtos.ts' ****
//      e coloque nele as interfaces/tipos que espelham os DTOs do back-end
//      (GanttResponseDto, GanttTaskDto, etc.) para ter tipagem forte.

// Busca todos os dados do Gantt para um projeto
export const getProjectGantt = async (projectId: number, viewType?: string): Promise<Partial<GanttResponseDto> | null> => {
    try {
    const params = viewType ? `?viewType=${viewType}` : '';
    const response = await api.get(`/dayshop/${projectId}${params}`);
    return response.data;
    } catch (error: any) {
        console.error("Erro ao buscar dados do Gantt:", error);
        throw error.response?.data?.message || 'Erro ao buscar dados do Gantt.';
    }
};

// Cria uma nova tarefa
export const createTask = async (projectId: number, taskData: CreateGanttTaskDto): Promise<GanttTaskDto> => { // <--- CORRIGIDO para usar CreateGanttTaskDto
    try {
        // A API retorna a tarefa criada, que deve corresponder a GanttTaskDto
        const response = await api.post<GanttTaskDto>(`/dayshop/${projectId}/tasks`, taskData);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao criar tarefa:", error);
        throw error.response?.data?.message || 'Erro ao criar tarefa.';
    }
};

// Atualiza uma tarefa existente
export const updateTask = async (taskId: number, taskData: UpdateGanttTaskDto): Promise<void> => {
    try {
        await api.put(`/dayshop/tasks/${taskId}`, taskData);
    } catch (error: any) {
        console.error("Erro ao atualizar tarefa:", error);
        throw error.response?.data?.message || 'Erro ao atualizar tarefa.';
    }
};

// Deleta uma tarefa
export const deleteTask = async (taskId: number): Promise<void> => {
    try {
        await api.delete(`/dayshop/tasks/${taskId}`);
    } catch (error: any) {
        console.error("Erro ao deletar tarefa:", error);
        throw error.response?.data?.message || 'Erro ao deletar tarefa.';
    }
};
// ---- Funções para Dependências ----

export const createDependency = async (projectId: number, dependencyData: Partial<DependencyDto>): Promise<DependencyDto> => {
    try {
        // O backend espera FromTask e ToTask, mas nosso DTO já está assim.
        const response = await api.post<DependencyDto>(`/dayshop/${projectId}/dependencies`, dependencyData);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao criar dependência:", error);
        throw error.response?.data?.message || 'Erro ao criar dependência.';
    }
};

export const updateDependency = async (dependencyId: number | string, dependencyData: DependencyDto): Promise<void> => {
    try {
        await api.put(`/dayshop/dependencies/${dependencyId}`, dependencyData);
    } catch (error: any) {
        console.error("Erro ao atualizar dependência:", error);
        throw error.response?.data?.message || 'Erro ao atualizar dependência.';
    }
};

export const deleteDependency = async (dependencyId: number | string): Promise<void> => {
    try {
        await api.delete(`/dayshop/dependencies/${dependencyId}`);
    } catch (error: any) {
        console.error("Erro ao deletar dependência:", error);
        throw error.response?.data?.message || 'Erro ao deletar dependência.';
    }
};

// Faz upload do arquivo Excel para DayShop (Tarefas)
export const uploadGanttExcel = async (projectId: number, file: File): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        // Chama o endpoint do DayShopController
        const response = await api.post(`/dayshop/upload/${projectId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: any) {
        console.error("Erro ao fazer upload (Gantt):", error);
        throw error.response?.data?.message || 'Erro ao fazer upload do arquivo Gantt.';
    }
};

// *** NOVO: Faz upload do arquivo Excel para RNCs ***
export const uploadRncExcel = async (projectId: number, file: File): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        // *** Chama o NOVO endpoint do RncController ***
        const response = await api.post(`/Rnc/upload/${projectId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: any) {
        console.error("Erro ao fazer upload (RNC):", error);
        throw error.response?.data?.message || 'Erro ao fazer upload do arquivo RNC.';
    }
};
// --- NOVAS FUNÇÕES PARA RNC ---

/**
 * Busca todos os registros RNC para um projeto específico.
 * @param projectId O ID do projeto.
 * @returns Uma promessa com um array de RncDto.
 */
export const getRncDataForProject = async (projectId: number): Promise<RncDto[]> => {
    try {
        const response = await api.get<RncDto[]>(`/rnc/project/${projectId}`);
        return response.data || []; // Retorna os dados ou um array vazio se response.data for null/undefined
    } catch (error: any) {
        console.error(`Erro ao buscar dados RNC para o projeto ${projectId}:`, error);
        // Lança o erro para ser tratado pelo chamador, ou retorna um array vazio como fallback
        throw error.response?.data?.message || `Erro ao buscar RNCs para o projeto ${projectId}.`;
    }
};

/**
 * Cria um novo registro RNC.
 * @param rncData Os dados para o novo RNC (CreateRncDto).
 * @returns Uma promessa com o RncDto criado (incluindo o ID do banco).
 */
export const createRnc = async (rncData: CreateRncDto): Promise<RncDto> => {
    try {
        const response = await api.post<RncDto>('/rnc', rncData);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao criar RNC:", error);
        throw error.response?.data?.message || 'Erro ao criar registro RNC.';
    }
};

/**
 * Atualiza um registro RNC existente.
 * @param rncId O ID do RNC a ser atualizado.
 * @param rncData Os dados para atualização (UpdateRncDto).
 * @returns Uma promessa vazia.
 */
export const updateRnc = async (rncId: number, rncData: UpdateRncDto): Promise<void> => {
    try {
        await api.put(`/rnc/${rncId}`, rncData);
    } catch (error: any) {
        console.error(`Erro ao atualizar RNC ID ${rncId}:`, error);
        throw error.response?.data?.message || `Erro ao atualizar registro RNC ${rncId}.`;
    }
};

/**
 * Deleta um registro RNC.
 * @param rncId O ID do RNC a ser deletado.
 * @returns Uma promessa vazia.
 */
export const deleteRnc = async (rncId: number): Promise<void> => {
    try {
        await api.delete(`/rnc/${rncId}`);
    } catch (error: any) {
        console.error(`Erro ao deletar RNC ID ${rncId}:`, error);
        throw error.response?.data?.message || `Erro ao deletar registro RNC ${rncId}.`;
    }
};

export const getRncAnnualSummaryByArea = async (
    projectId: number,
    year: number
): Promise<RncMonthlyAreaSummaryDto[]> => {
    try {
        const response = await api.get(`/Rnc/project/${projectId}/annual-summary-by-area`, {
            params: { year }
        });
        // Certifique-se de que o case das propriedades aqui bate com o DTO TypeScript
        return response.data.map((item: any) => ({
            id: item.id,
            areaOuSetor: item.areaOuSetor,
            jan: item.jan,
            fev: item.fev,
            mar: item.mar,
            abr: item.abr,
            mai: item.mai,
            jun: item.jun,
            jul: item.jul,
            ago: item.ago,
            septCount: item.septCount,
            out: item.out,
            nov: item.nov,
            dez: item.dez,
            totalAnual: item.totalAnual,
            name: item.areaOuSetor, // Mapeia para 'name' para a coluna principal do Bryntum
            leaf: true,
            iconCls: 'b-fa b-fa-table' // Ícone opcional
        })) as RncMonthlyAreaSummaryDto[];
    } catch (error: any) {
        console.error("Erro ao buscar resumo anual de RNC por área:", error);
        throw error.response?.data?.message || 'Erro ao buscar resumo anual de RNC por área.';
    }
};

export const getAvaliacoesForProject = async (projectId: number): Promise<AvaliacaoDto[]> => {
    const response = await api.get<AvaliacaoDto[]>(`${BASE_URL}/project/${projectId}`);
    return response.data.map(a => ({
        ...a,
        // Converte datas string para objetos Date se o Bryntum precisar,
        // ou deixe como string se o Bryntum as consumir diretamente.
        // Bryntum geralmente lida bem com strings ISO para datas.
        dataReceb: a.dataReceb ? new Date(a.dataReceb).toISOString() : null,
        serviceInicio: a.serviceInicio ? new Date(a.serviceInicio).toISOString() : null,
        // ... (converter todas as outras datas) ...
    })) as AvaliacaoDto[]; // Ajuste o cast se necessário
};

const BASE_URL = '/Avaliacoes';

export const createAvaliacao = async (createDto: CreateAvaliacaoDto): Promise<AvaliacaoDto> => {
    try {
        const response = await api.post<AvaliacaoDto>('/Avaliacoes', createDto);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            console.error("Erro de Validação (400) no serviço createAvaliacao:", error.response.data);
        }
        console.error("Erro completo no serviço createAvaliacao:", error);
        throw error; 
    }
};

export const updateAvaliacao = async (id: number, updateDto: UpdateAvaliacaoDto): Promise<void> => {
    await api.put(`${BASE_URL}/${id}`, updateDto);
};

export const deleteAvaliacao = async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
};

export const uploadAvaliacoesExcel = async (projectId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${BASE_URL}/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
