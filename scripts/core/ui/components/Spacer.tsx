/* eslint-disable react/no-multi-comp */

import React from 'react';
import {IPropsSpacer, IPropsSpacerInline, IPropsSpacerInlineFlex} from 'superdesk-api';

export class Spacer extends React.PureComponent<IPropsSpacer> {
    render() {
        const {h, v, gap, justifyContent, alignItems, noGrow, noWrap} = this.props;

        const justifyContentDefault: IPropsSpacer['justifyContent'] = h ? 'space-between' : 'start';
        const alignItemsDefault: IPropsSpacer['alignItems'] = h ? 'center' : 'start';

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: v ? 'column' : 'row',
                    gap: `${gap}px`,
                    justifyContent: justifyContent ?? justifyContentDefault,
                    alignItems: alignItems ?? alignItemsDefault,
                    width: noGrow === true ? undefined : '100%',
                    ...(this.props.style ?? {}),
                }}
            >
                {this.props.children.map((el, i) => noWrap ? el : (
                    <div
                        key={i}
                        style={{
                            width: noGrow === true ? undefined : '100%',
                        }}
                    >
                        {el}
                    </div>
                ))}
            </div>
        );
    }
}

export class SpacerInline extends React.PureComponent<IPropsSpacerInline> {
    render() {
        const {gap, h, v} = this.props;

        return (
            <span
                style={{
                    display: h === true ? 'inline-block' : 'block',
                    width: h === true ? `${gap}px` : undefined,
                    height: v === true ? `${gap}px` : undefined,
                }}
            />
        );
    }
}

export class SpacerInlineFlex extends React.PureComponent<IPropsSpacerInlineFlex> {
    render() {
        const {gap, gapSecondary, h, v} = this.props;

        const style: React.CSSProperties = {display: 'inline-flex', flexWrap: 'wrap'};

        if (h) {
            style.columnGap = `${gap}px`;

            if (gapSecondary != null) {
                style.rowGap = `${gapSecondary}px`;
            }
        } else if (v) {
            style.rowGap = `${gap}px`;

            if (gapSecondary != null) {
                style.columnGap = `${gap}px`;
            }
        }

        return (
            <span style={{...style, ...(this.props.style ?? {})}}>
                {this.props.children}
            </span>
        );
    }
}
