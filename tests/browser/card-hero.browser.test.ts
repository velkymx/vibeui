import { render } from 'vitest-browser-vue'
import { expect, test, describe } from 'vitest'
import VibeHero from '../../src/components/VibeHero.vue'
import VibeCard from '../../src/components/VibeCard.vue'
import { waitForSelector } from './helpers'

// These run in real Chromium (not happy-dom): they confirm the components actually
// render and that the inline styles/classes resolve in a real layout engine — the
// thing static analysis and happy-dom can't prove.

describe('VibeHero (real browser)', () => {
  test('renders a <section> with a .container and visible slot content', async () => {
    const screen = render(VibeHero, { slots: { default: '<h1>Hello hero</h1>' } })
    const section = await waitForSelector('section')
    expect(section.querySelector('.container')).not.toBeNull()
    await expect.element(screen.getByRole('heading', { name: 'Hello hero' })).toBeVisible()
  })

  test('applies a real background-image (cover) for bgImage', async () => {
    render(VibeHero, { props: { bgImage: 'https://example.com/banner.jpg' }, slots: { default: 'x' } })
    const section = await waitForSelector('section') as HTMLElement
    const cs = getComputedStyle(section)
    expect(cs.backgroundImage).toContain('banner.jpg')
    expect(cs.backgroundSize).toContain('cover')
  })

  test('applies a real gradient background', async () => {
    render(VibeHero, { props: { gradient: 'linear-gradient(135deg, rgb(102, 126, 234), rgb(118, 75, 162))' }, slots: { default: 'x' } })
    const section = await waitForSelector('section') as HTMLElement
    expect(getComputedStyle(section).backgroundImage).toContain('linear-gradient')
  })

  test('layers a dark overlay over the background image', async () => {
    render(VibeHero, { props: { bgImage: 'https://example.com/banner.jpg', overlay: true }, slots: { default: 'x' } })
    const section = await waitForSelector('section') as HTMLElement
    const bg = getComputedStyle(section).backgroundImage
    expect(bg).toContain('linear-gradient')
    expect(bg).toContain('banner.jpg')
  })

  test('applies a real min-height and vertically centers content', async () => {
    render(VibeHero, { props: { minHeight: '300px' }, slots: { default: 'x' } })
    const section = await waitForSelector('section') as HTMLElement
    expect(getComputedStyle(section).minHeight).toBe('300px')
    expect(section.classList.contains('d-flex')).toBe(true)
    expect(section.classList.contains('align-items-center')).toBe(true)
  })

  test('background variant + border render as classes', async () => {
    render(VibeHero, { props: { variant: 'dark', border: 'primary' }, slots: { default: 'x' } })
    const section = await waitForSelector('section') as HTMLElement
    expect(section.classList.contains('bg-dark')).toBe(true)
    expect(section.classList.contains('border')).toBe(true)
    expect(section.classList.contains('border-primary')).toBe(true)
    expect(section.classList.contains('rounded-3')).toBe(true)
  })
})

describe('VibeCard (real browser)', () => {
  test('renders header, body and footer', async () => {
    render(VibeCard, {
      props: { header: 'H', footer: 'F' },
      slots: { default: '<p class="ph-body">Body</p>' }
    })
    await waitForSelector('.card .card-header')
    await waitForSelector('.card .card-body .ph-body')
    await waitForSelector('.card .card-footer')
  })

  test('image slot renders as a direct card child, before and outside .card-body', async () => {
    render(VibeCard, {
      props: {},
      slots: { image: '<div class="ph-overlay">IMG</div>', default: '<p class="ph-body">Body</p>' }
    })
    const card = await waitForSelector('.card')
    // present, and NOT inside card-body
    expect(card.querySelector('.ph-overlay')).not.toBeNull()
    expect(card.querySelector('.card-body .ph-overlay')).toBeNull()
    // direct child, before the body
    const kids = Array.from(card.children)
    const imgIdx = kids.findIndex(e => e.classList.contains('ph-overlay'))
    const bodyIdx = kids.findIndex(e => e.classList.contains('card-body'))
    expect(imgIdx).toBeGreaterThanOrEqual(0)
    expect(imgIdx).toBeLessThan(bodyIdx)
  })

  test('headerClass / bodyClass / footerClass land on the right sections', async () => {
    render(VibeCard, {
      props: { header: 'H', footer: 'F', headerClass: 'bg-primary text-white', bodyClass: 'p-5', footerClass: 'text-muted' },
      slots: { default: 'Body' }
    })
    const header = await waitForSelector('.card-header')
    const body = await waitForSelector('.card-body')
    const footer = await waitForSelector('.card-footer')
    expect(header.classList.contains('bg-primary')).toBe(true)
    expect(header.classList.contains('text-white')).toBe(true)
    expect(body.classList.contains('p-5')).toBe(true)
    expect(footer.classList.contains('text-muted')).toBe(true)
  })
})
