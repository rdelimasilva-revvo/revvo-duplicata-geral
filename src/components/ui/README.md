# UI Kit — Guia de Componentes

Fonte única de componentes reutilizáveis da aplicação. **Todo código novo deve importar daqui.**

## Botões

- **Usar:** `Button` de `components/ui/Button`
- Variantes: `primary` | `secondary` | `tertiary` | `ghost` | `danger` | `outline` | `success`
- Tamanhos: `sm` | `md` | `lg`
- Props: `loading` (spinner + disabled automático), `icon`, `fullWidth` + todas as props nativas de `<button>`
- ⚠️ **Aliases legados** (evitar em código novo, mantidos só por compatibilidade):
  - `components/ui/StandardButton` → re-export do Button canônico
  - `components/Revvo/ui/Button` → adapter fino (delega com `size="lg"`)

## Badges

- **Usar:** `Badge` de `components/ui/Badge`
- Variantes: `default` | `success` | `warning` | `danger` | `info` | `neutral`
- Tamanhos: `sm` | `md` | `lg`; aceita `icon`
- ⚠️ `components/Revvo/ui/Badge` é adapter legado — evitar em código novo.

## Ícones

- **Biblioteca oficial: `lucide-react`.** Não adicione novos imports de `@phosphor-icons/react` (em migração para remoção).

## Outros componentes

| Componente | Onde | Para quê |
|---|---|---|
| `Modal`, `ConfirmModal` | `components/ui/Modal` | Diálogos (ESC/overlay fecham; ConfirmModal para confirmações) |
| `Tooltip`, `HelpTooltip` | `components/ui/Tooltip` | Dicas em ícones e ajuda contextual |
| `Input` | `components/ui/Input` | Campo com validação integrada (prop `validate`) |
| `ErrorMessage` | `components/common/ErrorMessage` | Erros com título + mensagem + sugestão + retry |
| `SkeletonLoader` | `components/common/SkeletonLoader` | Loading de páginas data-heavy |
| `UndoToast` | `components/common/UndoToast` | Desfazer ações destrutivas (janela de 10s) |
| `UnsavedChangesModal` | `components/common/UnsavedChangesModal` | Confirmação de saída com alterações não salvas |

## Utilitários

- `utils/formatters.ts` — `formatCNPJ`, `formatCPF`, `formatCurrencyBRL`, `formatNumberBR`, `formatDatePtBR`, `formatDateTimePtBR`, `maskCurrencyInput`. **Sempre** use estes em vez de formatar inline.
- `utils/errorTranslation.ts` — `translateSupabaseError`, `getErrorDetails` (erros técnicos → português acionável).
- `utils/csvExport.ts` — `exportToCsv` (CSV com `;` e BOM UTF-8, compatível com Excel pt-BR).
- `hooks/useActionFeedback.ts` — `const { run, isRunning } = useActionFeedback()` padroniza toast de sucesso/erro + estado de loading em toda mutação.
- `hooks/useUnsavedChanges.ts` — proteção contra perda de alterações (usa `UnsavedChangesModal`).
