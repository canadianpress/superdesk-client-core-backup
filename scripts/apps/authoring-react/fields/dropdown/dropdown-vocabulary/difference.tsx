import * as React from 'react';
import {IDifferenceComponentProps} from 'superdesk-api';
import {generateHtmlDiff} from 'apps/authoring-react/generate-html-diff';
import {IDropdownConfigVocabulary, IDropdownValue} from '..';
import {getOptions} from './get-options';

type IProps = IDifferenceComponentProps<IDropdownValue, IDropdownConfigVocabulary>;

export class DifferenceVocabulary extends React.PureComponent<IProps> {
    render() {
        const {value1, value2, config} = this.props;
        const options = getOptions(config);

        const values1 =
            (Array.isArray(value1) ? value1 : [value1])
                .map((val) => options.find((_option) => _option.id === val).label)
                .join(',');

        const values2 =
            (Array.isArray(value2) ? value2 : [value2])
                .map((val) => options.find((_option) => _option.id === val).label)
                .join(',');

        return (
            <div dangerouslySetInnerHTML={{__html: generateHtmlDiff(values1, values2)}} />
        );
    }
}
