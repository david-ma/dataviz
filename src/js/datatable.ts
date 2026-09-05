import $ from 'jquery'
import DataTable from 'datatables.net'
import type { Api, Config, ConfigColumns } from 'datatables.net'

/**
 * Bun/ESM can load two jQuery copies. DataTables registers `$.fn.DataTable` on
 * the copy it imported at module init; `DataTable.use($)` only swaps the
 * internal `$` used later — it does *not* re-attach the plugin. So after use(),
 * re-register on our jQuery instance.
 */
DataTable.use($)
if (typeof ($.fn as any).DataTable !== 'function') {
  ;($ as any).fn.dataTable = DataTable
  DataTable.$ = $
  ;($ as any).fn.dataTableSettings = DataTable.settings
  ;($ as any).fn.dataTableExt = DataTable.ext
  ;($ as any).fn.DataTable = function (opts: Config) {
    return ($(this) as any).dataTable(opts).api()
  }
  Object.keys(DataTable).forEach((prop) => {
    ;($ as any).fn.DataTable[prop] = (DataTable as any)[prop]
  })
}

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

/**
 * Draw a DataTables.net table from an array of row objects.
 * Columns default to Object.keys(dataset[0]); override with options.element, options.columns, etc.
 *
 * Options:
 * - element: string - the element to draw the table into, defaults to `#dataset table`
 * - titles: string[] - the titles of the columns
 * - render: any - the render function to use, defaults to `d => d`
 * - customData: { [key: string]: any } - custom data to inject into the table
 * - customRenderers: { [key: string]: any } - custom renderers to use, defaults to `d => d`
 * - columns: DataTables.ConfigColumns[] - the columns to use, defaults to `Object.keys(dataset[0])`
 *
 * @param dataset - the dataset to draw the table from
 * @param newOptions - the options to use
 * @returns the DataTables.Api instance
 */
export function decorateTable(
  dataset: DataTableDataset,
  newOptions?: DataTableConfig,
): Api<any> {
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

  return new DataTable(element, options)
}
