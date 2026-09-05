/**
 * Draw a DataTables.net table from an array of row objects.
 *
 * DataTables is loaded lazily so Node/bun unit tests can import `chart.ts`
 * without pulling DataTables' nested jQuery (which requires a DOM at import time).
 */
import $ from 'jquery'
import type { Api, Config, ConfigColumns } from 'datatables.net'

export type DataTableConfig = Config & {
  element?: string
  titles?: string[]
  render?: any
  customData?: {
    [key: string]: any
  }
  customRenderers?: {
    [key: string]: any
  }
  columns?: ConfigColumns[]
}

export type DataTableDataset = Array<any> & {
  columns?: Array<string>
  [key: string]: any
}

type DataTableCtor = {
  new (selector: string | Node | JQuery, options?: Config): Api<any>
  use: (jquery: JQueryStatic) => void
  $?: JQueryStatic
  settings?: unknown
  ext?: unknown
  [key: string]: unknown
}

let DataTable: DataTableCtor | null = null

function ensureDataTable(): DataTableCtor {
  if (DataTable) return DataTable

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('datatables.net') as { default?: DataTableCtor } & DataTableCtor
  const DT = (mod.default ?? mod) as DataTableCtor

  /**
   * Bun/ESM can load two jQuery copies. DataTables registers `$.fn.DataTable` on
   * the copy it imported at module init; `DataTable.use($)` only swaps the
   * internal `$` — it does *not* re-attach the plugin. Re-register on ours.
   */
  DT.use($)
  if (typeof ($.fn as any).DataTable !== 'function') {
    ;($ as any).fn.dataTable = DT
    DT.$ = $
    ;($ as any).fn.dataTableSettings = DT.settings
    ;($ as any).fn.dataTableExt = DT.ext
    ;($ as any).fn.DataTable = function (opts: Config) {
      return ($(this) as any).dataTable(opts).api()
    }
    Object.keys(DT).forEach((prop) => {
      ;($ as any).fn.DataTable[prop] = DT[prop]
    })
  }

  DataTable = DT
  return DT
}

/**
 * Draw a DataTables.net table from an array of row objects.
 * Columns default to Object.keys(dataset[0]); override with options.element, options.columns, etc.
 */
export function decorateTable(
  dataset: DataTableDataset,
  newOptions?: DataTableConfig,
): Api<any> {
  const DT = ensureDataTable()
  const element = newOptions?.element ?? '#dataset table'
  const rows = Array.isArray(dataset) ? dataset : []

  let columns: ConfigColumns[]
  if (newOptions?.columns?.length) {
    columns = newOptions.columns.map((col) => ({ ...col }))
  } else {
    const keys =
      newOptions?.titles ||
      dataset.columns ||
      (rows[0] && typeof rows[0] === 'object' ? Object.keys(rows[0]) : [])
    columns = keys.map((d: string) => ({
      title: d,
      data: d,
    }))
  }

  const options: DataTableConfig = {
    info: false,
    paging: false,
    search: false,
    searching: false,
    data: rows,
    pageLength: 25,
    order: [[0, 'desc']],
    columns,
    columnDefs: [
      {
        targets: '_all',
        defaultContent: '',
      },
    ],
  }

  if (newOptions) {
    Object.keys(newOptions).forEach((key) => {
      if (key === 'columns') return // already applied above
      ;(options as any)[key] = (newOptions as any)[key]
    })
    if (newOptions.titles) {
      newOptions.titles.forEach((d: string, i: number) => {
        if (options.columns && options.columns[i]) {
          options.columns[i].title = d
        }
      })
    }
    if (newOptions.render && options.columns) {
      options.columns.forEach((d) => {
        d.render = newOptions.render
      })
    }
    if (newOptions.customRenderers && options.columns) {
      Object.keys(newOptions.customRenderers).forEach((key) => {
        const index = options.columns!.findIndex((d) => d.data === key)
        if (index >= 0) {
          options.columns![index].render = newOptions.customRenderers![key]
        }
      })
    }
    if (newOptions.customData && options.columns) {
      Object.keys(newOptions.customData).forEach((key) => {
        const index = options.columns!.findIndex((d) => d.data === key)
        if (index >= 0) {
          options.columns![index].data = newOptions.customData![key]
        }
      })
    }
  }

  return new DT(element, options)
}
