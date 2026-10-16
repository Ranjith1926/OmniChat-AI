import { Redirect } from 'expo-router';
import { useState } from 'react';

import { generateId } from '@/utils/id';

export default function Index() {
  const [newChatId] = useState(() => generateId());
  return <Redirect href={`/chat/${newChatId}`} />;
}
