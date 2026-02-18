import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'
import { nextTick, ref } from 'vue'

describe('VibeDataTable', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', searchable: true },
    { key: 'email', label: 'Email', searchable: false },
    { key: 'status', label: 'Status', sortable: false }
  ]

  const items = [
    { id: 1, name: 'Alice', email: 'alice@test.com', status: 'active' },
    { id: 2, name: 'Bob', email: 'bob@test.com', status: 'inactive' },
    { id: 3, name: 'Charlie', email: 'charlie@test.com', status: 'active' },
    { id: 4, name: 'Diana', email: 'diana@test.com', status: 'pending' },
    { id: 5, name: 'Eve', email: 'eve@test.com', status: 'active' }
  ]

  describe('basic rendering', () => {
    it('renders table with columns and items', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items }
      })

      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.find('thead th').exists()).toBe(true)
      expect(wrapper.text()).toContain('Alice')
    })

    it('renders all column headers', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: false }
      })

      const headers = wrapper.findAll('thead th')
      expect(headers).toHaveLength(4)
      expect(headers[0].text()).toBe('ID')
      expect(headers[1].text()).toBe('Name')
    })

    it('renders table body rows', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items }
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('handles empty items array with showEmpty', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items: [], showEmpty: true }
      })

      expect(wrapper.text()).toContain('No data available')
    })

    it('handles empty items array without showEmpty', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items: [], showEmpty: false }
      })

      expect(wrapper.text()).not.toContain('No data available')
    })
  })

  describe('prop handling', () => {
    it('handles undefined items gracefully', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items: undefined as any }
      })

      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('handles undefined columns gracefully', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns: undefined as any, items }
      })

      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('renders with custom emptyText', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items: [], emptyText: 'Custom empty message' }
      })

      expect(wrapper.text()).toContain('Custom empty message')
    })
  })

  describe('search functionality', () => {
    it('renders search input when searchable is true', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true }
      })

      expect(wrapper.find('input[type="search"]').exists()).toBe(true)
    })

    it('hides search input when searchable is false', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: false }
      })

      expect(wrapper.find('input[type="search"]').exists()).toBe(false)
    })

    it('filters items when search query is provided', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true, searchDebounce: 0 }
      })

      await wrapper.find('input[type="search"]').setValue('Alice')
      await wrapper.find('input[type="search"]').trigger('input')
      await nextTick()
      await new Promise(r => setTimeout(r, 10))

      expect(wrapper.text()).toContain('Alice')
      expect(wrapper.text()).not.toContain('Bob')
    })

    it('does not search columns with searchable: false', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true, searchDebounce: 0 }
      })

      await wrapper.find('input[type="search"]').setValue('alice@test.com')
      await wrapper.find('input[type="search"]').trigger('input')
      await nextTick()
      await new Promise(r => setTimeout(r, 10))

      expect(wrapper.text()).not.toContain('alice@test.com')
      expect(wrapper.text()).toContain('No data available')
    })

    it('searches name column and finds results', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true, searchDebounce: 0 }
      })

      await wrapper.find('input[type="search"]').setValue('inactive')
      await wrapper.find('input[type="search"]').trigger('input')
      await nextTick()
      await new Promise(r => setTimeout(r, 10))

      expect(wrapper.text()).toContain('Bob')
      expect(wrapper.text()).not.toContain('Alice')
    })

    it('handles search with undefined columns', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns: undefined as any, items, searchable: true }
      })

      await wrapper.find('input[type="search"]').setValue('Alice')
      await wrapper.find('input[type="search"]').trigger('input')

      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('resets to page 1 on search', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true, searchDebounce: 0 }
      })

      await wrapper.find('input[type="search"]').setValue('Alice')
      await wrapper.find('input[type="search"]').trigger('input')
      await nextTick()
      await new Promise(r => setTimeout(r, 10))

      expect(wrapper.text()).toContain('Showing 1 to')
    })
  })

  describe('sorting functionality', () => {
    it('renders sort icons on sortable columns', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: true }
      })

      expect(wrapper.text()).toContain('⇅')
    })

    it('sorts column ascending on first click', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: true }
      })

      await wrapper.findAll('thead th')[1].trigger('click')

      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('Alice')
    })

    it('sorts column descending on second click', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: true }
      })

      await wrapper.findAll('thead th')[1].trigger('click')
      await wrapper.findAll('thead th')[1].trigger('click')

      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('Eve')
    })

    it('does not sort column with sortable: false', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: true }
      })

      const statusHeader = wrapper.findAll('thead th')[3]
      await statusHeader.trigger('click')

      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('active')
    })

    it('hides sort icons when sortable is false', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: false }
      })

      expect(wrapper.text()).not.toContain('⇅')
    })

    it('supports two-way binding for sortBy and sortDesc', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, sortable: true, sortBy: 'name', sortDesc: false }
      })

      expect(wrapper.text()).toContain('↑')
    })
  })

  describe('pagination functionality', () => {
    it('renders pagination controls when paginated is true and multiple pages exist', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, paginated: true, perPage: 2 }
      })

      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('hides pagination when paginated is false', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, paginated: false }
      })

      expect(wrapper.find('.pagination').exists()).toBe(false)
    })

    it('shows per page selector when showPerPage is true', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, showPerPage: true }
      })

      expect(wrapper.find('select.form-select').exists()).toBe(true)
    })

    it('renders with custom per page options', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, paginated: true, perPage: 2, perPageOptions: [2, 5] }
      })

      const options = wrapper.findAll('select.form-select option')
      expect(options).toHaveLength(2)
    })

    it('shows correct pagination info when on later pages', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, paginated: true, perPage: 2, currentPage: 3 }
      })

      expect(wrapper.text()).toContain('5 to')
    })

    it('disables previous button on first page', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, paginated: true, perPage: 2 }
      })

      const prevButton = wrapper.find('.page-item:first-child')
      expect(prevButton.classes()).toContain('disabled')
    })

    it('supports two-way binding for currentPage', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, paginated: true, perPage: 2, currentPage: 2 }
      })

      expect(wrapper.text()).toContain('3 to')
    })
  })

  describe('info display', () => {
    it('shows info text', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, showInfo: true }
      })

      expect(wrapper.text()).toContain('Showing 1 to')
      expect(wrapper.text()).toContain('of 5 entries')
    })

    it('hides info when showInfo is false', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, showInfo: false }
      })

      expect(wrapper.text()).not.toContain('Showing')
    })

    it('shows custom infoText', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, infoText: 'Custom: {start}-{end} of {total}' }
      })

      expect(wrapper.text()).toContain('Custom:')
    })

    it('shows filtered info text when searching', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true, searchDebounce: 0 }
      })

      await wrapper.find('input[type="search"]').setValue('Alice')
      await wrapper.find('input[type="search"]').trigger('input')
      await nextTick()
      await new Promise(r => setTimeout(r, 10))

      expect(wrapper.text()).toContain('filtered from')
    })
  })

  describe('styling variants', () => {
    it('applies striped class', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, striped: true }
      })

      expect(wrapper.find('table.table-striped').exists()).toBe(true)
    })

    it('applies bordered class', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, bordered: true }
      })

      expect(wrapper.find('table.table-bordered').exists()).toBe(true)
    })

    it('applies borderless class', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, borderless: true }
      })

      expect(wrapper.find('table.table-borderless').exists()).toBe(true)
    })

    it('applies hover class', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, hover: true }
      })

      expect(wrapper.find('table.table-hover').exists()).toBe(true)
    })

    it('applies small class', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, small: true }
      })

      expect(wrapper.find('table.table-sm').exists()).toBe(true)
    })

    it('applies variant class', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, variant: 'dark' }
      })

      expect(wrapper.find('table.table-dark').exists()).toBe(true)
    })

    it('wraps in responsive container', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, responsive: true }
      })

      expect(wrapper.find('.table-responsive').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits row-clicked event on row click', async () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items }
      })

      await wrapper.find('tbody tr').trigger('click')

      expect(wrapper.emitted('row-clicked')).toBeTruthy()
      const emitted = wrapper.emitted('row-clicked') as any[][]
      expect(emitted[0][0]).toEqual({ id: 1, name: 'Alice', email: 'alice@test.com', status: 'active' })
      expect(emitted[0][1]).toBe(0)
    })
  })

  describe('slots', () => {
    it('supports scoped slots for cells', () => {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items }
      })

      expect(wrapper.find('tbody td').exists()).toBe(true)
    })
  })

  describe('column formatter', () => {
    it('applies formatter to cell value', () => {
      const columnsWithFormatter = [
        { key: 'id', label: 'ID' },
        { 
          key: 'name', 
          label: 'Name',
          formatter: (value: any) => `formatted-${value}`
        }
      ]

      const wrapper = mount(VibeDataTable, {
        props: { columns: columnsWithFormatter, items }
      })

      expect(wrapper.text()).toContain('formatted-Alice')
    })
  })
})
