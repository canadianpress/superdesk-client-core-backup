import React from 'react';
import {ITreeNode} from 'superdesk-api';
import {MultiSelectTemplate} from './multi-select-tree-with-template-tree-only';
import {showPopup} from './popupNew';

export interface ITreeWithLookup<T> {
    nodes: Array<ITreeNode<T>>;
    lookup: {
        [id: string]: ITreeNode<T>;
    };
}

interface IPropsBase<T> {
    values: Array<T>;
    onChange(values: Array<T>): void;
    optionTemplate: React.ComponentType<{item: T}>;
    valueTemplate?: React.ComponentType<{item: T}>; // not required, it should fallback `optionTemplate` if not provided
    getId(item: T): string;
    getLabel(item: T): string;
    allowMultiple?: boolean;
    readOnly?: boolean;
}

interface IPropsSync<T> extends IPropsBase<T> {
    kind: 'synchronous';
    getOptions(): ITreeWithLookup<T>;
}

type ICancelFn = () => void;

interface IPropsAsync<T> extends IPropsBase<T> {
    kind: 'asynchronous';

    /**
     * The function will be called when a search is initiated from UI.
     * `callback` will be invoked with matching options after they are retrieved.
     * A function to cancel the asynchronous search is returned.
     */
    searchOptions(term: string, callback: (options: ITreeWithLookup<T>) => void): ICancelFn;
}

type IProps<T> = IPropsSync<T> | IPropsAsync<T>;

export class MultiSelectTreeWithTemplate<T> extends React.PureComponent<IProps<T>> {
    render() {
        const {props} = this;
        const {values, onChange, getId} = props;
        const ValueTemplate = this.props.valueTemplate ?? this.props.optionTemplate;

        if (props.kind !== 'synchronous') {
            return null;
        }

        return (
            <div>
                <button
                    onClick={(event) => {
                        showPopup(
                            event.target as HTMLElement,
                            'bottom-start',
                            ({closePopup}) => (
                                <MultiSelectTemplate
                                    options={props.getOptions().nodes}
                                    values={props.values}
                                    onChange={(val) => {
                                        this.props.onChange(val);
                                        closePopup();
                                    }}
                                    optionTemplate={props.optionTemplate}
                                />
                            ),
                            999,
                        );
                    }}
                >
                    +
                </button>

                {
                    values.map((item, i) => (
                        <span key={i}>
                            <ValueTemplate item={item} />
                            <button
                                onClick={() => {
                                    onChange(
                                        values.filter((_value) => getId(_value) !== getId(item)),
                                    );
                                }}
                            >
                                x
                            </button>
                        </span>
                    ))
                }
            </div>
        );
    }
}
