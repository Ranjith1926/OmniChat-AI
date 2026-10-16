import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Loader } from '@/components/atoms';
import { DEFAULT_TTS_MODEL } from '@/services/api/apiConfig';
import { synthesizeSpeech } from '@/services/api/gemini';
import { deleteStoredFile } from '@/services/storage/permanentFile';

interface SpeakButtonProps {
  text: string;
}

export function SpeakButton({ text }: SpeakButtonProps) {
  const theme = useAppTheme();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (audioUri) player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUri]);

  useEffect(() => {
    return () => {
      if (audioUri) deleteStoredFile(audioUri);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = async () => {
    if (error) setError(null);

    if (audioUri) {
      if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish) await player.seekTo(0);
        player.play();
      }
      return;
    }

    setIsSynthesizing(true);
    try {
      const result = await synthesizeSpeech({ model: DEFAULT_TTS_MODEL, text });
      setAudioUri(result.uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate speech.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <IconButton
      accessibilityLabel={status.playing ? 'Pause spoken reply' : 'Listen to reply'}
      size={28}
      onPress={handlePress}
      disabled={isSynthesizing}
    >
      {isSynthesizing ? (
        <Loader size="small" />
      ) : status.playing ? (
        <Pause size={14} color={theme.colors.textTertiary} />
      ) : (
        <Volume2 size={14} color={error ? theme.colors.danger : theme.colors.textTertiary} />
      )}
    </IconButton>
  );
}
