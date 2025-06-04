/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DayShop/lib/Task.ts (ou .tsx se tiver JSX)
import { TaskModel } from '@bryntum/gantt';

// Estenda o TaskModel padrão do Bryntum
export default class CustomTask extends TaskModel {

    // Campos padrão do Bryntum que você usa em sua lógica customizada
    // ou para os quais quer ser explícito sobre o tipo.
    // Muitos campos base (name, startDate, duration, percentDone etc.)
    // são herdados e não precisam ser redeclarados aqui se os tipos base são suficientes.
    // Apenas declare se você estiver estendendo ou usando-os em getters/setters.
    declare deadline?: Date; // Do seu modelo original

    // Seus campos customizados que vêm da API (baseado no GanttTaskDto)
    itemAvaliado?: string;
    opReferencia?: string;
    resultado?: string;
    dataAvaliacao?: Date | string; // Bryntum prefere Date, mas pode vir como string da API
    responsavel?: string;
    declare responsibleId?: number;
    observacoes?: string;
    declare effort: number; // Representa o esforço total em unidades base (geralmente horas)
    declare effortUnit: 'h' | 'd' | 'w' | 'M' | 'q' | 'y'; // A unidade selecionada (horas, dias, semanas, meses, etc.)

    // 'dependencies' já existe no TaskModel base.
    // 'cls', 'iconCls', 'constraintType', 'constraintDate',
    // 'manuallyScheduled', 'effort' também já existem.

    // Seus campos de colunas adicionais do ganttProps
    PRI?: string | number;
    BU?: string;
    PCS?: string;
    CLIENTE?: string;
    ITEM?: string;
    DATA_ENTREGA?: Date | string;
    DATA_REPROG?: Date | string;
    CUSTOS?: number | string;
    OBS?: string;
    status: any;
    // status?: string; // Se for um campo de DADOS. Se for só o getter, não precisa declarar aqui.

    static get fields() {
        return [
            // --- SEUS CAMPOS CUSTOMIZADOS DA API/DTO (MANTENHA OS QUE JÁ ESTÃO CORRETOS) ---
            { name: 'itemAvaliado', type: 'string' },
            { name: 'opReferencia', type: 'string' },
            { name: 'resultado',    type: 'string' },
            { name: 'dataAvaliacao',type: 'date', dateFormat: 'YYYY-MM-DDTHH:mm:ss' }, // O 'Z' não é necessário se a API não envia
            { name: 'responsavel',  type: 'string' },
            { name: 'ResponsibleId', type: 'number' },
            { name: 'effort', type: 'number' },
            { name: 'effortUnit', type: 'string', defaultValue: 'hour' }, // Garanta que effortUnit também é um campo
            { name: 'observacoes',  type: 'string' },
            { name: 'deadline',     type: 'date', dateFormat: 'YYYY-MM-DDTHH:mm:ss' },

            // --- AJUSTE OS CAMPOS CUSTOMIZADOS DAS COLUNAS ADICIONAIS ---
            { name: 'pri', type: 'string' },            // <--- MUDADO
            { name: 'bu', type: 'string' },             // <--- MUDADO
            { name: 'pcs', type: 'string' },            // <--- MUDADO
            { name: 'cliente', type: 'string' },        // <--- MUDADO
            { name: 'item', type: 'string' },           // <--- MUDADO
            { name: 'datA_ENTREGA', type: 'date', dateFormat: 'YYYY-MM-DDTHH:mm:ss' }, // <--- MUDADO
            { name: 'datA_REPROG',  type: 'date', dateFormat: 'YYYY-MM-DDTHH:mm:ss' }, // <--- MUDADO
            // { name: 'CUSTOS', type: 'number' }, // CUSTOS não está no JSON
            // { name: 'OBS', type: 'string' },    // OBS não está no JSON (temos 'observacoes')
            { name: 'status', type: 'string' },         // <--- ADICIONADO para o campo 'status' do JSON

            // Para `percentDone` (que o Bryntum usa para a coluna '% Concluído'):
            // O seu `GanttChart.tsx` já mapeia `task.progress * 100` para `percentDone` ao carregar,
            // então o Bryntum deve pegar `percentDone` automaticamente se ele estiver no objeto de dados.
            // Se não, adicione:
            // { name: 'percentDone', type: 'number', persist: false }, // Se você calcula no loadInlineData
            // ou
            // { name: 'progress', type: 'number' }, // E a coluna usa 'progress' com um renderer/template
        ];
    }

    // Seu getter 'isLate' está mais robusto, bom!
    get isLate(): boolean {
        // Garante que this.deadline é um objeto Date para comparação
        const deadlineDate = this.deadline instanceof Date ? this.deadline : (this.deadline ? new Date(this.deadline) : null);
        // this.isCompleted é uma propriedade do TaskModel base
        return !!deadlineDate && !this.isCompleted && Date.now() > deadlineDate.getTime();
    }

    // Seu getter 'status' está bom como um campo calculado.
    // Se 'status' fosse também um campo de dados vindo da API, você precisaria
    // declará-lo na classe e em static get fields().
    get calculatedTaskStatus(): string { // Renomeado para evitar conflito com o campo 'status'
        let currentStatus = 'Not started';
        if (this.isCompleted) {
            currentStatus = 'Completed';
        }
        else if (this.isLate) {
            currentStatus = 'Late';
        }
        else if (this.isStarted) {
            currentStatus = 'Started';
        }
        return currentStatus;
    }
}