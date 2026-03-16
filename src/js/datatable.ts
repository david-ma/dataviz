import $ from 'jquery'
import 'datatables.net'
import * as DataTables from 'datatables.net'

export type DataTableConfig = DataTables.Config & {
  element?: string
  titles?: string[]
  render?: any
  customData?: {
    [key: string]: any
  }
  customRenderers?: {
    [key: string]: any
  }
  columns?: DataTables.ConfigColumns[]
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
): DataTables.Api<any> {
  const element = newOptions ? newOptions.element : '#dataset table'

  const columns = (
    newOptions?.titles ||
    dataset.columns ||
    Object.keys(dataset[0])
  ).map((d: any) => {
    return {
      title: d,
      data: d,
    }
  })

  const options: DataTableConfig = {
    info: false,
    paging: false,
    search: false,
    searching: false,
    data: dataset,
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

  return $(element).DataTable(options)
}

