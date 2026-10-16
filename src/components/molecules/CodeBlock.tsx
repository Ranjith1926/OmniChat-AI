import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import { useState } from 'react';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/styles/hljs';
import { ScrollView, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Text } from '@/components/atoms';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const theme = useAppTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={{ borderRadius: theme.radius.md, overflow: 'hidden', marginVertical: theme.spacing.sm, backgroundColor: theme.colors.codeBackground }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text variant="caption" color="rgba(255,255,255,0.6)">
          {language || 'code'}
        </Text>
        <IconButton accessibilityLabel="Copy code" size={28} onPress={handleCopy}>
          {copied ? <Check size={14} color="#fff" /> : <Copy size={14} color="rgba(255,255,255,0.7)" />}
        </IconButton>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={theme.scheme === 'dark' ? atomOneDark : atomOneLight}
          fontSize={13}
          customStyle={{ padding: theme.spacing.md, backgroundColor: 'transparent' }}
        >
          {code.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
}
