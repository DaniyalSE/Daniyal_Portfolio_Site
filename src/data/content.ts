/* Single source of truth — every fact comes from the CV / brief. Nothing invented. */

export const PROFILE = {
  name: 'Syed Daniyal Haider Naqvi',
  short: 'Daniyal',
  initials: 'SDN',
  roles: ['Data Science Student', 'Software Developer', 'AI & Machine Learning Enthusiast'],
  headline: 'Data Science Student | Software Developer | AI & Machine Learning Enthusiast',
  intro:
    "I'm a Data Science student at TU Chemnitz, Germany, passionate about building intelligent systems, developing software, and exploring the intersection of AI and technology.",
  lookingFor: 'Werkstudent opportunities in Data Science, AI, Machine Learning, and Software Development.',
  location: 'Chemnitz, Germany',
  email: 'naqvi.daniyal5301@gmail.com',
  phone: '+49 163 1509881',
  phoneHref: 'tel:+491631509881',
  github: 'https://github.com/DaniyalSE',
  linkedin: 'https://linkedin.com/in/syeddaniyalnaqvi',
  cvEn: 'cv/Syed_Daniyal_Haider_Naqvi_CV_EN.pdf',
  cvDe: 'cv/Syed_Daniyal_Haider_Naqvi_CV_DE.pdf',
  objective: 'Seeking Werkstudent opportunities in Data Science, Machine Learning, AI and Software Development in Germany.',
  languages: [
    { name: 'Urdu', level: 'Native' },
    { name: 'English', level: 'C1 · IELTS Academic 8.0' },
    { name: 'German', level: 'A1 · course in progress' },
  ],
}

export type ProjectLink = { label: string; href: string }

export interface Project {
  id: string
  index: string
  title: string
  kicker: string
  date: string
  summary: string
  description: string
  stack: string[]
  features: string[]
  github: string
  demo?: string
  image?: string
  accent: string
  category: string
  excerpt: { file: string; lang: string; code: string; note: string }
}

export const PROJECTS: Project[] = [
  {
    id: 'cipherlink',
    index: '01',
    title: 'CipherLink',
    kicker: 'Security · Real-time',
    date: 'Dec 2025',
    category: 'Full-stack · Security',
    summary: 'End-to-end encrypted real-time messaging system.',
    description:
      'A secure real-time messaging platform. Messages are encrypted with AES-256-GCM, keys are agreed through ECDH on the P-256 curve, and self-deleting session keys provide perfect forward secrecy. Authentication uses one-time passwords and signed JWT sessions, protected by rate limiting and audit logging. Messages travel in real time over Socket.IO / WebSockets, with typing and presence indicators.',
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'SQLite', 'React', 'TypeScript', 'Vite', 'Socket.IO'],
    features: [
      'AES-256-GCM encryption',
      'ECDH P-256 key exchange',
      'Perfect forward secrecy via self-deleting session keys',
      'OTP authentication',
      'Signed JWT sessions',
      'Rate limiting',
      'Audit logging',
      'Real-time messaging with typing & presence',
    ],
    github: 'https://github.com/DaniyalSE/CipherLink',
    image: 'img/p-cipherlink.webp',
    accent: '#537BFF',
    excerpt: { file: "backend/pfs/ecdh_service.py", lang: "python", note: "An ephemeral P-256 key pair per session: the shared secret is run through HKDF-SHA256, and the session key expires after ten minutes.", code: "shared_secret = private_key.exchange(ec.ECDH(), client_public_key)\nderived_key = HKDF(\n    algorithm=hashes.SHA256(),\n    length=32,\n    salt=None,\n    info=b\"cipherlink-pfs\",\n).derive(shared_secret)\n\nsession.shared_key_fingerprint = hashlib.sha256(derived_key).hexdigest()\nsession.status = \"active\"\nsession.expires_at = _now() + timedelta(minutes=10)" },
  },
  {
    id: 'hospital-dbms',
    index: '02',
    title: 'Hospital DBMS Console',
    kicker: 'Databases · Ops',
    date: 'Dec 2025',
    category: 'Full-stack · Databases',
    summary: 'A full-stack MongoDB operations console.',
    description:
      'A full-stack console for MongoDB Atlas, built around a hospital data model. It includes an aggregation pipeline builder, an index manager, execution statistics and predefined pipelines for complex queries. Optimistic locking guards concurrent edits with versioned updates, a real-time dashboard visualises read/write locks, change streams push live updates, and a NoSQL injection lab compares attacks with their countermeasures.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'WebSockets', 'Zod'],
    features: [
      'Aggregation pipeline builder',
      'Index manager',
      'Execution statistics',
      'Optimistic locking (versioned updates)',
      'Real-time read/write lock dashboard',
      'MongoDB change streams',
      'NoSQL injection demonstration lab',
    ],
    github: 'https://github.com/DaniyalSE/Hospital_DBMS',
    image: 'img/p-hospital.webp',
    accent: '#8B5CF6',
    excerpt: { file: "server/routes/collections.ts", lang: "typescript", note: "Optimistic locking: an update only matches the version the client last saw, and a stale write returns HTTP 409 instead of silently overwriting.", code: "const filter = { ...idFilter, $or: versionFilters }\n\nconst result = await collection.updateOne(filter, {\n  $set: { ...sanitized, updatedAt: new Date() },\n  $inc: { [VERSION_FIELD]: 1 },\n})\n\nif (!result.matchedCount) {\n  return res.status(409).json({\n    message: \"Version conflict: document was updated by someone else.\",\n  })\n}" },
  },
  {
    id: 'brain-tumor-segmentation',
    index: '03',
    title: 'Brain Tumor Segmentation',
    kicker: 'Deep Learning · Vision',
    date: 'Jun 2025',
    category: 'Machine Learning',
    summary: 'Deep-learning medical image analysis with YOLOv11 & SAM.',
    description:
      'A two-stage pipeline for MRI analysis: YOLOv11 detects and localises brain tumours, then Segment Anything (SAM) outlines them precisely. An interactive Streamlit app makes visualisation and inference accessible.',
    stack: ['Python', 'PyTorch', 'YOLOv11', 'SAM', 'OpenCV', 'NumPy', 'Pandas', 'Streamlit'],
    features: ['Tumour detection with YOLOv11', 'Segmentation with Segment Anything', 'MRI image analysis', 'Interactive Streamlit interface'],
    github: 'https://github.com/DaniyalSE/brain-tumor-segmentation-yolo-sam',
    image: 'img/p-brain.webp',
    accent: '#6E8CFF',
    excerpt: { file: "app.py", lang: "python", note: "YOLO's bounding boxes become the prompts for Segment Anything \u2014 detection first, then pixel-level segmentation.", code: "boxes = results[0].boxes\nclass_ids = boxes.cls.int().tolist()\n\nif len(class_ids):\n    xyxy_boxes = boxes.xyxy.cpu()\n    orig_img = results[0].orig_img\n    device = \"cuda\" if torch.cuda.is_available() else \"cpu\"\n    sam_results = sam_model(orig_img, bboxes=xyxy_boxes,\n                            verbose=False, save=False, device=device)\n    mask = sam_results[0].masks.data[0].cpu().numpy() * 255" },
  },
  {
    id: 'dbms-implementation',
    index: '04',
    title: 'DBMS from Scratch',
    kicker: 'Systems · Java',
    date: 'Jan 2025',
    category: 'Systems',
    summary: 'A database management system developed from scratch.',
    description:
      'A database management system written from the ground up in Java, with a case-insensitive custom query language, indexing, transactions and file-based persistence in CSV/TSV — built with object-oriented design.',
    stack: ['Java', 'Object-Oriented Programming'],
    features: ['Custom case-insensitive query language', 'CREATE · DROP · SHOW · INSERT · SELECT · UPDATE · DELETE', 'Indexing', 'Transactions', 'CSV / TSV file persistence'],
    github: 'https://github.com/DaniyalSE/Database-Management-System-Implementation',
    image: 'img/p-dbms.webp',
    accent: '#A78BFA',
    excerpt: { file: "pro.java", lang: "java", note: "The hand-written parser behind the case-insensitive query language.", code: "String[] parts = selectCommand.split(\" \");\n\nif (parts.length < 10 || !\"FROM\".equalsIgnoreCase(parts[1])\n        || !\"TABLE\".equalsIgnoreCase(parts[2])\n        || !\"HAVING\".equalsIgnoreCase(parts[4])\n        || !\"SORT\".equalsIgnoreCase(parts[8])\n        || !\"BY\".equalsIgnoreCase(parts[9])) {\n    throw new IllegalArgumentException(\n        \"Error: Invalid SELECT syntax. Use SELECT FROM TABLE table_name \"\n        + \"HAVING column = value SORT BY column\");\n}" },
  },
]

export const MORE_PROJECTS: { title: string; text: string; stack: string[]; github?: string; demo?: string; image: string }[] = [
  { title: 'ConnectWithMe', text: 'Personal portfolio and connect page.', stack: ['HTML', 'CSS', 'JavaScript'], github: 'https://github.com/DaniyalSE/connectWithMe', image: 'img/p-connect.webp' },
  { title: 'Spanish Quiz', text: 'Interactive vocabulary quiz app, deployed via GitHub Pages.', stack: ['React', 'Vite', 'TypeScript'], github: 'https://github.com/DaniyalSE/spanishQuizForYusra', demo: 'https://daniyalse.github.io/spanishQuizForYusra/', image: 'img/p-quiz.webp' },
  { title: 'Smart City Resource Management', text: 'Monitoring of water, electricity and waste with role-based access.', stack: ['Java', 'Swing', 'GSON'], image: 'img/p-city.webp' },
]

export interface SkillGroup {
  id: string
  label: string
  color: string
  items: string[]
}

export const SKILLS: SkillGroup[] = [
  { id: 'prog', label: 'Programming', color: '#537BFF', items: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'SQL'] },
  { id: 'ml', label: 'Machine Learning', color: '#8B9CFF', items: ['PyTorch', 'YOLOv11', 'Segment Anything', 'OpenCV', 'NumPy', 'Pandas', 'Streamlit'] },
  { id: 'web', label: 'Web Development', color: '#6FB4FF', items: ['React', 'Vite', 'FastAPI', 'Express', 'Node.js', 'TypeScript', 'Tailwind CSS'] },
  { id: 'db', label: 'Databases', color: '#A9B8FF', items: ['MongoDB', 'SQLite', 'SQLAlchemy', 'SQL'] },
  { id: 'tools', label: 'Tools', color: '#C9CDD6', items: ['Git', 'GitHub', 'Docker', 'VS Code'] },
]

export const SECURITY = ['AES-256-GCM', 'ECDH key exchange', 'JWT', 'OTP authentication', 'Rate limiting']

export const INTERESTS = ['Data Science', 'Artificial Intelligence', 'Machine Learning', 'Full-Stack Development', 'Backend Engineering', 'Database Systems', 'Cybersecurity']

/** Which projects use which skill — derived only from the stacks above. */
export function projectsUsing(skill: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, '')
  const alias: Record<string, string[]> = {
    'segmentanything': ['sam'],
    websockets: ['websockets', 'websocket'],
    'tailwindcss': ['tailwindcss'],
    'objectorientedprogramming': ['java'],
  }
  const keys = [norm(skill), ...(alias[norm(skill)] ?? [])]
  return PROJECTS.filter((p) => p.stack.some((s) => keys.includes(norm(s)))).map((p) => p.title)
}

export interface TimelineItem {
  date: string
  title: string
  place: string
  type: 'education' | 'project' | 'award' | 'volunteer'
  text?: string
  current?: boolean
}

export const TIMELINE: TimelineItem[] = [
  { date: '10/2026 — now', title: 'B.Sc. Data Science', place: 'Technische Universität Chemnitz, Germany', type: 'education', current: true, text: 'Moved to Germany to focus fully on data science, statistics and machine learning.' },
  { date: '12/2025', title: 'CipherLink & Hospital DBMS Console', place: 'Personal projects', type: 'project', text: 'An end-to-end encrypted chat system and a full-stack MongoDB operations console.' },
  { date: '2025', title: '1st Place — Speed Coding Competition', place: 'Google Developer Student Club, COMSATS University Islamabad', type: 'award' },
  { date: '2025', title: 'Volunteer', place: 'Alkhidmat Foundation', type: 'volunteer', text: 'Organised donations for families affected by the floods.' },
  { date: '06/2025', title: 'Brain Tumor Segmentation (YOLOv11 + SAM)', place: 'Machine-learning project', type: 'project', text: 'First end-to-end deep-learning pipeline: detection, segmentation and a Streamlit interface.' },
  { date: '01/2025', title: 'DBMS from scratch', place: 'Systems project in Java', type: 'project', text: 'Custom query language, indexing, transactions and CSV/TSV persistence.' },
  { date: '2024 — 2026', title: 'Member', place: 'Akhyar-e-Kul Social Welfare Society, COMSATS', type: 'volunteer', text: 'Community projects.' },
  { date: '02/2024 — 2026', title: 'B.S. Computer Science · 4 semesters', place: 'COMSATS University Islamabad, Pakistan', type: 'education', text: 'CGPA 3.30 / 4.00 · Data structures & algorithms, OOP (Java), advanced database systems, SQL, MongoDB, Docker, ICT with Python.' },
  { date: '2020 — 2022', title: 'Intermediate (HSSC) · 92.7%', place: 'Narowal Public School and College, Pakistan', type: 'education', text: '1020 / 1100 marks · Focus on mathematics, statistics and sciences.' },
  { date: '2021', title: 'Fully funded scholarship', place: 'For Intermediate studies', type: 'award', text: 'Awarded for 96% in Matriculation.' },
  { date: 'Before 2020', title: 'Matriculation (SSC) · 96.4%', place: 'Narowal Public School and College, Pakistan', type: 'education', text: '1060 / 1100 marks · Focus on mathematics, statistics and sciences.' },
]

export const ACHIEVEMENTS = [
  { year: '2025', title: '1st Place, Speed Coding Competition', org: 'Google Developer Student Club, COMSATS' },
  { year: '2021', title: 'Fully Funded Scholarship', org: 'Intermediate studies · awarded for 96% in Matriculation' },
  { year: '2025', title: 'Volunteer', org: 'Alkhidmat Foundation · flood-relief donations' },
]
