/* eslint-disable @typescript-eslint/no-explicit-any */
import { BryntumGanttProps } from '@bryntum/gantt-react';
import '../lib/StatusColumn';
import '../lib/GanttToolbar';

export const ganttProps: BryntumGanttProps = {

    startDate               : '2025-03-24',
    endDate                 : '2025-05-31',

    tbar : {
        
        type : 'gantttoolbar'
    }as any,

    dependencyIdField : 'wbsCode',

    selectionMode     : {
        cell       : true,
        dragSelect : true,
        rowNumber  : true
    },

    resourceImageFolderPath : 'users/',

    subGridConfigs : {
        locked : {
            flex : 3
        },
        normal : {
            flex : 4
        }
    },

    columnLines : false,

    rollupsFeature        : {
        disabled : true
    },

    baselinesFeature      : {
        disabled : true
    },

    progressLineFeature   : {
        disabled   : true,
        statusDate : new Date(2025, 0, 25)
    },

    filterFeature         : true,

    dependencyEditFeature : true,
    dependenciesFeature   : true,

    timeRangesFeature     : {
        showCurrentTimeLine : true
    },

    cellEditFeature: true,     // Permite edição inline nas células da grid
    taskDragFeature: true,     // Permite arrastar tarefas para mudar datas/duração
    taskDragCreateFeature: true, // Permite criar tarefas arrastando na área do cronograma (se desejado)

    labelsFeature         : {
        before : {
            field  : 'name',
            editor : {
                type : 'textfield'
            }
        }
    }
};
