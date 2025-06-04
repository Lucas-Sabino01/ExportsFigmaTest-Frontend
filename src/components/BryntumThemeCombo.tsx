/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/**
 * Theme switcher combo
 */
import { createRef, ReactNode, Component } from 'react';
import { Combo, DomHelper, BrowserHelper, Store, StoreConfig } from '@bryntum/gantt';

export type BryntumThemeComboProps = {
    container?: string | Element
    store?: Store | object | StoreConfig
    cls?: string
    width?: string
    position?: string
    label?: string
}

export class BryntumThemeCombo extends Component<BryntumThemeComboProps> {

    private elRef = createRef<HTMLDivElement>();
    private combo?: Combo;

    componentDidMount(): void {

        const {
            container,
            store = {
                data : [
                    { id : 'stockholm', text : 'Stockholm' },
                    { id : 'classic', text : 'Classic' },
                    { id : 'classic-light', text : 'Classic Light' },
                    { id : 'classic-dark', text : 'Classic Dark' },
                    { id : 'material', text : 'Material' }
                ]
            },
            cls = 'theme-text',
            width = '16em',
            position = 'insertFirst'
        } = this.props;

        const element = this.elRef.current || container;
        this.combo = new Combo(
            {
                [position] : element,
                store,
                width,
                value      : 'stockholm',
                editable   : false,
                cls        : `${cls} b-bright`,
                listeners  : {
                    change({ value }: { value: string }) {
                        DomHelper.setTheme(value).then((context: any) => {
                            if (context) {
                                const { theme, prev } = context;
                                document.body.classList.remove(`b-theme-${prev}`);
                                document.body.classList.add(`b-theme-${theme}`);
                            }
                        });
                    }
                }
            }
        );

        // Apply from search param
        const theme = BrowserHelper.searchParam('theme');
        if (theme) {
            this.combo.value = theme;
        }
    }

    componentWillUnmount(): void {
        if (this.combo) {
            this.combo.destroy();
        }
    }

    shouldComponentUpdate(nextProps: Readonly<BryntumThemeComboProps>): boolean {
        const { combo } = this;
        if (combo) {
            nextProps.store && (combo.store = nextProps.store);
            nextProps.label && (combo.label = nextProps.label);
            nextProps.width && (combo.width = nextProps.width);
        }
        return true;
    }

    render(): ReactNode {
        return this.props.container ? null : <div className = "b-theme-combo" ref = {this.elRef}></div>;
    }
}
