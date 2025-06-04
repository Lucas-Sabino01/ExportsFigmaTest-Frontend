/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Button, ButtonListenersTypes, ColumnStore, DateField, DateFieldListenersTypes, DateHelper, Gantt, GanttFeaturesType, Menu, MenuItem,
    MenuItemListenersTypes, MenuListenersTypes, NameColumn, Panel, Slider, SliderListenersTypes, TaskModel, TextFieldListenersTypes, Toast,
    Toolbar, ToolbarConfig, UndoRedoConfig, Widget, // Certifique-se que Widget está importado se usado diretamente em tipos
} from '@bryntum/gantt';

// Importe createRoot e Root para React 18+
import { Root } from 'react-dom/client';

// Definição auxiliar para MenuItem se necessário
class CheckboxMenuItem extends MenuItem {
    declare feature: keyof GanttFeaturesType;
    declare subGrid: string;
    declare wbs: boolean;
}

export default class GanttToolbar extends Toolbar {

    static type = 'gantttoolbar';
    static $name = 'GanttToolbar';
    currentKpiReactHost: HTMLElement | null = null; // NOVA PROPRIEDADE

    gantt!: Gantt;
    styleNode!: HTMLElement;

    // Propriedades para gerenciar o painel e a raiz do React para o KPI
    kpiPanel: Panel | null = null;
    kpiRoot: Root | null = null;

    static configurable = {
        items : [
            // ... (outros itens da toolbar como no seu código original) ...
            {
                type  : 'buttonGroup',
                items : [
                    {
                        type: 'button',
                        ref: 'toggleViewsButton',
                        icon: 'b-fa b-fa-chevron-down',
                        text: 'Visualizações',
                        tooltip: 'Mostrar/ocultar visualizações',
                        onAction: 'up.onToggleViewsClick',
                        toggleable: true,
                    },
                    // Separador (inicialmente oculto)
                    {
                        type: 'widget',
                        ref: 'viewsSeparator',
                        html: '<span style="margin:0 5px;border-left:1px solid #ccc;height:20px;"></span>',
                        hidden: true
                    },
                    {
                        type     : 'button',
                        ref      : 'dayShopButton',
                        cls      : 'b-blue',
                        icon     : 'b-fa b-fa-store',
                        text     : 'DayShop',
                        tooltip  : 'Carregar dados DayShop',
                        onAction : 'up.onDayShopClick',
                        hidden: true,
                    },
                    {
                        type     : 'button',
                        ref      : 'viewAvaliacoesButton',
                        icon     : 'b-fa b-fa-list-check',
                        text     : 'Avaliações',
                        tooltip  : 'Carregar visualização de Avaliações',
                        onAction : 'up.onViewChange',
                        viewType : 'avaliacoes',
                        hidden: true,
                    },
                    {
                        type: 'button',
                        ref: 'viewKPIButton',
                        icon: 'b-fa b-fa-chart-line',
                        text: 'KPI',
                        tooltip: 'Abrir dashboard de KPI',
                        onAction: 'up.handleRequestOpenKpiModal', // Ação que chama o método abaixo
                        // viewType: 'kpi', // Não é mais um 'viewType' do Bryntum no mesmo sentido
                        hidden: true, // Se você o mantém no grupo de visualizações expansível
                    },
                    {
                        type     : 'button',
                        ref      : 'viewRNCButton',
                        icon     : 'b-fa b-fa-exclamation-triangle',
                        text     : 'RNC',
                        tooltip  : 'Carregar visualização de RNC',
                        onAction : 'up.onViewChange',
                        viewType : 'rnc',
                        hidden: true,
                    },
                    {
                        type     : 'button',
                        ref      : 'viewRNCMESButton',
                        icon     : 'b-fa b-fa-calendar-alt',
                        text     : 'RNC MES',
                        tooltip  : 'Carregar visualização de RNC Mensal',
                        onAction : 'up.onViewChange',
                        viewType : 'rnc_mes',
                        hidden: true,
                    },
                    { // <-- BOTÃO DE EXPORTAR EXCEL
                        type     : 'button',
                        ref      : 'exportExcelButton',
                        icon     : 'b-fa b-fa-file-excel',
                        text     : 'Exportar Excel',
                        tooltip  : 'Exportar dados para Excel',
                        onAction : 'up.onExportExcelClick' // Novo método que vamos criar
                    }
                ]
            },
             {
                type  : 'buttonGroup',
                items : [
                    {
                        type     : 'button',
                        ref      : 'addTaskButton',
                        color    : 'b-green',
                        icon     : 'b-fa b-fa-plus',
                        text     : 'Criar',
                        tooltip  : 'Criar nova tarefa',
                        onAction : 'up.onAddTaskClick'
                    },
                    // Em static configurable = { items: [ ... ] }
                    {
                        type    : 'button',
                        ref     : 'deleteTaskButton',
                        color   : 'b-red',
                        icon    : 'b-fa b-fa-trash',
                        text    : 'Deletar',
                        tooltip : 'Deletar tarefa selecionada',
                        onAction: 'up.onDeleteTaskClick' // Novo método
                    }
                ]
            },
            {
                type  : 'buttonGroup',
                items : [
                    {
                        type     : 'button',
                        ref      : 'editTaskButton',
                        icon     : 'b-fa b-fa-pen',
                        text     : 'Editar',
                        tooltip  : 'Editar tarefa selecionada',
                        onAction : 'up.onEditTaskClick'
                    },
                    {
                        type  : 'undoredo',
                        ref   : 'undoRedo',
                        items : {
                            transactionsCombo : null
                        }
                    } as UndoRedoConfig
                ]
            },
            {
                type  : 'buttonGroup',
                items : [
                    {
                        type     : 'button',
                        ref      : 'expandAllButton',
                        icon     : 'b-fa b-fa-angle-double-down',
                        tooltip  : 'Expandir todos',
                        onAction : 'up.onExpandAllClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'collapseAllButton',
                        icon     : 'b-fa b-fa-angle-double-up',
                        tooltip  : 'Recolher todos',
                        onAction : 'up.onCollapseAllClick'
                    }
                ]
            },
            {
                type  : 'buttonGroup',
                items : [
                    {
                        type     : 'button',
                        ref      : 'zoomInButton',
                        icon     : 'b-fa b-fa-search-plus',
                        tooltip  : 'Ampliar',
                        onAction : 'up.onZoomInClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'zoomOutButton',
                        icon     : 'b-fa b-fa-search-minus',
                        tooltip  : 'Reduzir',
                        onAction : 'up.onZoomOutClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'zoomToFitButton',
                        icon     : 'b-fa b-fa-compress-arrows-alt',
                        tooltip  : 'Ajustar à tela',
                        onAction : 'up.onZoomToFitClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'previousButton',
                        icon     : 'b-fa b-fa-angle-left',
                        tooltip  : 'Período anterior',
                        onAction : 'up.onShiftPreviousClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'nextButton',
                        icon     : 'b-fa b-fa-angle-right',
                        tooltip  : 'Próximo período',
                        onAction : 'up.onShiftNextClick'
                    }
                ]
            },
            {
                type  : 'buttonGroup',
                items : [
                    {
                        type       : 'button',
                        ref        : 'featuresButton',
                        icon       : 'b-fa b-fa-tasks',
                        text       : 'Funcionalidades',
                        tooltip    : 'Alternar funcionalidades',
                        toggleable : true,
                        menu       : {
                            onItem       : 'up.onFeaturesClick',
                            onBeforeShow : 'up.onFeaturesShow',
                            items        : [
                                {
                                    type    : 'menuitem',
                                    text    : 'Mostrar código WBS',
                                    checked : true,
                                    wbs     : true,
                                    onItem  : 'up.onShowWBSToggle'
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Desenhar dependências',
                                    cls     : 'b-separator',
                                    feature : 'dependencies',
                                    checked : false
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Rótulos de tarefa',
                                    feature : 'labels',
                                    checked : true
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Linhas do projeto',
                                    feature : 'projectLines',
                                    checked : false
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Destacar tempo não útil',
                                    feature : 'nonWorkingTime',
                                    checked : false
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Habilitar edição de célula',
                                    feature : 'cellEdit',
                                    checked : false
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Mostrar linhas de base',
                                    feature : 'baselines',
                                    checked : false
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Mostrar acúmulos',
                                    feature : 'rollups',
                                    checked : true
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Mostrar linha de progresso',
                                    feature : 'progressLine',
                                    checked : false
                                },
                                {
                                    type    : 'menuitem',
                                    text    : 'Ocultar cronograma',
                                    cls     : 'b-separator',
                                    subGrid : 'normal',
                                    checked : false
                                }
                            ]
                        }
                    },
                    {
                        type       : 'button',
                        ref        : 'settingsButton',
                        icon       : 'b-fa b-fa-cogs',
                        text       : 'Configurações',
                        tooltip    : 'Ajustar configurações',
                        toggleable : true,
                        menu       : {
                            type        : 'popup',
                            anchor      : true,
                            cls         : 'settings-menu',
                            layoutStyle : {
                                flexDirection : 'column'
                            },
                            onBeforeShow : 'up.onSettingsShow',

                            items : [
                                {
                                    type      : 'slider',
                                    ref       : 'rowHeight',
                                    text      : 'Altura da linha',
                                    width     : '12em',
                                    showValue : true,
                                    min       : 30,
                                    max       : 70,
                                    onInput   : 'up.onSettingsRowHeightChange'
                                },
                                {
                                    type      : 'slider',
                                    ref       : 'barMargin',
                                    text      : 'Margem da barra',
                                    width     : '12em',
                                    showValue : true,
                                    min       : 0,
                                    max       : 10,
                                    onInput   : 'up.onSettingsMarginChange'
                                },
                                {
                                    type      : 'slider',
                                    ref       : 'duration',
                                    text      : 'Duração da animação ',
                                    width     : '12em',
                                    min       : 0,
                                    max       : 2000,
                                    step      : 100,
                                    showValue : true,
                                    onInput   : 'up.onSettingsDurationChange'
                                }
                            ]
                        }
                    },
                    {
                        type       : 'button',
                        color      : 'b-red',
                        ref        : 'criticalPathsButton',
                        icon       : 'b-fa b-fa-fire',
                        text       : 'Tarefas críticas',
                        tooltip    : 'Destacar caminhos críticos',
                        toggleable : true,
                        onAction   : 'up.onCriticalPathsClick'
                    }
                ]
            },
            {
                type      : 'datefield',
                ref       : 'startDateField',
                label     : 'Início do projeto',
                flex      : '0 0 17em',
                listeners : {
                    change : 'up.onStartDateChange'
                }
            },
            {
                type                 : 'textfield',
                ref                  : 'filterByName',
                cls                  : 'filter-by-name',
                flex                 : '0 0 12.5em',
                label                : 'Buscar tarefas por nome',
                placeholder          : 'Buscar tarefas por nome',
                clearable            : true,
                keyStrokeChangeDelay : 100,
                triggers             : {
                    filter : {
                        align : 'end',
                        cls   : 'b-fa b-fa-filter'
                    }
                },
                onChange : 'up.onFilterChange'
            }
        ]
    } as ToolbarConfig;

    handleRequestOpenKpiModal() {
        if (this.gantt) {
            this.gantt.trigger('requestKpiModalOpen'); // Dispara o evento
            console.log('GanttToolbar: Evento "requestKpiModalOpen" disparado.');
        } else {
            console.error('GanttToolbar: Instância do Gantt (this.gantt) não disponível.');
        }
    }

    onExportExcelClick = () => {
        console.log("GanttToolbar: onExportExcelClick chamado.");

        if (!this.gantt) {
            console.error("GanttToolbar: ERRO - this.gantt NÃO está disponível!");
            Toast.show("Erro crítico: Instância do Gantt não disponível na toolbar.");
            return;
    }
    console.log("GanttToolbar: Instância this.gantt:", this.gantt);

    if (!this.gantt.features) {
        console.error("GanttToolbar: ERRO - this.gantt.features NÃO está definido!");
        Toast.show("Erro: Objeto de features não encontrado na instância do Gantt.");
        return;
    }
    console.log("GanttToolbar: Objeto this.gantt.features:", this.gantt.features);
    console.log("GanttToolbar: Features disponíveis (chaves):", Object.keys(this.gantt.features));
    console.log("GanttToolbar: Conteúdo de this.gantt.features.excelExporter:", this.gantt.features.excelExporter);
    console.log("GanttToolbar: Conteúdo de this.gantt.features.pdfExport (para comparação):", this.gantt.features.pdfExport);


    if (this.gantt.features.excelExporter && typeof this.gantt.features.excelExporter.export === 'function') {
        console.log("GanttToolbar: feature excelExporter e sua função export() ENCONTRADAS. Iniciando exportação...");
        try {
            this.gantt.features.excelExporter.export({
                filename: `GanttExport_${this.gantt.project?.name || 'projeto'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`
                // Adicione outras configurações se necessário
                // columns : this.gantt.columns.visibleColumns.map(col => col.id || col.field) // Exemplo: apenas colunas visíveis
            });
            Toast.show('Exportação para Excel iniciada...');
        } catch (e: any) {
            console.error("GanttToolbar: ERRO ao chamar excelExporter.export():", e);
            Toast.show(`Erro ao exportar: ${e.message}`);
        }
    } else {
        Toast.show('Recurso de Exportação Excel não está disponível ou habilitado corretamente.');
        console.error("GanttToolbar: this.gantt.features.excelExporter não encontrado ou não tem o método export().");
        if (this.gantt.features.excelExporter) {
            console.log("GanttToolbar: excelExporter existe, mas o método export() não foi encontrado nele.");
        }
    }
};
    
    // --- MÉTODOS MODIFICADOS PARA CARREGAR VISUALIZAÇÕES ---

    onDayShopClick: ButtonListenersTypes['action'] = () => {
        // 'dayshop' será o viewType que o React usará para decidir qual API chamar
        this.triggerViewLoadRequest('dayshop', 'DayShop');
    };
    
    onViewChange: ButtonListenersTypes['action'] = ({ source }) => {
    const buttonWidget = source as Button & { viewType: string }; // Fazemos um cast para Button
    const viewType = buttonWidget.viewType;

    if (!viewType) {
        console.error('viewType não definido no botão:', buttonWidget.ref || buttonWidget.text);
        Toast.show('Erro: Tipo de visualização não configurado no botão.');
        return;
    }

    let displayName: string;
    if (typeof buttonWidget.text === 'string') {
        displayName = buttonWidget.text;
    } else {
        // Fallback se o texto do botão não for uma string simples
        displayName = viewType.charAt(0).toUpperCase() + viewType.slice(1); // Ex: 'rnc' -> 'Rnc'
        console.warn(`Texto do botão para viewType "<span class="math-inline">${viewType}</span>" é complexo. Usando nome derivado: "<span class="math-inline">${displayName}</span>"`);
    }
    this.triggerViewLoadRequest(viewType, displayName); // displayName é garantidamente uma string
};

    // triggerViewLoadRequest já espera viewName como string, então está ok se quem chama garantir isso.
        triggerViewLoadRequest(viewType: string, viewName: string) { // viewName aqui já é string
    if (this.gantt) {
        console.log(`GanttToolbar: Disparando evento 'requestingViewLoad' para viewType: ${viewType}`);
        this.gantt.trigger('requestingViewLoad', { viewType, viewName });

        Toast.show(`Solicitando carregamento de ${viewName}...`); // Agora viewName é string
        this.updateActiveButton(viewName); // Agora viewName é string
        this.collapseViewButtons(); 
        } else {
            console.error("GanttToolbar: Instância do Gantt (this.gantt) não disponível para disparar evento.");
        }
    }
    
    async loadView(url: string, viewName: string) {
        try {
            Toast.show(`Carregando ${viewName}...`);
            await this.gantt.project.load({ request: { url } });
            this.updateActiveButton(viewName); 
            Toast.show(`${viewName} carregado com sucesso`);
            this.collapseViewButtons(); 
        } catch (error) {
            console.error(`Falha ao carregar ${viewName}:`, error);
            Toast.show(`Erro ao carregar ${viewName}`);
        }
    }
    
    updateActiveButton(viewName: string) {
        const buttonMap: { [key: string]: string } = {
            'DayShop': 'dayShopButton',
            'Avaliações': 'viewAvaliacoesButton',
            'RNC': 'viewRNCButton',
            'RNC Mensal': 'viewRNCMESButton',
            'Produção Sorocaba': 'viewProducaoButton',
            'kpi': 'viewKPIButton' 
        };
    
        Object.entries(this.widgetMap).forEach(([ref, widget]) => {
            const button = widget as Button;
            if (button.isButton) { 
                const currentViewName = Object.keys(buttonMap).find(name => buttonMap[name] === ref);
                if (currentViewName) {
                    button.pressed = (currentViewName === viewName);
                    button.element.classList.toggle('active-view', currentViewName === viewName);
                }
            }
        });
    }
    
    onToggleViewsClick: ButtonListenersTypes['action'] = ({ source }) => {
        const isExpanded = source.pressed;
        
        [
            'dayShopButton',
            'viewAvaliacoesButton',
            'viewKPIButton',
            'viewRNCButton',
            'viewRNCMESButton',
            'viewProducaoButton',
            'viewsSeparator'
        ].forEach(ref => {
            const widget = this.widgetMap[ref];
            if (widget) {
                widget.hidden = !isExpanded;
            }
        });
        
        source.icon = isExpanded ? 'b-fa b-fa-chevron-down' : 'b-fa b-fa-chevron-right';
    };

    collapseViewButtons() {
        const toggleBtn = this.widgetMap.toggleViewsButton as Button;
        if (toggleBtn?.pressed) {
            toggleBtn.pressed = false; 
            this.onToggleViewsClick({ source: toggleBtn } as any);
        }
    }

    onDeleteTaskClick() {
    console.log("--- onDeleteTaskClick ACIONADO ---");
    const { gantt } = this;
    const selected = gantt.selectedRecord as TaskModel; // Bryntum usa TaskModel aqui

    if (selected && !selected.isRoot) { // Não permitir deletar o nó raiz do projeto
        selected.remove(); // Isso dispara dataChange com action: 'remove'
        // O dataChange no GanttChart.tsx chamará sua API deleteTask.
        // E depois, o onDataChange (recarregar) ou commitAsync será feito lá.
    } else if (selected && selected.isRoot) {
        Toast.show('Não é possível deletar o projeto raiz.');
    }
    else {
        Toast.show('Selecione uma tarefa para deletar.');
    }
}


    // Called when toolbar is added to the Gantt panel
    set parent(parent) {
        super.parent = parent;

        this.gantt = parent as Gantt;
        this.gantt.project.on({
            load    : 'updateStartDateField',
            refresh : 'updateStartDateField',
            thisObj : this
        });

        this.styleNode = document.createElement('style');
        document.head.appendChild(this.styleNode);
    }

    get parent() {
        return super.parent;
    }

    updateStartDateField() {
        const startDateField = this.widgetMap.startDateField as DateField;
        if (this.gantt.project && startDateField) { 
            startDateField.value = this.gantt.project.startDate;
            startDateField.required = true;
        }
    }

    // region controller methods

    // GanttToolbar.tsx
async onAddTaskClick() {
    const { gantt } = this;
    const parentNode = gantt.selectedRecord && !gantt.selectedRecord.isRoot ? gantt.selectedRecord : gantt.taskStore.rootNode;
    console.log("GanttToolbar: onAddTaskClick - Adicionando tarefa ao parentNode:", (parentNode as TaskModel).name || 'Root');
    const added = parentNode.appendChild({
        name     : 'Nova Tarefa',
        duration : 1,
        startDate: (parentNode !== gantt.taskStore.rootNode && (parentNode as TaskModel).endDate) ? (parentNode as TaskModel).endDate : new Date() // Considerar uma data de início mais inteligente
    });
    console.log("GanttToolbar: Tarefa adicionada localmente ao store:", added); // added DEVE ser o objeto da tarefa
    if (added) {
        if (Array.isArray(added)) {
            added.forEach(task => {
                console.log("GanttToolbar: ID da nova tarefa (pode ser temporário):", task.id);
            });
        } else {
            console.log("GanttToolbar: ID da nova tarefa (pode ser temporário):", added.id);
        }
    } else {
        console.error("GanttToolbar: appendChild não retornou um registro!");
    }
    // Verifique se o projeto tem alterações não salvas
    if (gantt.project.stm && gantt.project.stm.isRecording) {
    console.log("GanttToolbar: O projeto possui alterações rastreadas pelo STM após appendChild (stm.isRecording é true).");
    } else if (gantt.project.taskStore && gantt.project.taskStore.changes) {
        // Se o STM não estiver 'recording' (pode acontecer se autoRecord=false ou algo assim, embora raro),
        // uma verificação mais direta no store pode ser útil, embora 'isDirty' no store também seja uma opção.
        // 'changes' retorna um objeto com added/modified/removed ou null se não houver.
        console.log("GanttToolbar: taskStore.changes existe. Detalhes:", gantt.project.taskStore.changes);
    }
    else {
        console.log("GanttToolbar: O projeto NÃO parece ter alterações rastreadas (nem stm.isRecording, nem taskStore.changes). O evento dataChange pode não disparar ou pode ter sido suprimido.");
    }
    

    // await gantt.project.propagateAsync(); // <-- REMOVA ESTA LINHA

    if (added && !Array.isArray(added)) {
        // O scroll e edit podem ser problemáticos aqui por causa da mudança de ID
        // e recarregamento de dados pelo dataChange. Considere remover ou ajustar.
        // Por agora, vamos manter a lógica de adicionar ao store.
        // O dataChange handler no GanttChart.tsx cuidará do resto.
        // await gantt.scrollRowIntoView(added); 
        // await gantt.features.cellEdit.startEditing({ record: added, field: 'name' });
    }
    // Não precisa de commitAsync aqui.
}

    async onEditTaskClick() {
        const { gantt } = this;

        if (gantt.selectedRecord) {
            await gantt.editTask(gantt.selectedRecord as TaskModel);
        }
        else {
            Toast.show('Primeiro selecione a tarefa que deseja editar');
        }
    }

    onExpandAllClick = () => this.gantt.expandAll();
    onCollapseAllClick = () => this.gantt.collapseAll();
    onZoomInClick = () => this.gantt.zoomIn();
    onZoomOutClick = () => this.gantt.zoomOut();
    onZoomToFitClick = () =>
        this.gantt.zoomToFit({
            leftMargin  : 50,
            rightMargin : 50
        });

    onShiftPreviousClick = () => this.gantt.shiftPrevious();
    onShiftNextClick = () => this.gantt.shiftNext();

    onStartDateChange: DateFieldListenersTypes['change'] = async({ value, userAction }) => {
        if (value && userAction) {
            await this.gantt.scrollToDate(DateHelper.add(value, -1, 'week'), {
                block : 'start'
            });
            await this.gantt.project.setStartDate(value);
        }
    };

    onFilterChange: TextFieldListenersTypes['change'] = ({ value }) => {
        if (value === '') {
            this.gantt.taskStore.clearFilters();
        }
        else {
            const processedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.gantt.taskStore.filter({
                filters : (task: TaskModel) => task.name && task.name.match(new RegExp(processedValue, 'i')),
                replace : true
            });
        }
    };

    onFeaturesClick: MenuListenersTypes['item'] = ({ item }) => {
        const
            { gantt } = this,
            checkbox  = item as Widget as CheckboxMenuItem;

        if (checkbox.feature) {
            const feature    = gantt.features[checkbox.feature];
            if (feature) feature.disabled = !feature.disabled;
        }
        else if (checkbox.subGrid) {
            const subGrid    = gantt.subGrids[checkbox.subGrid];
            if (subGrid) subGrid.collapsed = !subGrid.collapsed;
        }
    };

    onFeaturesShow: MenuListenersTypes['beforeShow'] = ({ source }) => {
        const
            { gantt } = this,
            menu      = source as Menu;

        (menu.items as Widget[]).forEach(item => { 
            const
                checkbox       = item as CheckboxMenuItem,
                { feature, wbs, subGrid } = checkbox; 

            if (feature) {
                if (gantt.features[feature]) {
                    checkbox.checked = !gantt.features[feature].disabled;
                }
                else {
                    item.hide();
                }
            }
            else if (wbs) {
                const nameColumn = (this.gantt.columns as ColumnStore).get('name') as NameColumn;
                if (nameColumn) checkbox.checked = nameColumn.showWbs;
            }
            else if (subGrid) { 
                 const grid = gantt.subGrids[subGrid];
                 if (grid) checkbox.checked = grid.collapsed;
            }
        });
    };

    onSettingsShow: MenuListenersTypes['beforeShow'] = ({ source }) => {
        const
            { gantt }   = this,
            { widgetMap } = source,
            rowHeight   = widgetMap.rowHeight as Slider,
            barMargin   = widgetMap.barMargin as Slider,
            duration    = widgetMap.duration as Slider;

        if (rowHeight) rowHeight.value = gantt.rowHeight;
        if (barMargin) {
            barMargin.value = gantt.barMargin;
            barMargin.max   = gantt.rowHeight / 2 - 5;
        }
        if (duration) duration.value  = gantt.transitionDuration;
    };

    onSettingsRowHeightChange: SliderListenersTypes['input'] = ({ value }) => {
        this.gantt.rowHeight = value;
        const
            button = this.widgetMap.settingsButton as Button,
            menu   = button.menu as Menu,
            slider = menu.widgetMap.barMargin as Slider;
        if (slider) slider.max = value / 2 - 5;
    };

    onSettingsMarginChange: SliderListenersTypes['input'] = ({ value }) => {
        this.gantt.barMargin = value;
    };

    onSettingsDurationChange: SliderListenersTypes['input'] = ({ value }) => {
        this.gantt.transitionDuration = value;
        if (this.styleNode) { 
             this.styleNode.innerHTML = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000}s !important; }`;
        }
    };

    onCriticalPathsClick: ButtonListenersTypes['click'] = ({ source }) => {
        if (this.gantt.features.criticalPaths) { 
            this.gantt.features.criticalPaths.disabled = !source.pressed;
        }
    };

    onShowWBSToggle: MenuItemListenersTypes['item'] = ({ item }) => {
        const nameColumn = (this.gantt.columns as ColumnStore).get('name') as NameColumn;
        if (nameColumn) nameColumn.showWbs = item.checked;
    };

    // endregion
}

// Register this widget type with its Factory
GanttToolbar.initClass();
