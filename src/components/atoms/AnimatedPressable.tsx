import { useState } from 'react';
import { Pressable, type PressableProps, type PressableStateCallbackType } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'style' | 'children'> {
  /** How much to shrink on press — 0.96 (subtle) to 0.9 (pronounced). Defaults to 0.96. */
  pressScale?: number;
  style?: PressableProps['style'];
  children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
}

/**
 * Spring-based scale-on-press feedback, shared across Button/IconButton/cards so every
 * tappable element in the app moves with the same rhythm (per the design pass: motion
 * tokens should be unified, not ad hoc per component). Still forwards the normal
 * Pressable `pressed` render-prop/style-function so existing opacity treatments keep working.
 */
export function AnimatedPressable({ pressScale = 0.96, style, onPressIn, onPressOut, disabled, children, ...rest }: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const resolvedStyle = typeof style === 'function' ? style({ pressed, hovered: false }) : style;
  const resolvedChildren = typeof children === 'function' ? children({ pressed, hovered: false }) : children;

  return (
    <AnimatedPressableBase
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        // Reanimated SharedValue.value is a special mutable proxy; assigning it from an event
        // handler is the documented API, not a real React-state mutation (the react-compiler
        // lint rule doesn't know about Reanimated).
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(pressScale, { damping: 18, stiffness: 400 });
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        // eslint-disable-next-line react-hooks/immutability -- see onPressIn above.
        scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[animatedStyle, resolvedStyle]}
    >
      {resolvedChildren}
    </AnimatedPressableBase>
  );
}
