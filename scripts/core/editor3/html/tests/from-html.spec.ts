/* eslint-disable max-len */
/* tslint:disable:max-line-length */
import {getContentStateFromHtml} from '../from-html';
import {convertFromRaw, ContentState, ContentBlock, convertToRaw} from 'draft-js';
import {getRawContentStateWithoutBlockAndEntityKeys} from 'core/editor3/helpers/draftInsertEntity.spec';

/**
 * @description Returns the set of blocks corresponding to the content state
 * resulting from the conversion of the given HTML.
 */
function blocksFor(html: string): { contentState: ContentState, blocks: Array<ContentBlock> } {
    const contentState = getContentStateFromHtml(html);
    const blocks = contentState.getBlockMap().toArray();

    return {contentState, blocks};
}

describe('core.editor3.html.from-html', () => {
    it('should parse simple HTML', () => {
        const {blocks} = blocksFor('<div>some text</div><h2>some header</h2><p>some paragraph</p>');

        expect(blocks.length).toBe(3);

        expect(blocks[0].getText()).toBe('some text');
        expect(blocks[0].getType()).toBe('unstyled');
        expect(blocks[1].getText()).toBe('some header');
        expect(blocks[1].getType()).toBe('header-two');
        expect(blocks[2].getText()).toBe('some paragraph');
        expect(blocks[2].getType()).toBe('unstyled');
    });

    it('should parse HTML with tables', () => {
        const {blocks, contentState} = blocksFor(`
            <h2>some header</h2>
            <p>some paragraph</p>
            <table>
                <tbody>
                    <tr><td>1</td><td>2</td><td>3</td></tr>
                    <tr><td>4</td><td>5</td><td>6</td></tr>
                    <tr><td>7</td><td>8</td><td>9</td></tr>
                    <tr><td>10</td><td>11</td><td>12</td></tr>
                </tbody>
            </table>
        `);

        expect(blocks.length).toBe(3);

        expect(blocks[0].getText()).toBe('some header');
        expect(blocks[0].getType()).toBe('header-two');
        expect(blocks[1].getText()).toBe('some paragraph');
        expect(blocks[1].getType()).toBe('unstyled');
        expect(blocks[2].getText()).toBe(' ');
        expect(blocks[2].getType()).toBe('atomic');

        const entityKey = blocks[2].getEntityAt(0);
        const entity = contentState.getEntity(entityKey);
        const {data} = entity.getData();

        expect(data.numCols).toEqual(3);
        expect(data.numRows).toEqual(4);

        const expected = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['10', '11', '12'],
        ];

        data.cells.forEach((row, i) =>
            row.forEach((cell, j) =>
                expect(convertFromRaw(data.cells[i][j]).getPlainText(''))
                    .toEqual(expected[i][j])));
    });

    it('should parse editor2 inline styles', () => {
        const {blocks} = blocksFor('<sub>1</sub><sup>2</sup><strike>3</strike>');

        expect(blocks[0].getText()).toBe('123');
        expect(blocks[0].getInlineStyleAt(0).toArray()).toEqual(['SUBSCRIPT']);
        expect(blocks[0].getInlineStyleAt(1).toArray()).toEqual(['SUPERSCRIPT']);
        expect(blocks[0].getInlineStyleAt(2).toArray()).toEqual(['STRIKETHROUGH']);
    });

    it('should parse editor2 block styles', () => {
        const {blocks} = blocksFor('<pre>text</pre>');

        expect(blocks[0].getType()).toBe('code-block');
    });

    it('should create an empty content state if html contains only invisible characters', () => {
        const {contentState} = blocksFor(`

            `);

        expect(contentState.getPlainText()).toEqual('');
    }),

    it('should parse Google Docs special paste', () => {
        const {blocks} = blocksFor('<b style="font-weight:normal;" id="docs-internal-guid-63c0f3a6-072a-245e-c39d-3f61398cba2c"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;margin-left: 21.25984251968504pt;text-indent: 14.173228346456693pt;text-align: justify;"><span style="font-size:12pt;font-family:Roboto;color:#333333;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">bold</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;margin-left: 21.25984251968504pt;text-indent: 14.173228346456693pt;text-align: justify;"><span style="font-size:12pt;font-family:Roboto;color:#333333;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">italic</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;margin-left: 21.25984251968504pt;text-indent: 14.173228346456693pt;text-align: justify;"><span style="font-size:12pt;font-family:Roboto;color:#333333;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">underline</span></p><br></b>');

        expect(blocks[0].getInlineStyleAt(0).toArray()).toEqual(['BOLD']);
        expect(blocks[1].getInlineStyleAt(0).toArray()).toEqual(['ITALIC']);
        expect(blocks[2].getInlineStyleAt(0).toArray()).toEqual(['UNDERLINE']);
        expect(blocks[0].getText()).toEqual('bold');
        expect(blocks[1].getText()).toEqual('italic');
        expect(blocks[2].getText()).toEqual('underline');
    });

    it('should add embeds as external in case association for ID is missing', () => {
        const html =
            '<p>Line 1-1</p>'
            + '<p><!-- EMBED START Image {id: "id123"} --><figure><img src="https://domain.com/image.jpg" alt="image-alt"><figcaption></figcaption></figure><!-- EMBED END Image {id: "id123"} --></p>"'
            + '<p>Line 2</p>';

        const contentState: ContentState = getContentStateFromHtml(html);

        expect(getRawContentStateWithoutBlockAndEntityKeys(convertToRaw(contentState))).toEqual({
            'blocks': [
                {
                    'text': 'Line 1-1',
                    'type': 'unstyled',
                    'depth': 0,
                    'inlineStyleRanges': [],
                    'entityRanges': [],
                    'data': {},
                },
                {
                    'text': ' ',
                    'type': 'atomic',
                    'depth': 0,
                    'inlineStyleRanges': [],
                    'entityRanges': [
                        {
                            'offset': 0,
                            'length': 1,
                        },
                    ],
                    'data': {},
                },
                {
                    'text': '"',
                    'type': 'unstyled',
                    'depth': 0,
                    'inlineStyleRanges': [],
                    'entityRanges': [],
                    'data': {},
                },
                {
                    'text': 'Line 2',
                    'type': 'unstyled',
                    'depth': 0,
                    'inlineStyleRanges': [],
                    'entityRanges': [],
                    'data': {},
                },
            ],
            'entityMap': {
                '0': {
                    'type': 'EMBED',
                    'mutability': 'MUTABLE',
                    'data': {
                        'data': {
                            'html': '<img src="https://domain.com/image.jpg" alt="image-alt">',
                        },
                        'description': '',
                    },
                },
            },
        });
    });
});
