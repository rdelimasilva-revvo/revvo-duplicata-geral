/**
 * Alias legado — use `Button` de components/ui/Button em código novo.
 * Mantido apenas para compatibilidade com imports existentes.
 */
import { Button } from './Button';

export type { ButtonProps as StandardButtonProps } from './Button';

const StandardButton = Button;

export default StandardButton;
