const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const files = [
  'src/modules/acordosComerciais/dashboard/components/AgreementsTable.tsx',
  'src/modules/acordosComerciais/dashboard/components/AgreementDrawer.tsx',
  'src/modules/acordosComerciais/pages/RevisaoPropostaSupplier.tsx',
  'src/modules/acordosComerciais/pages/RevisaoAcordoComercial.tsx',
  'src/modules/acordosComerciais/pages/SupplierAgreementView.tsx',
  'src/modules/acordosComerciais/pages/NovaPropostaAcordo.tsx',
  'src/modules/acordosComerciais/vincularCreditoWizard/components/Stepper.tsx',
  'src/modules/acordosComerciais/vincularCreditoWizard/steps/StepSelectCredit.tsx',
  'src/modules/acordosComerciais/vincularCreditoWizard/steps/StepConfirm.tsx',
  'src/modules/acordosComerciais/vincularCreditoWizard/steps/StepDistribute.tsx',
  'src/modules/acordosComerciais/vincularCreditoWizard/VincularCreditoWizard.tsx',
  'src/modules/acordosComerciais/components/DocumentCenter.tsx',
  'src/modules/acordosComerciais/components/DocumentsCard.tsx',
  'src/modules/acordosComerciais/components/ConflictResolutionDrawer.tsx',
  'src/modules/acordosComerciais/creditLinks/CreditLinkDrawer.tsx',
  'src/modules/escrituracaoDuplicata/EscrituracaoDuplicata.tsx',
  'src/modules/escrituracaoDuplicata/components/NovaDuplicataModal.tsx',
  'src/modules/escrituracaoDuplicata/components/InvoicesTableRow.tsx',
].map(f => path.join(ROOT, f));

const MAP = {
  X: 'X', Check: 'Check', Calendar: 'Calendar', Clock: 'Clock', Lock: 'Lock', Info: 'Info',
  Wallet: 'Wallet', Plus: 'Plus', Tag: 'Tag', Flag: 'Flag', Receipt: 'Receipt', Ticket: 'Ticket',
  Copy: 'Copy', CalendarCheck: 'CalendarCheck', FileText: 'FileText', ShieldCheck: 'ShieldCheck',
  ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', XCircle: 'XCircle', FileArchive: 'FileArchive',
  Sparkle: 'Sparkle',
  CaretUp: 'ChevronUp', CaretDown: 'ChevronDown', CaretRight: 'ChevronRight', CaretLeft: 'ChevronLeft',
  FunnelSimple: 'Filter', Funnel: 'Filter',
  MagnifyingGlass: 'Search',
  Scales: 'Scale',
  CheckCircle: 'CheckCircle2',
  WarningCircle: 'AlertCircle',
  Warning: 'AlertTriangle',
  CircleNotch: 'Loader2',
  PaperPlaneTilt: 'Send',
  CurrencyCircleDollar: 'CircleDollarSign',
  Buildings: 'Building2',
  Notepad: 'NotepadText',
  ArrowsClockwise: 'RefreshCw',
  Export: 'Share',
  FileArrowDown: 'FileDown',
  FileArrowUp: 'FileUp',
  Link: 'Link',
  LinkSimple: 'Link',
  ClockCounterClockwise: 'History',
  DownloadSimple: 'Download',
  ChatCircleText: 'MessageSquareText',
  ChatsCircle: 'MessagesSquare',
  SealCheck: 'BadgeCheck',
  FilePdf: 'FileText',
  FileXls: 'FileSpreadsheet',
  Trash: 'Trash2',
  MagicWand: 'Wand2',
  TrendUp: 'TrendingUp',
  PencilSimple: 'Pencil',
  CalendarBlank: 'Calendar',
  ArrowsLeftRight: 'ArrowLeftRight',
};

const PLACEHOLDER = '___LUCIDE_IMPORT_PLACEHOLDER___';
let migrated = 0;

for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const orig = src;
  const phosphorRe = /import\s*\{([^}]*)\}\s*from\s*['"]@phosphor-icons\/react['"];?/g;
  const lucideRe = /import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"];?/;

  const lucideMatch = src.match(lucideRe);
  const existingLucide = new Set();
  if (lucideMatch) {
    lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      const parts = s.split(/\s+as\s+/);
      existingLucide.add((parts[1] || parts[0]).trim());
    });
  }

  // collect specifiers from all phosphor imports
  const specs = [];
  let usesSemicolon = true;
  let m;
  let first = true;
  while ((m = phosphorRe.exec(src))) {
    if (first) { usesSemicolon = m[0].endsWith(';'); first = false; }
    m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      const parts = s.split(/\s+as\s+/);
      specs.push({ name: parts[0].trim(), alias: parts[1] ? parts[1].trim() : null });
    });
  }
  if (!specs.length) { console.log('SKIP (no phosphor):', f); continue; }

  // replace first phosphor import with placeholder, remove the rest (incl. trailing newline)
  let replacedFirst = false;
  src = src.replace(phosphorRe, () => {
    if (!replacedFirst) { replacedFirst = true; return PLACEHOLDER; }
    return '';
  });

  const newSpecs = [];
  const addedLocals = new Set();
  const renames = [];
  const notes = [];

  for (const { name, alias } of specs) {
    const mapped = MAP[name];
    if (!mapped) { notes.push('UNMAPPED: ' + name); continue; }
    if (alias) {
      if (!addedLocals.has(alias)) {
        addedLocals.add(alias);
        newSpecs.push(mapped === alias ? alias : `${mapped} as ${alias}`);
      }
    } else if (mapped === name) {
      if (!existingLucide.has(name) && !addedLocals.has(name)) {
        addedLocals.add(name);
        newSpecs.push(name);
      }
    } else {
      renames.push([name, mapped]);
      // collision detection: mapped name already present in body and not a lucide import
      const bodyNoPh = src.replace(PLACEHOLDER, '');
      if (!existingLucide.has(mapped) && new RegExp('\\b' + mapped + '\\b').test(bodyNoPh.replace(lucideRe, ''))) {
        notes.push(`COLLISION? ${name}->${mapped} (word "${mapped}" already in body)`);
      }
      if (!existingLucide.has(mapped) && !addedLocals.has(mapped)) {
        addedLocals.add(mapped);
        newSpecs.push(mapped);
      }
    }
  }

  // apply body renames (word boundary; placeholder is immune)
  for (const [from, to] of renames) {
    src = src.replace(new RegExp('\\b' + from + '\\b', 'g'), to);
  }

  // build/merge import
  if (lucideMatch && newSpecs.length) {
    // merge new specifiers into the existing lucide import
    const cur = src.match(lucideRe);
    const inner = cur[1].replace(/\s+$/, '').replace(/,\s*$/, '');
    const multiline = cur[1].includes('\n');
    const merged = multiline
      ? cur[0].replace(/,?\s*\}/, ',\n  ' + newSpecs.join(',\n  ') + ',\n}')
      : cur[0].replace(/\s*\}/, ', ' + newSpecs.join(', ') + ' }');
    src = src.replace(lucideRe, merged);
    // drop placeholder line
    src = src.replace(new RegExp(PLACEHOLDER + '\\n?'), '');
  } else if (newSpecs.length) {
    const stmt = `import { ${newSpecs.join(', ')} } from 'lucide-react'` + (usesSemicolon ? ';' : '');
    src = src.replace(PLACEHOLDER, stmt);
  } else {
    src = src.replace(new RegExp(PLACEHOLDER + '\\n?'), '');
  }
  // clean any leftover blank import lines from removed extra phosphor imports
  src = src.replace(/^\s*\n(?=import)/gm, (s, off) => s); // no-op safeguard

  // remove weight props
  const weightCount = (src.match(/\s+weight=(?:"[^"]*"|\{[^}]*\})/g) || []).length;
  src = src.replace(/\s+weight=(?:"[^"]*"|\{[^}]*\})/g, '');

  fs.writeFileSync(f, src, 'utf8');
  migrated++;
  console.log('OK:', path.basename(f),
    '| specs:', specs.map(s => s.alias ? `${s.name} as ${s.alias}` : s.name).join(','),
    '| renames:', renames.map(r => r.join('->')).join(','),
    '| weightRemoved:', weightCount,
    notes.length ? '| NOTES: ' + notes.join(' ; ') : '');
}
console.log('MIGRATED FILES:', migrated);
