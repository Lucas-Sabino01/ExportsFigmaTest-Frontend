/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DayShop/columnDefinitions.ts
// (ou o caminho que fizer mais sentido no seu projeto)

// Importe o tipo de configuração de coluna do Bryntum, se disponível,
// ou use um tipo mais genérico como fizemos antes.
// import { ColumnConfig } from '@bryntum/gantt';
// Usaremos MyColumnConfig por enquanto para simplificar.
export type MyColumnConfig = {
    type?: string;
    field?: string;
    text?: string;
    width?: number;
    headerRenderer?: ({ column }: { column: any }) => string; // Para cabeçalhos customizados
    htmlEncode?: boolean;
    children?: MyColumnConfig[]; // Para colunas agrupadas
    align?: 'left' | 'center' | 'right';
    editor?: boolean | object; // Para habilitar edição
    // Adicione outras propriedades de ColumnConfig que você possa precisar
    [key: string]: any;
};

export const DayShopColumns: MyColumnConfig[] = [
    { type: 'name', field: 'name', text: 'Tarefa', width: 200, hidden: true, searchable: false, filterable: false },
    { field: 'pri', text: 'PRI', width: 60 },
    { field: 'bu', text: 'BU', width: 80 },
    { field: 'pcs', text: 'PCS', width: 80 },
    { field: 'cliente', text: 'CLIENTE', width: 120 },
    { field: 'item', text: 'ITEM', width: 120 },
    { field: 'dataEntrega', text: 'DATA ENTREGA', type: 'date', format: 'DD/MM/YYYY', width: 120 },
    { field: 'dataReprog', text: 'DATA REPROG', type: 'date', format: 'DD/MM/YYYY', width: 120 },
    { field: 'status', text: 'Status', width: 100 },
    { field: 'observacoes', text: 'Observações', width: 200 },
    { type: 'percentdone', field: 'percentDone', text: '% Concluído', width: 80 },
    { 
        field: 'responsibleId', 
        text: 'Responsável', 
        width: 150,
        // Renderer para exibir o nome do usuário
        // Note: isso exigirá que 'users' esteja disponível de alguma forma ou
        // que a `resourceStore` seja acessível (o que já é verdade).
        renderer: ({ record }: { record: any }) => {
            // record.project.resourceStore é onde seus usuários estão agora
            const resource = record.project?.resourceStore.getById(record.responsibleId);
            return resource ? resource.name : 'N/A';
        },
        editor: { // Editor para a coluna, igual ao seu setorOrigem
            type: 'combo',
            // Os 'items' serão preenchidos dinamicamente no GanttChart.tsx
            // ATENÇÃO: Os 'items' aqui serão um placeholder. A lógica no GanttChart.tsx irá preencher.
            // Você pode deixar items: [] ou items: [{ id: 0, text: 'Carregando...' }] por enquanto.
            // O importante é que a estrutura do editor esteja aqui.
            valueField: 'id',
            displayField: 'name',
            editable: false,
            clearable: true
        },
        filterable: true // Permite filtrar por esta coluna
    },
];

// 2. Colunas para AVALIAÇÕES
export const avaliacoesColumns: MyColumnConfig[] = [
    { field: 'pri', text: 'Pri.', width: 50 },
    { field: 'pcs', text: 'PCS', width: 80 },
    { field: 'cliente', text: 'Cliente', width: 150 },
    { field: 'equipamento', text: 'Equipamento', width: 150 },
    { field: 'dataReceb', text: 'Data Receb.', type: 'date', width: 100 },
    {
        text: 'Service', // Coluna Agrupada
        children: [
            { field: 'serviceInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'serviceReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Eng. Equip.',
        children: [
            { field: 'engEquipInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'engEquipReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Eng. Manuf.',
        children: [
            { field: 'engManufInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'engManufReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'PCP',
        children: [
            { field: 'pcpInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'pcpReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Mont.', // Montagem
        children: [
            { field: 'montInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'montReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Cald.', // Calderaria
        children: [
            { field: 'caldInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'caldReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'CQ',
        children: [
            { field: 'cqInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'cqReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Usin.', // Usinagem
        children: [
            { field: 'usinInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'usinReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Relatório CQ',
        children: [
            { field: 'relCqInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'relCqReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Orçam.', // Orçamento
        children: [
            { field: 'orcamInicio', text: 'Início', type: 'date', width: 90, align: 'center' },
            { field: 'orcamReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' }
        ]
    },
    {
        text: 'Data Entrega', // Data Entrega Final
        children: [
            { field: 'dataEntregaFinalInicio', text: 'Início', type: 'date', width: 90, align: 'center' }, // Nome do field pode precisar de ajuste
            { field: 'dataEntregaFinalReprog', text: 'Reprog', type: 'date', width: 90, align: 'center' } // Nome do field pode precisar de ajuste
        ]
    },
    // Adicione uma coluna 'name' oculta se os dados para esta view ainda forem 'tarefas'
    // { type: 'name', field: 'name', hidden: true, text:'Nome Base' },
];

// 3. Colunas para RNC'S
// Os campos "Proc, Eng E, OP, Fab, Sup, IF" no topo da imagem RNC'S parecem ser uma legenda
// e não colunas da tabela principal. Se forem colunas, você precisará adicioná-las.
export const rncSColumns: MyColumnConfig[] = [
    {
        type: 'name',    // Define esta como a NameColumn principal
        field: 'name',   // Mapeia para a propriedade 'name' dos seus dados de tarefa
        text: 'Estrutura Interna RNC', // Um texto descritivo, não será visível
        width: 200,      // Uma largura razoável, mesmo que oculta
        hidden: true,    // TORNA ESTA COLUNA OCULTA
        searchable: false, // Opcional: desabilitar busca nesta coluna
        filterable: false // Opcional: desabilitar filtro nesta coluna
    },
    { field: 'relator', text: 'Relator', width: 120 },
    { field: 'idRnc', text: 'ID', width: 80 }, // 'id' pode ser usado pelo Bryntum, então 'idRnc'
    { field: 'dataRnc', text: 'Data', type: 'date', width: 100 }, // 'data' é genérico, então 'dataRnc'
    { field: 'equipamento', text: 'Equipamento', width: 150 },
    { field: 'pcs', text: 'PCS', width: 80 },
    { field: 'responsavelRnc', text: 'Resp.', width: 120 }, // 'responsavel' é genérico
    { field: 'descricaoRnc', text: 'Descrição', width: 300, editor: { type: 'textfield', maxLength: 1000 } }, // 'descricao' é genérico
    {
        field: 'setorOrigem', // Deve bater com a propriedade no seu objeto de dados Bryntum
        text: 'Setor Origem',
        width: 120,
        editor: { // Opcional: Torna a coluna editável na grid
            type: 'combo', // Um ComboBox é bom para uma lista definida de setores
            items: ['USI', 'CAL', 'SDA', 'MTG', 'EXP', 'FER', 'ENG.F', 'ENG.P', 'Outro'], // Seus setores
            editable: false // Para forçar a seleção da lista
        },
        filterable: true // Permite filtrar por esta coluna
    },
    { field: 'procRnc', text: 'Proc', width: 70 }, // Campo da legenda
    { field: 'engERnc', text: 'Eng E', width: 70 }, // Campo da legenda
    { field: 'opRnc', text: 'OP', width: 70 },     // Campo da legenda
    { field: 'fabRnc', text: 'Fab', width: 70 },    // Campo da legenda
    { field: 'supRnc', text: 'Sup', width: 70 },    // Campo da legenda
    { field: 'ifRnc', text: 'IF', width: 70 },     // Campo da legenda
    // Adicione uma coluna 'name' oculta se os dados para esta view ainda forem 'tarefas'
    // { type: 'name', field: 'name', hidden: true, text:'Nome Base' },
];

// 4. Colunas para RNC'S MONTHLY AREA CONTROL
// Esta visualização é diferente. Cada "linha" é uma Área (USI, CAL, etc.)
// e as colunas são os meses. Os "dados" das tarefas aqui seriam objetos
// onde cada objeto representa uma área e tem propriedades para cada mês.
export const rncMonthlyMatrixColumns: MyColumnConfig[] = [
    // A primeira coluna exibe o nome da área/setor.
    // Se não precisar de árvore, um 'gridcolumn' simples é suficiente.
    // Se precisar de funcionalidades de árvore (raro para este tipo de matriz), use type: 'tree'.
    { field: 'areaOuSetor', text: 'ÁREA/SETOR', width: 130, frozen: true, editor: false, filterable: true },
    { field: 'jan', text: 'JAN', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'fev', text: 'FEV', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'mar', text: 'MAR', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'abr', text: 'ABR', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'mai', text: 'MAI', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'jun', text: 'JUN', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'jul', text: 'JUL', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'ago', text: 'AGO', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'septCount', text: 'SET', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'out', text: 'OUT', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'nov', text: 'NOV', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'dez', text: 'DEZ', width: 65, align: 'center', type: 'number', editor: false, filterable: false },
    { field: 'totalAnual', text: 'TOTAL', width: 90, align: 'center', type: 'number', editor: false, sum: 'sum', filterable: false },
    // Uma coluna 'name' oculta pode ser necessária se a primeira coluna visível não for do tipo 'tree'
    // e o Bryntum precisar de uma coluna principal para algumas funcionalidades internas.
    // Se 'areaOuSetor' for mapeado para 'name' nos dados, esta pode não ser necessária.
    // { type: 'name', field: 'name', hidden: true, text: 'Nome Interno' }
];