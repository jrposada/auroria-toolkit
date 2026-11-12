import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DataTable from './data-table';

describe('Given <DataTable/>', () => {
  const html = renderToStaticMarkup(
    <DataTable
      caption="Attributes at level 32"
      columns={[
        { key: 'stat', label: 'Stat' },
        { key: 'total', label: 'Total', kind: 'number' },
        { key: 'delta', label: 'Change', kind: 'delta' },
      ]}
      rows={[
        { id: 'str', cells: { stat: 'STR', total: 84, delta: 6 } },
        { id: 'con', cells: { stat: 'CON', total: 40, delta: -2 } },
      ]}
    />
  );

  it('then it is a captioned table with column headers', () => {
    expect(html).toMatch(
      /<caption class="visually-hidden">Attributes at level 32<\/caption>/
    );
    expect(html.match(/scope="col"/g)).toHaveLength(3);
  });

  it('then the first cell of each row heads the row', () => {
    expect(html).toContain('<th scope="row">STR</th>');
    expect(html).toContain('<th scope="row">CON</th>');
  });

  it('then numeric cells are marked for alignment', () => {
    expect(html).toContain('<td data-kind="number">84</td>');
  });

  it('then a delta cell is signed, not coloured alone', () => {
    expect(html).toContain('<td data-kind="delta" data-sign="up">+6</td>');
    expect(html).toContain('<td data-kind="delta" data-sign="down">−2</td>');
  });
});
