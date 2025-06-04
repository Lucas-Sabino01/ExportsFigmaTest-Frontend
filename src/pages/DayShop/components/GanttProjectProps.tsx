// src/pages/DayShop/components/GanttProjectProps.tsx
import { BryntumGanttProjectModelProps } from '@bryntum/gantt-react';
import Task from '../lib/Task'; // Verifique este caminho

export const projectProps: BryntumGanttProjectModelProps = {
    autoSetConstraints: true,
    taskModelClass: Task, // Vamos revisar o Task.tsx em breve

    // Remova ou comente estas linhas:
    // transport      : {
    //     load : {
    //         url : '/data/dayshop.json'
    //     }
    // },
    // autoLoad       : true,

    stm: {
        autoRecord: true
    }
};