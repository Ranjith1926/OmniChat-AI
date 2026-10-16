import Markdown, { type ASTNode, type RenderRules } from 'react-native-markdown-display';
import { Linking, Text as RNText } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { CodeBlock } from './CodeBlock';
import type { Theme } from '@/theme';

function getLanguage(node: ASTNode): string | undefined {
  return (node as unknown as { sourceInfo?: string }).sourceInfo?.trim() || undefined;
}

function buildRules(theme: Theme): RenderRules {
  return {
    fence: (node) => <CodeBlock key={node.key} code={node.content} language={getLanguage(node)} />,
    code_block: (node) => <CodeBlock key={node.key} code={node.content} language={getLanguage(node)} />,
    code_inline: (node) => (
      <RNText
        key={node.key}
        style={{
          fontFamily: theme.fontFamily.mono,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          paddingHorizontal: 4,
          borderRadius: theme.radius.sm,
          fontSize: theme.fontSize.sm,
        }}
      >
        {node.content}
      </RNText>
    ),
  };
}

function buildStyles(theme: Theme, textColor: string) {
  return {
    body: { color: textColor, fontSize: theme.fontSize.md, lineHeight: theme.lineHeight.md },
    heading1: { color: textColor, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold as '700', marginTop: theme.spacing.md },
    heading2: { color: textColor, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as '700', marginTop: theme.spacing.md },
    heading3: { color: textColor, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as '600', marginTop: theme.spacing.sm },
    strong: { fontWeight: theme.fontWeight.bold as '700' },
    link: { color: theme.colors.primary },
    bullet_list: { marginVertical: theme.spacing.xs },
    ordered_list: { marginVertical: theme.spacing.xs },
    list_item: { flexDirection: 'row' as const },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.border,
      paddingLeft: theme.spacing.md,
      opacity: 0.85,
    },
    table: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm },
    th: { padding: theme.spacing.xs, fontWeight: theme.fontWeight.semibold as '600' },
    td: { padding: theme.spacing.xs },
    hr: { backgroundColor: theme.colors.border, height: 1 },
  };
}

interface MarkdownRendererProps {
  content: string;
  textColor: string;
}

export function MarkdownRenderer({ content, textColor }: MarkdownRendererProps) {
  const theme = useAppTheme();

  return (
    <Markdown
      style={buildStyles(theme, textColor)}
      rules={buildRules(theme)}
      onLinkPress={(url) => {
        Linking.openURL(url).catch(() => {});
        return false;
      }}
    >
      {content}
    </Markdown>
  );
}
