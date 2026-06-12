/**
 * Re-export do modal headless compartilhado (components/common/HeadlessModal).
 * Mantém a mesma API { isOpen, onClose, children, maxWidth } e adiciona
 * ESC para fechar + trava de scroll do body.
 */
export { HeadlessModal as Modal } from '@/components/common/HeadlessModal';
