import React from 'react';
import {ContentBlock} from 'draft-js';
import {EDITOR_BLOCK_TYPE} from 'core/editor3/constants';
import {connect} from 'react-redux';
import {DragHandle} from 'superdesk-ui-framework/react';

interface IProps {
    block: ContentBlock;
    readOnly?: boolean; // connected
    children: React.ReactNode;
}

interface IState {
    displayHandle: boolean;
}

class DragableEditor3BlockComponent extends React.PureComponent<IProps, IState> {
    timeoutId: number;
    constructor(props: IProps) {
        super(props);

        this.onDragStart = this.onDragStart.bind(this);
        this.state = {
            displayHandle: false,
        };
    }

    onDragStart(event) {
        event.dataTransfer.setData(EDITOR_BLOCK_TYPE, this.props.block.getKey());
    }

    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 4,
                }}
                onMouseEnter={() => {
                    this.setState({
                        displayHandle: true,
                    });
                }}
                onMouseLeave={() => {
                    this.timeoutId = window.setTimeout(() => {
                        this.setState({
                            displayHandle: false,
                        });
                    }, 3000);
                }}
            >
                <div
                    className={this.state.displayHandle ? 'draggable-block-handle' : 'draggable-block-handle-hide'}
                    draggable={this.props.readOnly !== true}
                    onDragStart={this.onDragStart}
                    onMouseOver={() => {
                        this.setState({
                            displayHandle: true,
                        }, () => {
                            window.clearTimeout(this.timeoutId);
                        });
                    }}
                    onMouseEnter={() => {
                        this.setState({
                            displayHandle: true,
                        }, () => {
                            window.clearTimeout(this.timeoutId);
                        });
                    }}
                >
                    <DragHandle />
                </div>
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    readOnly: state.readOnly,
});

export const DragableEditor3Block = connect(
    mapStateToProps,
)(DragableEditor3BlockComponent);
