/**
 * React Fullscreen button wrapper
 */

import { createRef, Component, ReactNode } from 'react';
import { Button, Fullscreen } from '@bryntum/gantt';

export class BryntumFullscreenButton extends Component {

    private elRef = createRef<HTMLDivElement>();
    private button?:  Button;

    componentDidMount(): void {
        if (Fullscreen.enabled) {
            this.button = new Button({
                adopt   : this.elRef.current as HTMLElement,
                icon    : 'b-icon b-icon-fullscreen',
                tooltip : 'Fullscreen',
                cls     : 'b-raised b-blue',
                onClick() {
                    if (Fullscreen.enabled) {
                        if (!Fullscreen.isFullscreen) {
                            Fullscreen.request(document.body);
                        }
                        else {
                            Fullscreen.exit();
                        }
                    }
                }
            });
        }
    }

    componentWillUnmount(): void {
        if (this.button) {
            this.button.destroy();
        }
    }

    render(): ReactNode {
        return (
            <div ref={this.elRef} />
        );
    }
}
