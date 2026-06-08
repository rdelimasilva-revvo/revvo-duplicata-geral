import styled, { css } from 'styled-components';

export const WizardShell = styled.div`
  min-height: calc(100vh - 80px);
  background: #f5f6f7;
  display: flex;
  flex-direction: column;
`;

export const WizardHeader = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px 0;
`;

export const HeaderTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const HeaderIconBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0070f2, #005bc4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 112, 242, 0.25);
`;

export const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin: 0;
`;

export const HeaderSubtitle = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 2px 0 0;
  line-height: 1.4;
`;

export const StepperList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0 0 16px;
  display: flex;
  align-items: stretch;
  gap: 8px;
  overflow-x: auto;
`;

interface StepItemProps {
  $state: 'completed' | 'active' | 'upcoming';
  $clickable: boolean;
}

export const StepItem = styled.li<StepItemProps>`
  flex: 1 1 0;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid;
  background: #ffffff;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background 120ms ease, border-color 120ms ease;

  ${({ $state }) =>
    $state === 'active' &&
    css`
      border-color: #0070f2;
      background: rgba(0, 112, 242, 0.05);
    `}
  ${({ $state }) =>
    $state === 'completed' &&
    css`
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    `}
  ${({ $state }) =>
    $state === 'upcoming' &&
    css`
      border-color: #e5e7eb;
      background: #ffffff;
    `}

  &:hover {
    ${({ $clickable }) =>
      $clickable &&
      css`
        background: rgba(0, 112, 242, 0.08);
      `}
  }
`;

export const StepNumberBubble = styled.span<{ $state: 'completed' | 'active' | 'upcoming' }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;

  ${({ $state }) =>
    $state === 'active'
      ? css`
          background: #0070f2;
          color: #ffffff;
        `
      : $state === 'completed'
        ? css`
            background: #10b981;
            color: #ffffff;
          `
        : css`
            background: #f3f4f6;
            color: #6b7280;
          `}
`;

export const StepText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > span:first-child {
    font-size: 12px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.2;
  }

  & > span:last-child {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.3;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const ProgressTrack = styled.div`
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 16px;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => `${Math.max(0, Math.min(100, $percent))}%`};
  background: linear-gradient(90deg, #0070f2, #005bc4);
  transition: width 240ms ease;
`;

export const WizardBody = styled.main`
  flex: 1;
  padding: 24px;
  padding-bottom: 120px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

export const WizardFooter = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
  z-index: 30;

  @media (min-width: 1024px) {
    left: var(--sidebar-width, 16rem);
  }
`;

export const FooterInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const FooterHint = styled.p`
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  $disabled?: boolean;
}

export const WizardButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 140ms ease;
  border: 1px solid transparent;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  ${({ $variant }) =>
    $variant === 'primary' &&
    css`
      background: #0070f2;
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 112, 242, 0.25);
      &:hover:not(:disabled) {
        background: #005bc4;
        box-shadow: 0 4px 10px rgba(0, 112, 242, 0.25);
      }
    `}
  ${({ $variant }) =>
    $variant === 'success' &&
    css`
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(16, 185, 129, 0.25);
      &:hover:not(:disabled) {
        background: #059669;
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
      }
    `}
  ${({ $variant }) =>
    (!$variant || $variant === 'secondary') &&
    css`
      background: #ffffff;
      border-color: #e5e7eb;
      color: #4b5563;
      &:hover:not(:disabled) {
        background: #f9fafb;
        color: #0070f2;
        border-color: rgba(0, 112, 242, 0.4);
      }
    `}
  ${({ $variant }) =>
    $variant === 'ghost' &&
    css`
      background: transparent;
      color: #6b7280;
      &:hover:not(:disabled) {
        background: #f3f4f6;
        color: #111827;
      }
    `}
`;

export const StepCard = styled.section`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
`;

export const StepCardTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
`;

export const StepCardSubtitle = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 16px;
`;
