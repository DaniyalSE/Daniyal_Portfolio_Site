import json, re
from playwright.sync_api import sync_playwright

B = 'http://localhost:4174/'
errors, bad_req, results = [], [], []
def check(n, c):
    results.append((n, bool(c))); print(('PASS ' if c else 'FAIL ') + n)

ROUTES = ['about', 'projects', 'skills', 'education', 'contact', 'project-cipherlink', 'project-hospital-dbms', 'project-brain-tumor-segmentation', 'project-dbms-implementation']
EXPECTED_LINKS = {
    'https://github.com/DaniyalSE/CipherLink', 'https://github.com/DaniyalSE/Hospital_DBMS',
    'https://github.com/DaniyalSE/brain-tumor-segmentation-yolo-sam', 'https://github.com/DaniyalSE/Database-Management-System-Implementation',
    'https://github.com/DaniyalSE/connectWithMe', 'https://github.com/DaniyalSE/spanishQuizForYusra', 'https://daniyalse.github.io/spanishQuizForYusra/',
    'https://github.com/DaniyalSE', 'https://linkedin.com/in/syeddaniyalnaqvi'}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True)
    pg = ctx.new_page()
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
    pg.on('requestfailed', lambda r: bad_req.append(r.url) if 'localhost' in r.url else None)
    pg.on('response', lambda r: bad_req.append(f'{r.status} {r.url}') if r.status >= 400 else None)

    pg.goto(B); pg.wait_for_timeout(600)
    check('loader shows initials', pg.get_by_text('S', exact=True).count() > 0 or pg.locator('.ld-char').count() == 3)
    pg.wait_for_timeout(2600)
    check('loader gone', pg.locator('.ld-char').count() == 0)
    check('root lands on About intro', pg.url.rstrip('/').endswith('4174') and "HELLO, I'M" in pg.locator('main').inner_text().upper())
    check('name headline', 'DANIYAL' in pg.locator('h1').first.inner_text().upper() and 'NAQVI' in pg.locator('h1').first.inner_text().upper())
    body = pg.locator('main').inner_text()
    check('professional title shown', 'AI & Machine Learning Enthusiast' in body and 'Software Developer' in body)
    check('intro + location + availability', 'passionate about building intelligent systems' in body and 'Chemnitz, Germany' in body and pg.get_by_text('Open to Werkstudent roles').count() > 0)
    check('three landing CTAs', pg.get_by_role('link', name='Explore my work').count() > 0 and pg.get_by_role('link', name='Download CV').count() > 0 and pg.get_by_role('link', name='Contact me').count() > 0)
    check('webgl visual rendered', pg.locator('main canvas').count() >= 1)
    check('real photo used', pg.locator('img[src*="me-dresden"]').count() == 1)
    for sec in ['My story', 'What I do', 'Education', 'Achievements', 'Current focus']:
        check(f'about section: {sec}', pg.get_by_text(sec, exact=True).count() > 0)
    check('three focus areas', all(t in body for t in ['Data Science & AI', 'Software Development', 'Database Engineering']))
    fonts = pg.evaluate("document.fonts.check('500 40px \"Space Grotesk\"')")
    check(f'Space Grotesk loaded ({fonts})', fonts)
    pg.goto(B + '#home'); pg.wait_for_timeout(1000)
    check('legacy #home -> About', 'HELLO' in pg.locator('main').inner_text().upper())

    # every route renders an h1 / content and title updates
    titles = {}
    for r in ROUTES:
        pg.goto(B + '#' + r); pg.wait_for_timeout(1500)
        h1 = pg.locator('main h1').first.inner_text() if pg.locator('main h1').count() else ''
        titles[r] = pg.title()
        check(f'route #{r} renders ({h1[:24]!r})', len(h1) > 2)
        for y in range(0, 14000, 1400):
            pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(60)
        pg.wait_for_timeout(500)
        broken = pg.evaluate("[...document.images].filter(i=>i.complete && i.naturalWidth===0).map(i=>i.src)")
        if broken: check(f'no broken images on #{r} {broken}', False)
    check('unique SEO titles', len(set(titles.values())) == len(titles))
    pg.goto(B + '#nope'); pg.wait_for_timeout(1200)
    check('404 route', pg.get_by_text('404').count() > 0 and pg.get_by_role('link', name='Back to About').count() == 1)

    # nav links
    pg.goto(B + '#contact'); pg.wait_for_timeout(1200)
    navtxt = pg.locator('nav[aria-label=Primary]').inner_text().replace('\n', ' ')
    check(f'nav order 01–05 ({navtxt})', [x for x in ['01.', 'ABOUT', '02.', 'PROJECTS', '03.', 'SKILLS', '04.', 'EDUCATION', '05.', 'CONTACT'] if x in navtxt.upper()] and navtxt.upper().index('ABOUT') < navtxt.upper().index('PROJECTS') < navtxt.upper().index('SKILLS') < navtxt.upper().index('EDUCATION') < navtxt.upper().index('CONTACT'))
    for label, h in [('Projects', 'projects'), ('Skills', 'skills'), ('Education', 'education'), ('Contact', 'contact'), ('About', 'about')]:
        pg.locator('nav[aria-label=Primary]').get_by_role('link', name=label).click(); pg.wait_for_timeout(1300)
        check(f'desktop nav {label}', pg.url.endswith('#' + h))

    # external links correctness
    hrefs = set()
    for r in ROUTES:
        pg.goto(B + '#' + r); pg.wait_for_timeout(1100)
        hrefs |= set(pg.eval_on_selector_all('a[href^="http"]', 'els => els.map(e => e.href)'))
    unknown = {h for h in hrefs if h not in EXPECTED_LINKS and 'fonts.' not in h}
    check(f'all external links are real ({len(hrefs)} found, unexpected: {unknown})', not unknown and EXPECTED_LINKS <= hrefs)
    blank = pg.eval_on_selector_all('a', 'els => els.filter(e => !e.getAttribute("href") || e.getAttribute("href") === "#").length')
    check('no empty/dead anchors', blank == 0)

    # projects page: all seven, with previews
    pg.goto(B + '#projects'); pg.wait_for_timeout(1500)
    txt = pg.locator('main').inner_text()
    check('all 7 projects listed', all(t in txt for t in ['CipherLink', 'Hospital DBMS', 'Brain Tumor', 'DBMS from Scratch', 'ConnectWithMe', 'Spanish Quiz', 'Smart City']))
    check('preview images for all 7', all(pg.locator(f'img[src*="{n}"]').count() > 0 for n in ['p-cipherlink', 'p-hospital', 'p-brain', 'p-dbms', 'p-connect', 'p-quiz', 'p-city']))
    check('only one live demo (verified)', pg.get_by_role('link', name='Live demo').count() == 1)
    # what-i-do rows link to real projects
    pg.goto(B); pg.wait_for_timeout(1200)
    pg.locator('a[href="#project-cipherlink"]', has_text='Software Development').click(); pg.wait_for_timeout(1500)
    check('focus-area row opens project', pg.url.endswith('#project-cipherlink'))

    # case study links
    pg.goto(B + '#project-cipherlink'); pg.wait_for_timeout(1500)
    check('case study github link', pg.locator('a[href="https://github.com/DaniyalSE/CipherLink"]').count() > 0)
    check('no fake demo on CipherLink', pg.get_by_text('No public live demo').count() == 1)
    check('code excerpt present', 'HKDF' in pg.locator('pre').inner_text())

    # CV download (normal host path)
    pg.goto(B); pg.wait_for_timeout(1600)
    with pg.expect_download() as d:
        pg.get_by_role('link', name='Download CV').first.click()
    dl = d.value
    path = dl.path(); head = open(path, 'rb').read(5)
    check(f'CV downloads as PDF ({dl.suggested_filename})', head == b'%PDF-' and dl.suggested_filename.endswith('_EN.pdf'))

    # constellation interaction
    pg.goto(B + '#skills'); pg.wait_for_timeout(1500)
    node = pg.locator('svg[role=img] g[role=button]', has_text='FastAPI').first
    node.evaluate('e=>e.scrollIntoView({block:"center"})'); pg.wait_for_timeout(1200); node.focus(); pg.wait_for_timeout(600)
    check('constellation tooltip shows project usage', pg.get_by_text('Used in: CipherLink').count() > 0)
    pg.get_by_role('button', name='Databases', exact=True).first.click(); pg.wait_for_timeout(400)
    check('category filter toggles', pg.get_by_role('button', name='Databases', exact=True).first.get_attribute('aria-pressed') == 'true')

    # contact validation + honest handoff
    pg.goto(B + '#contact'); pg.wait_for_timeout(1500)
    pg.get_by_role('button', name='Send message').click(); pg.wait_for_timeout(500)
    check('contact validation errors', pg.get_by_text('Please enter your name.').count() == 1 and pg.get_by_text('valid email').count() == 1)
    pg.fill('#c-name', 'Jane Recruiter'); pg.fill('#c-email', 'jane@company.de')
    pg.get_by_role('button', name='Werkstudent opportunity').click()
    check('topic chip fills subject', pg.input_value('#c-subject') == 'Werkstudent opportunity')
    pg.fill('#c-message', 'Hi Daniyal, we have a Werkstudent opening in our data team.')
    pg.get_by_role('button', name='Send message').click(); pg.wait_for_timeout(900)
    check('honest handoff state (not "sent")', pg.get_by_text('Your message is ready.').count() == 1 and pg.get_by_text('Message sent.').count() == 0)
    mailto = pg.get_by_role('link', name='Open in email app').get_attribute('href')
    check('mailto prefilled', mailto.startswith('mailto:naqvi.daniyal5301@gmail.com?subject=Werkstudent'))

    # command palette
    pg.keyboard.press('Control+k'); pg.wait_for_timeout(500)
    check('palette opens', pg.get_by_role('dialog', name='Command menu').count() == 1)
    pg.keyboard.type('brain'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1500)
    check('palette navigates', pg.url.endswith('#project-brain-tumor-segmentation'))

    # custom cursor
    pg.mouse.move(400, 400); pg.mouse.move(600, 420); pg.wait_for_timeout(300)
    check('custom cursor active on desktop', pg.evaluate("document.body.classList.contains('has-cursor')"))

    # responsive sizes: no horizontal overflow, mobile menu
    for w, h in [(1440, 900), (1024, 768), (768, 1024), (390, 844), (360, 740)]:
        c2 = b.new_context(viewport={'width': w, 'height': h}, is_mobile=w < 800, has_touch=w < 800)
        m = c2.new_page(); m.on('pageerror', lambda e: errors.append(f'{w}px ' + str(e)))
        m.goto(B); m.wait_for_timeout(3400)
        over = []
        for r in ROUTES[:5] + ['project-hospital-dbms']:
            m.goto(B + '#' + r); m.wait_for_timeout(1200)
            for y in range(0, 9000, 1500):
                m.evaluate(f'scrollTo(0,{y})'); m.wait_for_timeout(50)
            if m.evaluate('document.documentElement.scrollWidth > innerWidth + 1'): over.append(r)
        check(f'{w}px: no horizontal overflow {over}', not over)
        if w < 1024:
            m.goto(B + '#contact'); m.wait_for_timeout(1200)
            m.get_by_role('button', name='Open menu').click(); m.wait_for_timeout(1000)
            m.locator('#menu').get_by_role('link', name='Education').click(); m.wait_for_timeout(1400)
            check(f'{w}px: mobile menu navigates', m.url.endswith('#education'))
        c2.close()
    b.close()

print('\nCONSOLE/PAGE ERRORS:', json.dumps(errors[:15], indent=1))
print('FAILED LOCAL REQUESTS:', json.dumps(bad_req[:15], indent=1))
print(f"\n{sum(r for _, r in results)}/{len(results)} passed")
